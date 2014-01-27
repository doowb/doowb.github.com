/*
 * Assemble Plugin: assemble-plugin-data
 * https://github.com/doowb/assemble-plugin-data
 * Assemble is the 100% JavaScript static site generator for Node.js, Grunt.js, and Yeoman.
 *
 * Copyright (c) 2014 doowb
 * Licensed under the MIT license.
 */

var inspect = require('util').inspect;

var plugin = module.exports = function (assemble) {

  var options = {
    stages: [
      assemble.config.plugins.stages.assembleBeforePartials,
      assemble.config.plugins.stages.assembleAfterPartials
    ]
  };

  assemble.registerPlugin(
    'plugin-partials',
    'Do your partial loading inside this plugin.',
    options,
    function (params, done) {

      switch (params.stage) {
      case assemble.config.plugins.stages.assembleBeforePartials:
        assemble.log.debug('BEFORE', inspect(this.partials));
        break;

      case assemble.config.plugins.stages.assembleAfterPartials:
        assemble.log.debug('AFTER', inspect(this.partials));
        break;
      };

      done();
    }
  );

};