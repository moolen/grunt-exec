// grunt-exec
// ==========
// * GitHub: https://github.com/jharding/grunt-exec
// * Copyright (c) 2012 Jake Harding
// * Licensed under the MIT license.

module.exports = function(grunt) {
  var cp = require('child_process')
    , f = require('util').format
    , _ = grunt.util._
    , log = grunt.log
    , verbose = grunt.verbose;

  grunt.registerMultiTask('exec', 'Execute shell commands.', function() {
    var data = this.data
      , execOptions = data.options !== undefined ? data.options : {}
      , stdout = data.stdout !== undefined ? data.stdout : true
      , stderr = data.stderr !== undefined ? data.stderr : true
      , callback = _.isFunction(data.callback) ? data.callback : function() {}
      , exitCodes = data.exitCode || data.exitCodes || 0
      , command
      , childProcess
      , args = [].slice.call(arguments, 0)
      , done = this.async();

    // https://github.com/jharding/grunt-exec/pull/30
    exitCodes = _.isArray(exitCodes) ? exitCodes : [exitCodes];

    // allow for command to be specified in either
    // 'command' or 'cmd' property, or as a string.
    command = data.command || data.cmd || (_.isString(data) && data);

    data.cwd && (execOptions.cwd = data.cwd);
    data.maxBuffer && (execOptions.maxBuffer = data.maxBuffer);

    if (!command) {
      log.error('Missing command property.');
      return done(false);
    }

    if (_.isFunction(command)) {
      command = command.apply(grunt, args);
    }

    if (!_.isString(command)) {
      log.error('Command property must be a string.');
      return done(false);
    }

    verbose.subhead(command);
    verbose.writeln(f('Expecting exit code %s', exitCodes.join(' or ')));

    childProcess = cp.exec(command, execOptions, function(a, b, c){
      console.log('exec callback');
      callback(a, b, c);
      done();
    });

    stdout && childProcess.stdout.on('data', function (d) { log.write(d); });
    stderr && childProcess.stderr.on('data', function (d) { log.error(d); });

    // Catches failing to execute the command at all (eg spawn ENOENT),
    // since in that case an 'exit' event will not be emitted.
    childProcess.on('error', function (err) {
      log.error(f('Failed with: %s', err));
      done(false);
    });
  });
};
