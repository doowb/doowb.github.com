/*
 * Assemble Plugin: assemble-plugin-data
 * https://github.com/doowb/assemble-plugin-data
 * Assemble is the 100% JavaScript static site generator for Node.js, Grunt.js, and Yeoman.
 *
 * Copyright (c) 2014 doowb
 * Licensed under the MIT license.
 */

var inspect = require('util').inspect;
var _ = require('lodash');

var plugin = module.exports = function (assemble) {

  var options = {
    events: [
      assemble.config.plugins.events.assembleBeforePartials,
      assemble.config.plugins.events.assembleAfterPartials
    ]
  };

  assemble.registerPlugin(
    'plugin-partials',
    'Do your partial loading inside this plugin.',
    options,
    function (params, done) {

      switch (params.event) {
      case assemble.config.plugins.events.assembleBeforePartials:
        assemble.log.debug('Do something before the partials are loaded.', (this.partials && _.keys(this.partials).length) || 0);
        break;

      case assemble.config.plugins.events.assembleAfterPartials:
        assemble.log.debug('Do something after the partials are loaded.', _.keys(this.partials).length);
        break;
      };

      done();
    }
  );

};