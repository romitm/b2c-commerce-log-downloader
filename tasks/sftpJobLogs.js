'use strict';
const grunt = require('grunt');

module.exports = function (grunt) {
    grunt.registerTask('sftp-job-logs', 'Description: SFTP Job Logs to a Remote SFTP location', function () {
        var done = this.async();
        sftpFilesToRemoteServer(grunt.config('sftp.options'), function (status) {
            done(status);
        });
    });
}

/**
 *  Upload Log Zip files to a remote SFTP target.
 *  Args: Grunt Options, Callback function for the Async call
 */
function sftpFilesToRemoteServer(option, _callback_a) {
    if ((option.sftp_host !== '') || (option.sftp_user !== '') || (option.sftp_remote !== '')) {
        grunt.log.ok('Final Task to Upload Log Files Zip to the SFTP.');
        var FtpDeploy = require('ftp-deploy');
        var ftpDeploy = new FtpDeploy();
        var config = {
            user: option.sftp_user,
            password: option.sftp_password,
            host: option.sftp_host,
            port: 22,
            localRoot: option.sys_local,
            remoteRoot: option.sftp_remote,
            include: ['*.zip'],
            forcePasv: true,
            sftp: true
        };
        ftpDeploy.deploy(config, function (err, res) {
            if (err) {
                grunt.log.error(err);
                _callback_a(false);
            }
            else {
                grunt.log.ok('Upload Completed to Target: ' + res);
                _callback_a(true);
            }
        });
    } else {
        grunt.log.error('Upload to SFTP terminated due to insufficient information to preocess.');
        _callback_a(false);
    }
}