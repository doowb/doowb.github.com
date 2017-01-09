'use strict';

var helpers = require('handlebars-helpers')();
var extname = require('gulp-extname');
var assemble = require('assemble');
var app = assemble();

// helpers
app.helpers(helpers);
app.helper('md', helpers.md.sync);

// options
app.option('layout', 'default');

// data
app.data('assets', '/public');

// tasks
app.task('load', function(cb) {
  app.layouts('src/layouts/*.hbs');
  app.partials('src/partials/*.hbs');
  app.pages('src/pages/*.hbs');
  app.data('src/data/*.json', {namespace: true});
  if (app.cache.data.data) {
    app.data(app.cache.data.data);
    delete app.cache.data.data;
  }
  cb();
});

app.task('build', ['load'], function() {
  return app.toStream('pages')
    .pipe(app.renderFile())
    .pipe(extname())
    .pipe(app.dest('_gh_pages'));
});

app.task('default', ['build']);

module.exports = app;
