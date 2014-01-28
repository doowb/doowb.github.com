/*
 * Assemble Plugin: assemble-plugin-data
 * https://github.com/doowb/assemble-plugin-data
 * Assemble is the 100% JavaScript static site generator for Node.js, Grunt.js, and Yeoman.
 *
 * Copyright (c) 2014 doowb
 * Licensed under the MIT license.
 */

//var es = require('event-stream');
//var fs = require('vinyl-fs');
var fs = require('./utils/file');
var async = require('async');
var path = require('path');

// var callbackStream = function (callback) {
//   return function end() {
//     this.emit('end');
//     callback();
//   };
// };

var plugin = module.exports = function (assemble) {

  var options = {
    events: [
      assemble.utils.plugins.events.assembleBeforeData,
      assemble.utils.plugins.events.assembleAfterData
    ]
  };

  assemble.registerPlugin(
    'assemble-plugin-data',
    'Do your data loading inside this plugin.',
    options,
    function (params, done) {

      switch (params.event) {
      case assemble.utils.plugins.events.assembleBeforeData:

        this.data = this.data || {};

        async.series(
          [

            function (next) {
              fs.read(
                this.options.data,
                function (file, nextFile) {
                  var name = path.basename(file.src, path.extname(file.src));
                  this.data[name] = JSON.parse(file.contents);
                  nextFile(null);
                }.bind(this),
                next);
            }.bind(this)
          ],
          done);
        break;

      case assemble.utils.plugins.events.assembleAfterData:
        done();
        break;
      };

    }
  );

};