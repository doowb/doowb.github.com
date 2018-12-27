'use strict';


const ghPages = require('gulp-gh-pages');
const extname = require('gulp-extname');
const assemble = require('assemble');
const less = require('gulp-less');
const del = require('delete');
const path = require('path');

const config = require('./build/config');
const app = assemble();

app.use(config);

// middleware
app.onLoad(/(pages|posts)\/.*\.(hbs|md)$/, (view, next) => {
  let dest = view.data.dest || `${view.stem}.html`;
  view.dest = dest;

  view.data.filename = view.filename;
  view.data.basename = view.basename;
  view.data.stem = view.stem;
  next();
});

// tasks
app.task('load', cb => {
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

app.task('less', () => {
  return app.src('src/styles/**/*.less')
    .pipe(less({paths: ['src/assets/bootstrap']}))
    .pipe(app.dest('_gh_pages/public/css'));
});

app.task('build', ['load', 'less', 'copy'], () => {
  return app.toStream('pages')
    .pipe(app.renderFile())
    .pipe(extname())
    .pipe(app.dest((file) => {
      if (file.dest) {
        file.path = path.join(file.base, file.dest);
      }
      return '_gh_pages';
    }));
});

app.task('copy', () => {
  return app.copy(['src/root/**/*'], '_gh_pages', {dot: true});
});

app.task('clean', cb => {
  del('./_gh_pages', {force: true}, cb);
});

app.task('cleanPublish', cb => {
  del('./.publish', {force: true}, cb);
});

app.task('push', () => {
  return app.src('_gh_pages/**/*')
    .pipe(ghPages({
      branch: 'master',
      push: app.option('push') || false
    }));
});

app.task('deploy', app.series(['push', 'cleanPublish']));
app.task('default', ['build']);

module.exports = app;
