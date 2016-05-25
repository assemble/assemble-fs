'use strict';

/**
 * Lazily required module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Utils
 */

require('assemble-handle', 'handle');
require('extend-shallow', 'extend');
require('is-registered');
require('is-valid-instance');
require('stream-combiner', 'combine');
require('through2', 'through');
require('vinyl-fs', 'vfs');
require = fn;

/**
 * Return true if app is a valid instance
 */

utils.isValid = function(app) {
  if (!utils.isValidInstance(app, ['app', 'views', 'collection'])) {
    return false;
  }
  if (utils.isRegistered(app, 'assemble-fs')) {
    return false;
  }
  return true;
};

/**
 * Expose `utils`
 */

module.exports = utils;
