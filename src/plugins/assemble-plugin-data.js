/*
 * Assemble Plugin: assemble-plugin-data
 * https://github.com/doowb/assemble-plugin-data
 * Assemble is the 100% JavaScript static site generator for Node.js, Grunt.js, and Yeoman.
 *
 * Copyright (c) 2014 doowb
 * Licensed under the MIT license.
 */

var utils = require('assemble').utils;
var async = require('async');
var path = require('path');
var glob = require('glob');
var fs = require('fs');

var options = {
  stages: [
    utils.plugins.stages.assembleBeforeData,
    utils.plugins.stages.assembleAfterData
  ]
};

var expandFiles = function (patterns, done) {
  async.concat(patterns, glob, done);
};

var readFile = function (file, done) {
  var opts = {
    encoding: 'utf8'
  };
  fs.readFile(file, opts, done);
};

var readJSON = function (file, done) {
  readFile(file, function (err, data) {
    if (err) {
      done(err);
    } else {
      done(null, JSON.parse(data));
    }
  });
};

var readFiles = function (files, done) {
  var data = {};
  async.each(
    files,
    function (file, done) {
      var name = path.basename(file, path.extname(file));
      readJSON(file, function (err, d) {
        data[name] = d;
        done();
      });
    },
    function (err) {
      done(err, data);
    }
  );
};

var plugin = module.exports = function (assemble) {

  assemble.registerPlugin(
    'assemble-plugin-data',
    'Do your data loading inside this plugin.',
    options,
    function (params, done) {

      switch (params.stage) {
      case utils.plugins.stages.assembleBeforeData:
        var datafiles = [];
        async.series(
            [

              function (next) {
              expandFiles(this.options.data, function (err, files) {
                if (err) {
                  next(err, null);
                } else {
                  datafiles = files;
                  next();
                }
              });
              }.bind(this),

              function (next) {
              readFiles(datafiles, function (err, data) {
                this.data = data;
                next(err);
              }.bind(this));
              }.bind(this)
            ],
          done);
        break;

      case utils.plugins.stages.assembleAfterData:
        console.log(this.data);
        done();
        break;
      };

    }
  );

};