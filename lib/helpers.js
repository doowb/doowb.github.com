'use strict';

const handlebars = require('handlebars-helpers');

module.exports = app => {
  let helpers = handlebars();

  app.helpers(helpers);
  app.helper('md', helpers.md.sync);

  app.helper('reverse', arr => {
    arr.reverse();
    return arr;
  });

  app.helper('published', arr => {
    return arr.filter(item => item.data.draft !== true);
  });

  app.helper('unsplash', id => {
    return app.data(`unsplash.photos.${id}`) || {};
  });
};
