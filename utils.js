'use strict';

const path = require('path');
const assign = Object.assign;
const noop = (data, enc, next) => next(null, data);
const { Transform } = require('readable-stream');
const utils = exports = module.exports;

define(utils, 'vfs', () => require('vinyl-fs'));
define(utils, 'combine', () => require('stream-combiner'));

function define(obj, key, fn) {
  Reflect.defineProperty(obj, key, { get: fn });
}

utils.define = function(obj, key, value) {
  Reflect.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable: true,
    value
  });
};

/**
 * This function does all of the path-specific operations that
 * `prepareWrite` does in http://github.com/wearefractal/vinyl-fs,
 * but on a **cloned file**, which accomplishes two things:
 *
 * 1. We can merge the dest path information onto the context so
 * that it can be used to calculate relative paths for navigation,
 * pagination, etc.
 * 2. Since we use a cloned file, we're not risking any double-processing
 * on the actual view when it's finally written to the file system
 * by the `.dest()` method.
 *
 * @param {Object} view
 * @param {String|Function} dest
 * @param {Object} options
 */

utils.prepare = function(app, view, dest, options = {}) {
  if (view.preparedDest) return;
  const file = new view.constructor(view);
  const cwd = app.paths.templates;

  const destDir = typeof dest === 'function' ? dest(file) : dest;
  if (typeof destDir !== 'string') {
    throw new TypeError('expected destination directory to be a string');
  }

  const baseDir = typeof options.base === 'function'
    ? options.base(file)
    : path.resolve(cwd, destDir);

  if (typeof baseDir !== 'string') {
    throw new TypeError('expected base directory to be a string');
  }

  const writePath = path.join(destDir, view.basename);
  const data = {};
  data.cwd = cwd;
  data.base = baseDir;
  data.dest = destDir;
  data.path = writePath;
  view.preparedDest = true;
  return data;
};

/**
 * This sets up an event listener that will eventually
 * be called by `app.renderFile()`, ensuring that `dest`
 * information is loaded onto the context before rendering,
 * so that views can render relative paths.
 */

utils.prepareDest = function fn(app, dest, options) {
  app.emit('dest', dest, options);

  const appOpts = assign({}, this.options);
  delete appOpts.engine;
  delete appOpts.tasks;

  const opts = assign({}, appOpts, options);

  if (fn.prepare) {
    app.off('prepareDest', fn.prepare);
  }

  fn.prepare = function(view) {
    const data = utils.prepare(app, view, dest, opts);
    view.data = assign({}, view.data, data);
  };

  app.on('prepareDest', fn.prepare);
};

utils.through = function(options, transform, flush) {
  if (typeof options === 'function') {
    flush = transform;
    transform = options;
    options = null;
  }

  if (!transform) {
    transform = noop;
  }

  if (transform.length === 2) {
    const fn = transform;
    transform = (data, enc, cb) => fn(data, cb);
  }

  const stream = new Transform({ transform, flush, ...options });
  stream.setMaxListeners(0);
  return stream;
};

utils.through.obj = (options, transform, flush) => {
  if (typeof options === 'function') {
    flush = transform;
    transform = options;
    options = null;
  }

  const opts = Object.assign({ objectMode: true, highWaterMark: 16 }, options);
  return utils.through(opts, transform, flush);
};

