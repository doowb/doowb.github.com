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

// tasks
app.task('load', function(cb) {
  app.layouts('src/layouts/*.hbs');
  app.partials('src/partials/*.hbs');
  app.pages('src/pages/*.hbs');
  app.data('src/data/*.json', {namespace: true});
  cb();
});

app.task('build', ['load'], function() {
  return app.toStream('pages')
    .pipe(app.renderFile())
    .pipe(extname())
    .pipe(app.dest(function(file) {
      console.log(file.path, file.relative, file.base);
      return 'dist';
    }));
});

app.task('default', ['build']);

module.exports = app;
