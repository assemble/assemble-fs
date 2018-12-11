/*!
 * assemble-fs <https://github.com/assemble/assemble-fs>
 *
 * Copyright (c) 2015-2018, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

const utils = require('./utils');

module.exports = options => {
  return function plugin(app) {
    if (app.src || (!app.collections && !app.isCollection)) return;

    /**
     * Setup middleware handlers. Assume none of the handlers exist if `onStream`
     * does not exist.
     */

    addHandlers(app, ['onLoad', 'onStream', 'preWrite', 'postWrite']);

    /**
     * Copy files with the given glob `patterns` to the specified `dest`.
     *
     * ```js
     * app.task('assets', function(cb) {
     *   app.copy('assets/**', 'dist/')
     *     .on('error', cb)
     *     .on('finish', cb)
     * });
     * ```
     * @name .copy
     * @param {String|Array} `patterns` Glob patterns of files to copy.
     * @param  {String|Function} `dest` Desination directory.
     * @return {Stream} Stream, to continue processing if necessary.
     * @api public
     */

    utils.define(app, 'copy', (patterns, dest, options) => {
      return utils.vfs.src(patterns, { allowEmpty: true, ...options })
        .pipe(utils.vfs.dest(dest, options));
    });

    /**
     * Glob patterns or filepaths to source files.
     *
     * ```js
     * app.src('src/*.hbs', {layout: 'default'});
     * ```
     * @name .src
     * @param {String|Array} `glob` Glob patterns or file paths to source files.
     * @param {Object} `options` Options or locals to merge into the context and/or pass to `src` plugins
     * @api public
     */

    utils.define(app, 'src', (patterns, options) => {
      return utils.src(patterns, { allowEmpty: true, ...options })
        .pipe(handle(this, 'onStream'))
        .pipe(toViews(this, options));
    });

    /**
     * Glob patterns or paths for symlinks.
     *
     * ```js
     * app.symlink('src/**');
     * ```
     * @name .symlink
     * @param {String|Array} `glob`
     * @api public
     */

    utils.define(app, 'symlink', (...args) => utils.vfs.symlink(...args));

    /**
     * Specify a destination for processed files. Runs `.preWrite` and
     * `.postWrite` middleware handlers on all files.
     *
     * ```js
     * app.dest('dist/');
     * ```
     * @name .dest
     * @param {String|Function} `dest` File path or rename function.
     * @param {Object} `options` Options and locals to pass to `dest` plugins
     * @api public
     */

    utils.define(app, 'dest', function(dest, options = {}) {
      if (!dest) {
        throw new TypeError('expected dest to be a string or function');
      }

      // ensure "dest" is added to the context before rendering
      utils.prepareDest(this, dest, options);
      let stream = utils.dest(dest, options);

      let output = utils.combine([
        handle(this, 'preWrite'),
        stream,
        handle(this, 'postWrite')
      ]);

      output.once('end', () => {
        output.emit('finish');
        this.emit('end');
      });

      return output;
    });

    return plugin;
  };
};

function addHandlers(app, handlers) {
  for (let name of handlers) {
    if (typeof app[name] !== 'function') {
      app.handler(name);
    }
  }
}

/**
 * Ensure vinyl files are assemble views, and add
 * then to a collection if specified.
 */

function toViews(app, options) {
  let opts = Object.assign({ collection: null }, options);
  let name = opts.collection;
  let collection = app.collections ? name && app[name] : app;
  let view;

  if (!collection && name) {
    collection = app.create(name, opts);
  }

  return utils.through.obj(async (file, enc, next) => {
    if (!file._isFile) {
      file = app.file(file);
    }

    if (file.isNull()) {
      next(null, file);
      return;
    }

    if (collection && collection.isCollection) {
      try {
        view = await collection.set(file.path, file);
      } catch (err) {
        next(err);
        return;
      }
      next(null, view);
      return;
    }

    view = app.file(file.path, file);

    try {
      await app.handle('onLoad', view);
    } catch (err) {
      next(err);
      return;
    }

    next(null, view);
  });
}

function handle(app, method) {
  return utils.through.obj(async (file, enc, next) => {
    if (!file.path && !file.isNull && !file.contents) {
      next();
      return;
    }

    if (file.isNull() || !app.handle) {
      next(null, file);
      return;
    }

    if (typeof app[method] !== 'function') {
      next(new Error(`middleware handler "${method}" is not registered`));
      return;
    }

    await app.handle(method, file);
    next(null, file);
  });
}
