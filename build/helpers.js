'use strict';

// TODO: This shouldn't be done so use axios or something directly to hit unsplash api
global.fetch = require('node-fetch');

const Unsplash = require('unsplash-js').default;
const { toJson } = require('unsplash-js');

const handlebars = require('handlebars-helpers');

module.exports = app => {
  let options = app.option('unsplash');
  let unsplash = new Unsplash(options);
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

  app.asyncHelper('unsplash', (args, options, cb) => {
    unsplash.photos.getPhoto(...arrayify(args))
      .then(toJson)
      .then(photo => cb(null, photo))
      .catch(cb);
  });
};

function arrayify(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
}
