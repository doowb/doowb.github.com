/*
 * Assemble Plugin: assemble-plugin-render
 * https://github.com/doowb/assemble-plugin-render
 * Assemble is the 100% JavaScript static site generator for Node.js, Grunt.js, and Yeoman.
 *
 * Copyright (c) 2014 doowb
 * Licensed under the MIT license.
 */

var async = require('async');
var _ = require('lodash');
var fs = require('fs');

var plugin = module.exports = function (assemble) {

  var options = {
    stages: [
      assemble.utils.plugins.stages.renderBeforePages,
      assemble.utils.plugins.stages.renderAfterPages
    ]
  };

  assemble.registerPlugin(
    'assemble-plugin-render',
    'Render pages',
    options,
    function (params, done) {

      switch (params.stage) {
      case assemble.utils.plugins.stages.renderBeforePages:

        async.series(
          [

            function (next) {
              this.engine.registerPartials(this.partials, next);
            }.bind(this),

            function (next) {
              this.engine.renderComponents(this.components, next);
            }.bind(this)
          ],
          done);

        break;

      case assemble.utils.plugins.stages.renderAfterPages:

        async.each(_.keys(this.components), function (key, next) {
            var component = this.components[key];
            fs.writeFile(component.dest, component.rendered, next);
          }.bind(this),
          done);
        break;
      };

    }
  );

};