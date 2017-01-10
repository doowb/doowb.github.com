'use strict';

var browserSync = require('browser-sync').create();
var helpers = require('handlebars-helpers')();
var ghPages = require('gulp-gh-pages');
var extname = require('gulp-extname');
var assemble = require('assemble');
var watch = require('base-watch');
var less = require('gulp-less');
var del = require('delete');
var path = require('path');
var app = assemble();

app.use(watch());

// helpers
app.helpers(helpers);
app.helper('md', helpers.md.sync);

app.helper('reverse', function(arr) {
  arr.reverse();
  return arr;
});

// options
app.option('layout', 'default');

// data
app.data('assets', 'public');

// custom view collections
app.create('posts');

// middleware
app.onLoad(/(pages|posts)\/.*\.(hbs|md)$/, function(view, next) {
  var dest = view.data.dest || `${view.stem}.html`;
  view.dest = dest;

  view.data.filename = view.filename;
  view.data.basename = view.basename;
  view.data.stem = view.stem;

  next();
});

// tasks
app.task('load', function(cb) {
  app.layouts('src/layouts/*.hbs');
  app.partials('src/partials/*.hbs');
  app.pages('src/pages/*.hbs');
  app.posts('src/posts/*.md');
  app.data('src/data/*.json', {namespace: true});
  if (app.cache.data.data) {
    app.data(app.cache.data.data);
    delete app.cache.data.data;
  }
  cb();
});

app.task('less', function () {
  return app.src('src/styles/**/*.less')
    .pipe(less({paths: ['src/assets/bootstrap']}))
    .pipe(app.dest('_gh_pages/public/css'));
});

app.task('build', ['load', 'less', 'copy'], function() {
  return app.toStream('pages')
    .pipe(app.renderFile())
    .pipe(extname())
    .pipe(app.dest(function(file) {
      if (file.dest) {
        file.path = path.join(file.base, file.dest);
      }
      return '_gh_pages';
    }));
});

app.task('copy', function() {
  return app.copy(['src/root/**/*'], '_gh_pages', {dot: true});
});

app.task('clean', function(cb) {
  del('./_gh_pages', {force: true}, cb);
});

app.task('cleanPublish', function(cb) {
  del('./.publish', {force: true}, cb);
});

app.task('push', function() {
  return app.src('_gh_pages/**/*')
    .pipe(ghPages());
});
app.task('deploy', app.series(['push', 'cleanPublish']));

app.task('default', ['build']);

module.exports = app;
