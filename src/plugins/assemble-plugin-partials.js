/*
 * Assemble Plugin: assemble-plugin-partials
 * https://github.com/doowb/assemble-plugin-partials
 * Assemble is the 100% JavaScript static site generator for Node.js, Grunt.js, and Yeoman.
 *
 * Copyright (c) 2014 doowb
 * Licensed under the MIT license.
 */

var es = require('event-stream');
var fs = require('vinyl-fs');
var async = require('async');
var path = require('path');

var callbackStream = function (callback) {
  return function end() {
    this.emit('end');
    callback();
  };
};

var plugin = module.exports = function (assemble) {

  var options = {
    stages: [
      assemble.utils.plugins.stages.assembleBeforePartials,
      assemble.utils.plugins.stages.assembleAfterPartials
    ]
  };

  assemble.registerPlugin(
    'assemble-plugin-partials',
    'Load partials and save any yaml front matter.',
    options,
    function (params, done) {

      switch (params.stage) {
      case assemble.utils.plugins.stages.assembleBeforePartials:

        this.partials = this.partials || {};

        var saveFile = function (file, done) {
          var name = path.basename(file.path, path.extname(file.path));
          this.partials[name] = {};
          this.partials[name].raw = file.contents.toString();
          done(null, file);
        }.bind(this);

        async.series(
            [

              function (next) {
              fs.src(this.options.partials)
                .pipe(es.map(saveFile))
                .pipe(es.through(null, callbackStream(next)))
              }.bind(this)
            ],
          done);
        break;

      case assemble.utils.plugins.stages.assembleAfterPartials:
        console.log('this.partials', this.partials);
        done();
        break;
      };

    }
  );

};