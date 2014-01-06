/*
 * Assemble is the 100% JavaScript static site generator for Node.js, Grunt.js, and Yeoman.
 *
 * Copyright (c) 2014 doowb
 * Licensed under the MIT license.
 */

var globule = require('globule');
var async = require('async');
var _ = require('lodash');
var fs = require('fs');

var file = module.exports = {};

file.map = function (src, options, iterator, done) {
  var srcList = src;
  if (_.isArray(src) && src.length > 0 && _.isObject(src[0])) {
    srcList = src.map(function (fp) {
      options.destBase = fp.dest;
      options.flatten = true;
      options.ext = '.html';
      return fp.src;
    });
  }
  srcList = _.flatten(srcList);

  var files = globule.mapping(srcList, options);
  async.eachSeries(files, function (file, next) {

    if (_.isArray(file.src)) {
      file.src = file.src[0];
    }
    var contents = fs.readFileSync(file.src, {
      encoding: 'utf8'
    });

    if (contents.charCodeAt(0) === 0xFEFF) {
      contents = contents.substring(1);
    }

    file.contents = contents;
    iterator(file, next);
  }, done);
};

file.read = function (src, iterator, done) {
  var files = globule.find(src);
  async.eachSeries(files, function (file, next) {

      var contents = fs.readFileSync(file, {
        encoding: 'utf8'
      });

      if (contents.charCodeAt(0) === 0xFEFF) {
        contents = contents.substring(1);
      }

      var f = {
        src: file,
        contents: contents
      };

      iterator(f, function (err) {
        if (err) {
          return next(err);
        }
        return next(null);
      });
    },
    done);
};