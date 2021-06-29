'use strict';
const grunt = require("grunt");
const dateFormat = require('dateformat');

module.exports = function (grunt) {
    grunt.registerTask('job-logs', 'Description: Download Job Logs from SFCC Server', function () {
        var done = this.async();
        processJobLogInformation(grunt.config('constants.options'), function (status) {
            done(status);
        });
    });
}

/**
 *  Establishes Connection to the Server and gets the Log File Information.
 *  Processes the Information depending on criteria in sub-functions.
 *  Arguments: Grunt Option, Callback fn.
*/
function processJobLogInformation(option, _callback) {
    var https = require('https');
    option.formatted_date = dateFormat(option.log_date, 'yyyymmdd');
    grunt.log.ok('Date Today: ' + option.formatted_date)
    var request = https.get({
        rejectUnauthorized: false,
        host: option.webdav_server,
        path: option.webdav_joblog_path,
        auth: option.webdav_username + ':' + option.webdav_password,
        method: 'PROPFIND'
    }, function (response) {
        grunt.log.writeln('Status: ' + response.statusCode);
        var str = '';

        response.on('data', function (data) {
            str += data;
        });

        response.on('end', function () {
            if (str.indexOf('401 - Authorization Required') !== -1) {
                throw ('401 - Authorization Required');
            } else {
                grunt.log.ok('Login Successful.');
                /* Process XML Data */
                getJobLogsFilesListFromResponseObject(str, option, function (arrNamesObj) {
                    if (arrNamesObj != null && arrNamesObj.length > 0) {
                        grunt.log.ok('Files List Size: ' + arrNamesObj.length);
                        var count = 0;
                        /* Run Array to download each file */
                        arrNamesObj.forEach(function (param) {
                            /* Download the Log File and write in local in the callback */
                            downloadJobLogsFromList(param, option, function (message) {
                                if (message.indexOf('Job-Log Exception: ') > 0) {
                                    _callback(false);
                                } else {
                                    /* In case there are no exceptions write the file to local */
                                    writeLogtoFile(message, param, option, function (completed) {
                                        completed ? count += 1 : count;
                                    });
                                }
                                /* If all of the elements are processed return to parent callback to finish */
                                if (count == arrNamesObj.length) {
                                    _callback(true);
                                }
                            });
                        });

                    } else {
                        grunt.log.writeln('There are no files to download from the server');
                        _callback(false);
                    }
                });
            }
        });
    });
    request.on('error', function (err) {
        grunt.log.error(err.message);
        _callback(false);
    });
    request.end();
}

/**
 *  Get relevant Job File List Only 
 *  Arguments: XML Response Data, Grunt Option, Callback fn.
 **/
function getJobLogsFilesListFromResponseObject(xmlResponse, option, _callback_c) {
    var parseString = require('xml2js').parseString;
    var searchDate = dateFormat(option.log_date, 'yyyy-mm-dd');
    var searchDateZulu = dateFormat(option.log_date_zulu, 'yyyy-mm-dd');
    grunt.log.ok('Current Date to Search with: ' + searchDate + ' in ZULU: ' + searchDateZulu);
    // grunt.log.writeln(xmlResponse);
    parseString(xmlResponse, function (err, result) {
        if (err) {
            grunt.log.error(err);
            _callback_c(null);
        } else {
            var arrFileNames = [];
            var jsonResponse = JSON.parse(JSON.stringify(result));
            Object.keys(jsonResponse.multistatus.response).forEach(function (recordCount) {
                var dateFilter = JSON.stringify(jsonResponse.multistatus.response[recordCount].propstat[0].prop[0].creationdate[0]);
                var fileFilter = JSON.stringify(jsonResponse.multistatus.response[recordCount].href);
                if ((((dateFilter.indexOf(searchDate) > 0) || ((dateFilter.indexOf(searchDateZulu) > 0)))
                    && (!(fileFilter.indexOf('Job-sfcc') > 0 || fileFilter.indexOf('export-CQuotient') > 0)))) {
                    arrFileNames.push(jsonResponse.multistatus.response[recordCount].href[0]);
                    grunt.log.writeln('File Match: ' + jsonResponse.multistatus.response[recordCount].href[0]);
                }
            });
            _callback_c(arrFileNames);
        }
    });
}

/**
 *  Download Log Files from the Physical Location
 *  Arguments: File Name, Grunt Option, Callback fn.
*/
function downloadJobLogsFromList(fileName, option, _callback_b) {
    var https = require('https');
    var status = false;
    var req = https.get({
        rejectUnauthorized: false,
        host: option.webdav_server,
        path: fileName,
        auth: option.webdav_username + ':' + option.webdav_password,
    }, function (resp) {
        var responseData = '';
        resp.on('data', function (chunk) {
            responseData += chunk;
        });
        resp.on('end', function () {
            // grunt.log.writeln('>>>>' + responseData + '<<<<');
            _callback_b(responseData);
        })
    });

    req.on('error', function (err) {
        grunt.log.error('[downloadJobLogsFromList] ' + err.message);
        _callback_b('Job-Log Exception: ' + err.message);
    });
    req.end();
}

/**
 *  Write to File System in the specified Path
 *  Arguments: Log contents, Filename, Option
*/
function writeLogtoFile(logContents, fileName, option, _callback_a) {
    try {
        var path = require('path');
        var fs = require('fs');
        var outputFile = fileName.replace(option.webdav_joblog_path, '');
        if (outputFile.length > 0) {
            fs.writeFileSync(path.join(option.joblog_dir, outputFile), logContents);
            grunt.log.ok('Downloaded Sucessfully: ' + outputFile);
        }
    } catch (err) {
        grunt.log.error('[writeLogtoFile]: ' + err.message);
    } finally {
        _callback_a(true);
    }
}

/**
 *  Dummy function to test HTTPs connectivity
 *  Do Not use this unless required to stub out and test connectivity
 */
function dummyHTTPsCall(callback) {
    const url = 'https://jsonplaceholder.typicode.com/todos/1';

    const request = https.request(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data = data + chunk.toString();
        });

        response.on('end', () => {
            const body = JSON.parse(data);
            console.log(body);
        });
    })

    request.on('error', (error) => {
        console.log('An error', error);
    });

    request.end()
}
