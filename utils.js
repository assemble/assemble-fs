'use strict';

/**
 * Lazily required module dependencies
 */

var lazy = require('lazy-cache')(require);
var fn = require;

require = lazy;
require('vinyl-fs', 'vfs');
require = fn;

/**
 * Expose `lazy`
 */

module.exports = lazy;
