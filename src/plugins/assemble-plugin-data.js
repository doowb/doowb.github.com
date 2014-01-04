/*
 * Assemble Plugin: assemble-plugin-data
 * https://github.com/doowb/assemble-plugin-data
 * Assemble is the 100% JavaScript static site generator for Node.js, Grunt.js, and Yeoman.
 *
 * Copyright (c) 2014 doowb
 * Licensed under the MIT license.
 */

var utils = require('assemble').utils;
var es = require('event-stream');
var fs = require('vinyl-fs');
var async = require('async');
var path = require('path');

var options = {
  stages: [
    utils.plugins.stages.assembleBeforeData,
    utils.plugins.stages.assembleAfterData
  ]
};

var readJSON = function (file, done) {
  file.contents = JSON.parse(file.contents);
  done(null, file);
};

var callbackStream = function (callback) {
  return function end() {
    this.emit('end');
    callback();
  };
};

var plugin = module.exports = function (assemble) {

  assemble.registerPlugin(
    'assemble-plugin-data',
    'Do your data loading inside this plugin.',
    options,
    function (params, done) {

      switch (params.stage) {
      case utils.plugins.stages.assembleBeforeData:

        this.data = this.data || {};

        var saveFile = function (file, done) {
          var name = path.basename(file.path, path.extname(file.path));
          this.data[name] = JSON.parse(file.contents);
          done(null, file);
        }.bind(this);

        var datafiles = [];
        async.series(
            [

              function (next) {
              fs.src(this.options.data)
                .pipe(es.map(saveFile))
                .pipe(es.through(null, callbackStream(next)))
              }.bind(this)
            ],
          done);
        break;

      case utils.plugins.stages.assembleAfterData:
        console.log('this.data', this.data);
        done();
        break;
      };

    }
  );

};