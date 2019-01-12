'use strict';

const path = require('path');
const helpers = require('./helpers');
const unsplash = require('./unsplash');

module.exports = app => {
  let options = {
    applicationId: getSecret('unsplash-application-id'),
    secret: getSecret('unsplash-secret')
  };

  // options
  app.option('layout', 'default');
  app.option('unsplash', options);

  // data
  app.data('assets', 'public');

  // custom view collections
  app.create('posts');

  app.use(unsplash);
  app.use(helpers);

  // middleware
  app.onLoad(/posts\/.*\.(hbs|md)$/, (view, next) => {
    view.layout = 'post';
    next();
  });

  app.onLoad(/(pages|posts)\/.*\.(hbs|md)$/, (view, next) => {
    let dest = view.data.dest || `${view.stem}.html`;
    let match = dest.match(/^((\d{4})-(\d{2})-(\d{2})-)/);
    if (match) {
      let [, prefix, year, month, day] = match;
      let basename = dest.replace(prefix, '');
      dest = `${year}/${month}/${day}/${basename}`;
      view.stem = path.basename(basename, path.extname(basename));
    }
    view.dest = dest;

    view.data.dest = dest;
    view.data.filename = view.filename;
    view.data.basename = view.basename;
    view.data.stem = view.stem;
    next();
  });

  app.postRender(/pages\/books.hbs$/, (view, next) => {
    view.content = view.content.replace(/\<(table)\>/gi, '<table class="table table-striped table-sm">');
    next();
  });
};

/**
 * This function may be updated later to get secrets from a CI envrionment.
 */

function getSecret(id) {
  return process.env[id] || process.env[id.toUpperCase()] || getSecret(id.replace(/-/g, '_'));
}
