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
    stages: [
      assemble.utils.plugins.stages.assembleBeforePages,
      assemble.utils.plugins.stages.assembleAfterPages
    ]
  };

  assemble.registerPlugin(
    'assemble-plugin-pages',
    'Load components and save any yaml front matter.',
    options,
    function (params, done) {

      switch (params.stage) {
      case assemble.utils.plugins.stages.assembleBeforePages:

        this.components = this.components || {};

        var saveFile = function (file, done) {
          this.components[file.src] = {};
          this.components[file.src].name = path.basename(file.src, path.extname(file.src));
          this.components[file.src].src = file.src;
          this.components[file.src].dest = file.dest;
          this.components[file.src].raw = file.contents.toString();

          var info = yfm.extract(this.components[file.src].raw, {
            fromFile: false
          });

          this.components[file.src].metadata = info.context || {};
          this.components[file.src].content = info.content;

          done(null);
        }.bind(this);

        async.series(
          [

            function (next) {
              fs.map(
                this.options.files, {},
                saveFile,
                next);
            }.bind(this)
          ],
          done);

        break;

      case assemble.utils.plugins.stages.assembleAfterPages:
        //console.log(require('util').inspect(this.components));
        done();
        break;
      };

    }
  );

};