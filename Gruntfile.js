'use strict';

module.exports = function (grunt) {
    require('time-grunt')(grunt);
    const fs = require('fs')

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-contrib-compress');

    var path = require('path');
    var configData;

    try {
        /**
         *  Environment Constants from config.json file
         *  Rename the config.json.sample file and enter the values as displayed
         */
        configData = fs.readFileSync('./config.json', 'utf8')
        configData = JSON.parse(configData);
        // grunt.log.writeln(JSON.stringify(configData));
        // grunt.log.writeln(configData.default_job_log_dir);
    } catch (err) {
        grunt.log.error('Error Reading the config.json file: ' + err.message);
    }

    var default_log_date = new Date();
    var default_log_date_zulu = new Date((new Date()).valueOf() + 1000 * 3600 * 24);

    // Do Not Change the variable settings below.
    var WEBDAV_JOB_LOG_PATH = '/on/demandware.servlet/webdav/Sites/Impex/log/';

    grunt.initConfig({
        clean: {
            options: {
                'force': true
            },
            src: [configData.default_job_log_dir]
        },
        mkdir: {
            all: {
                options: {
                    'force': true,
                    create: [configData.default_job_log_dir]
                }
            }

        },
        compress: {
            main: {
                options: {
                    archive: path.join(configData.default_job_log_dir, 'job-logs.zip'),
                    mode: 'zip'
                },
                files: [{
                    expand: true,
                    src: ['**/*.log'],
                    cwd: configData.default_job_log_dir,
                }]
            }
        },
        constants: {
            options: {
                webdav_server: configData.default_webdav_server,
                webdav_username: configData.default_webdav_username,
                webdav_password: configData.default_webdav_password,
                log_date: default_log_date,
                log_date_zulu: default_log_date_zulu,
                formatted_date: '',
                joblog_dir: configData.default_job_log_dir,
                webdav_joblog_path: WEBDAV_JOB_LOG_PATH
            }
        },
        sftp: {
            options: {
                sftp_user: configData.default_sftp_user,
                sftp_password: configData.default_sftp_password,
                sftp_host: configData.default_sftp_host,
                sys_local: configData.default_job_log_dir,
                sftp_remote: configData.default_sftp_remote
            }
        }
    });
    /**
     * Load Tasks here from the /tasks folder.
     */
    grunt.loadTasks('./tasks');

    /**
     * Register the "default" task to execute from command line
     */
    grunt.registerTask('default', ['clean', 'mkdir', 'job-logs', 'compress', 'sftp-job-logs']);
}