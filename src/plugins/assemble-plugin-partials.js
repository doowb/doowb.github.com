/*
 * Assemble Plugin: assemble-plugin-partials
 * https://github.com/doowb/assemble-plugin-partials
 * Assemble is the 100% JavaScript static site generator for Node.js, Grunt.js, and Yeoman.
 *
 * Copyright (c) 2014 doowb
 * Licensed under the MIT license.
 */

var yfm = require('assemble-yaml');
var fs = require('./utils/file');
var async = require('async');
var path = require('path');

var plugin = module.exports = function (assemble) {

  var options = {
    events: [
      assemble.utils.plugins.events.assembleBeforePartials,
      assemble.utils.plugins.events.assembleAfterPartials
    ]
  };

  assemble.registerPlugin(
    'assemble-plugin-partials',
    'Load partials and save any yaml front matter.',
    options,
    function (params, done) {

      switch (params.event) {
      case assemble.utils.plugins.events.assembleBeforePartials:

        this.partials = this.partials || {};

        var saveFile = function (file, done) {
          this.partials[file.src] = {};
          this.partials[file.src].name = path.basename(file.src, path.extname(file.src));
          this.partials[file.src].raw = file.contents.toString();

          var info = yfm.extract(this.partials[file.src].raw, {
            fromFile: false
          });

          this.partials[file.src].metadata = info.context || {};
          this.partials[file.src].content = info.content;

          done(null, file);
        }.bind(this);

        async.series(
            [

              function (next) {
                fs.map(
                  this.options.partials, {},
                  saveFile,
                  next);
              }.bind(this)
            ],
          done);
        break;

      case assemble.utils.plugins.events.assembleAfterPartials:
        //console.log(require('util').inspect(this.partials));
        done();
        break;
      };

    }
  );

};