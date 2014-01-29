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
      assemble.config.plugins.events.assembleBeforeData,
      assemble.config.plugins.events.assembleAfterData
    ]
  };

  assemble.registerPlugin(
    'plugin-data',
    'Do your data loading inside this plugin.',
    options,
    function (params, done) {

      switch (params.event) {
      case assemble.config.plugins.events.assembleBeforeData:
        assemble.log.debug('Do something before data files are loaded.', params.data.length, (this.data && _.keys(this.data).length) || 0);
        break;

      case assemble.config.plugins.events.assembleAfterData:
        assemble.log.debug('Do something after data files are loaded.', params.data.length, _.keys(this.data).length);
        break;
      };

      done();
    }
  );

};