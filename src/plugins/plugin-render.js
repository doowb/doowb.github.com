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
    events: [
      'render:*:pages',
      'render:*:page'
    ]
  };

  assemble.registerPlugin(
    'plugin-render',
    'Do your page rending inside this plugin.',
    options,
    function (params, done) {

      switch (params.event) {
      case assemble.config.plugins.events.renderBeforePages:
        assemble.log.debug('Do something before the pages are rendered.');
        break;

      case assemble.config.plugins.events.renderAfterPages:
        assemble.log.debug('Do something after all the pages are rendered.');
        break;

      case assemble.config.plugins.events.renderBeforePage:
        assemble.log.debug('Do something before each page is rendered.', params.page.src);
        break;

      case assemble.config.plugins.events.renderAfterPage:
        assemble.log.debug('Do something after each page is rendered.', params.page.dest);
        break;


      };

      done();
    }
  );

};