'use strict';

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
};

function getSecret(id) {
  return process.env[id] || process.env[id.toUpperCase()] || getSecret(id.replace(/-/g, '_'));
}
