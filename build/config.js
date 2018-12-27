'use strict';

const helpers = require('./helpers');

module.exports = app => {
  let unsplash = {
    applicationId: getSecret('unsplash-application-id'),
    secret: getSecret('unsplash-secret')
  };

  // options
  app.option('layout', 'default');
  app.option('unsplash', unsplash);

  // data
  app.data('assets', 'public');

  // custom view collections
  app.create('posts');

  app.use(helpers);
};

function getSecret(id) {
  return process.env[id] || process.env[id.toUpperCase()] || getSecret(id.replace(/-/g, '_'));
}
