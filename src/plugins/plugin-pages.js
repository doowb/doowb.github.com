/*
 * Assemble Plugin: plugin-pages
 * https://github.com/doowb/plugin-pages
 * Assemble is the 100% JavaScript static site generator for Node.js, Grunt.js, and Yeoman.
 *
 * Copyright (c) 2014 doowb
 * Licensed under the MIT license.
 */

var inspect = require('util').inspect;
var file = require('fs-utils');
var _ = require('lodash');

var plugin = module.exports = function (assemble) {

  var options = {
    events: [
      'assemble:*:pages',
      'assemble:*:page'
    ]
  };

  assemble.registerPlugin(
    'plugin-pages',
    'Do your page loading inside this plugin.',
    options,
    function (params, done) {

      switch (params.event) {
      case assemble.config.plugins.events.assembleBeforePages:
        assemble.log.debug('Do something before all the pages are loaded.', (this.pages && _.keys(this.pages).length) || 0);
        break;

      case assemble.config.plugins.events.assembleAfterPages:
        assemble.log.debug('Do something after all the pages are loaded.', _.keys(this.pages).length);
        break;

      case assemble.config.plugins.events.assembleBeforePage:
        assemble.log.debug('Do something before each page is loaded.', params.page.src);
        break;

      case assemble.config.plugins.events.assembleAfterPage:
        assemble.log.debug('Do something after the page is loaded.', params.page.dest);
        break;


      };

      done();
    }
  );

};