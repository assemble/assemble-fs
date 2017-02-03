'use strict';

var path = require('path');
var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('assemble-handle', 'handle');
require('extend-shallow', 'extend');
require('fs-exists-sync', 'exists');
require('file-is-binary', 'isBinary');
require('is-valid-app');
require('stream-combiner', 'combine');
require('through2', 'through');
require('vinyl-fs', 'vfs');
require = fn;

// until `vinyl-prepare` is published
utils.prepare = function(dest, options) {
  return utils.through.obj(function(file, enc, next) {
    prepare(dest, file, options, next);
  });
};

function prepare(dest, file, options, cb) {
  try {
    var opts = utils.extend({cwd: process.cwd()}, options);
    var cwd = path.resolve(opts.cwd);

    var destDir = typeof dest === 'function' ? dest(file) : dest;
    if (typeof destDir !== 'string') {
      cb(new TypeError('expected destination directory to be a string'));
      return;
    }

    var baseDir = typeof opts.base === 'function'
      ? opts.base(file)
      : path.resolve(cwd, destDir);

    if (!baseDir) {
      cb(new TypeError('expected base directory to be a string'));
      return;
    }

    var writePath = path.resolve(baseDir, file.relative);
    file.cwd = cwd;
    file.base = baseDir;
    file.path = writePath;
    cb(null, file);
  } catch (err) {
    cb(err);
  }
}

/**
 * Expose `utils`
 */

module.exports = utils;
