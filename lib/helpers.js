'use strict';

const handlebars = require('handlebars-helpers');

module.exports = app => {
  let helpers = handlebars();

  app.helpers(helpers);

  app.helper('find', (arr, prop, val) => arr.find(item => item[prop] == val));
  app.helper('md', helpers.md.sync);

  app.helper('published', arr => {
    return arr.filter(item => item.data.draft !== true);
  });

  app.helper('reverse', arr => {
    arr.reverse();
    return arr;
  });

  app.helper('series', (arr, series) => {
    return arr.filter(item => item.data.tags && item.data.tags.includes(series));
  });

  app.helper('unsplash', id => {
    if (Array.isArray(id)) {
      id = id[0];
    }

    return app.data(`unsplash.photos.${id}`) || {};
  });
};
