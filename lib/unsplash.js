'use strict';

// TODO: This shouldn't be done so use axios or something directly to hit unsplash api
global.fetch = require('node-fetch');

const path = require('path');
const Store = require('data-store');
const Unsplash = require('unsplash-js').default;
const { toJson } = require('unsplash-js');

const arrayify = val => val ? (Array.isArray(val) ? val : [val]) : [];

module.exports = app => {
  let options = app.option('unsplash');
  let unsplash = new Unsplash(options);
  let store = new Store('unsplash', { cwd: path.resolve(__dirname, '../src/data') });

  app.onLoad(/(pages|posts)\/.*\.(hbs|md)$/, async (view, next) => {
    if (typeof view.data.unsplashArgs === 'undefined') {
      next();
      return;
    }

    let args = arrayify(view.data.unsplashArgs);
    let [id] = args;

    if (typeof id === 'undefined') {
      next();
      return;
    }

    let key = `photos.${id}`;
    let data = store.get(key);
    if (typeof data !== 'undefined') {
      next();
      return;
    }

    data = await unsplash.photos.getPhoto(...args).then(toJson);
    app.data(`unsplash.${key}`, data);
    store.set(key, data);

    next();
  });
};
