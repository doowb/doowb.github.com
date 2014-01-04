/*
 * Assemble Plugin: assemble-plugin-config
 * https://github.com/doowb/assemble-plugin-config
 * Assemble is the 100% JavaScript static site generator for Node.js, Grunt.js, and Yeoman.
 *
 * Copyright (c) 2014 doowb
 * Licensed under the MIT license.
 */

var assemble = require('assemble');

var options = {
  stage: assemble.utils.plugins.stages.optionsBeforeConfiguration
};

var plugin = module.exports = function (assemble) {

  assemble.registerPlugin(
    'assemble-plugin-config',
    'Do your configuration inside this plugin.',
    options,
    function (params, next) {
      //console.log(params);
      next();
    }
  );

};