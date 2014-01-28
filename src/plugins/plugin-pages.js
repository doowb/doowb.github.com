/*
 * Assemble Plugin: plugin-pages
 * https://github.com/doowb/plugin-pages
 * Assemble is the 100% JavaScript static site generator for Node.js, Grunt.js, and Yeoman.
 *
 * Copyright (c) 2014 doowb
 * Licensed under the MIT license.
 */

var inspect = require('util').inspect;

var plugin = module.exports = function (assemble) {

  var options = {
    stages: [
      'assemble:*:pages',
      'assemble:*:page'
    ]
  };

  assemble.registerPlugin(
    'plugin-pages',
    'Do your page loading inside this plugin.',
    options,
    function (params, done) {

      switch (params.stage) {
      case assemble.config.plugins.stages.assembleBeforePages:
        assemble.log.debug('BEFORE PAGES', inspect(this.pages));
        assemble.log.debug('BEFORE PAGES::FILES', inspect(this.options.files));
        break;

      case assemble.config.plugins.stages.assembleAfterPages:
        assemble.log.debug('AFTER PAGES', inspect(this.pages));
        break;

      case assemble.config.plugins.stages.assembleBeforePage:
        assemble.log.debug('BEFORE PAGE', inspect(this.pages));
        break;

      case assemble.config.plugins.stages.assembleAfterPage:
        assemble.log.debug('AFTER PAGE', inspect(this.pages));
        break;


      };

      done();
    }
  );

};