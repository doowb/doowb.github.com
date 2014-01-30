/*
 * Assemble Plugin: plugin-handlebars-layouts
 * https://github.com/doowb/plugin-handlebars-layouts
 * Assemble is the 100% JavaScript static site generator for Node.js, Grunt.js, and Yeoman.
 *
 * Copyright (c) 2014 doowb
 * Licensed under the MIT license.
 */

var inspect = require('util').inspect;
var file = require('fs-utils');
var async = require('async');
var path = require('path');
var _ = require('lodash');

var plugin = module.exports = function (assemble) {

  var options = {
    events: [
      assemble.config.plugins.events.optionsAfterConfiguration,
      assemble.config.plugins.events.assembleAfterPage
    ]
  };

  assemble.registerPlugin(
    'plugin-handlebars-layouts',
    'Add layouts to your handlebars templates.',
    options,
    function (params, done) {

      switch (params.event) {
        case assemble.config.plugins.events.optionsAfterConfiguration:
          loadDefaultLayout(assemble, done);
          break;

        case assemble.config.plugins.events.assembleAfterPage:
          loadPageLayout(assemble, params.page, done);
          break;

        default:
          done();
          break;
      }
    }
  );

};

var loadDefaultLayout = function (assemble, callback) {
  loadLayout(assemble, assemble.options.layout, function (err, layout) {
    if (err) {
      return callback(err);
    }
    assemble.defaultLayout = layout;
    assemble.log.debug(inspect(assemble.defaultLayout));
    return callback();
  });
};

var loadPageLayout = function (assemble, page, callback) {
  var layout = _.cloneDeep(assemble.defaultLayout);

  async.series([
    function (next) {
      if (page.metadata && (page.metadata.layout || page.metadata.layout === false || page.metadata.layout === 'none')) {
        loadLayout(assemble, page.metadata.layout, function (err, results) {
          if (err) {
            return next(err);
          }
          layout = results;
          return next();
        });
      } else {
        return next();
      }
    }
  ],
  function (err) {
    if (err) {
      return callback(err);
    }
    page.metadata = _.extend({}, layout.metadata, page.metadata);
    page.content = injectBody(layout.content, page.content);

    assemble.log.debug('final page', inspect(page));
    return callback();
  });
};

var loadLayout = function (assemble, src, callback) {

  var fileInfo = assemble.utils.file;
  
  var layoutStack = [];
  var layoutName = 'layout';
  var defaultLayout = '{{body}}';

  var layoutext = assemble.options.layoutext || '';
  var layout = '';
  var layoutdir = assemble.options.layoutdir || assemble.options.layouts || '';

  var load = function (src, done) {
    var loadFile = true;

    // if the src is empty, create a default layout in memory
    if (!src || src === false || src === '' || src.length === 0 || src === 'none') {
      loadFile = false;
      layout = defaultLayout;
    }

    if (loadFile) {
      assemble.log.debug('Layout src', src);
      layout = file.normalizeSlash(path.join(layoutdir, src + layoutext));
      assemble.log.debug('Layout path', layout);

      if (!file.exists(layout)) {
        var err = 'Layout file (' + layout + ') not found.';
        throw new Error(err);
        return false;
      }

      layoutName = file.basename(layout);

      var options = {
        type: 'layout',
        newer: true
      };

      fileInfo.load(assemble, layout, options, function (err, layoutFile) {
        if (err) {
          return done(err);
        }
        layout = layoutFile;
        layout.name = layoutName;
        layout.content = layout.content.replace(/\{{>\s*body\s*}}/, defaultLayout);

        layoutStack.push(layout);

        if (layout && layout.metadata && (layout.metadata.layout || layout.metadata.layout === false || layout.metadata.layout === 'none')) {
          return load(layout.metadata.layout, done);
        }
        return done();
      });

    } else {

      var tmp = layout;
      layout = new assemble.models.File();
      layout.name = 'layout';
      layout.content = tmp;
      layout.metadata = {};

      layoutStack.push(layout);

      if (layout && layout.metadata && (layout.metadata.layout || layout.metadata.layout === false || layout.metadata.layout === 'none')) {
        return load(layout.metadata.layout, done);
      }
      return done();
    }

  };

  load(src, function (err) {
    if (err) {
      assemble.log.error(err);
      return callback(err);
    }

    var finalResults = new assemble.models.File();
    finalResults.name = '';
    finalResults.content = defaultLayout;
    finalResults.metadata = {};

    while (layout = layoutStack.pop()) {
      finalResults.content = injectBody(finalResults.content, layout.content);
      finalResults.metadata = _.extend({}, finalResults.metadata, layout.metadata);
      finalResults.name = layout.name;
    }

    return callback(null, finalResults);
  });
};

var injectBody = function (layout, body) {
  return layout.replace(/\{{\s*body\s*}}/, body);
};