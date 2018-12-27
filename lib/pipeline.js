'use strict';

const through = require('through2');

exports.published = options => {
  let opts = Object.assign({}, options);

  return through.obj((file, enc, next) => {
    if (file.data.draft !== true) {
      next(null, file);
      return;
    }
    next();
  });
};
