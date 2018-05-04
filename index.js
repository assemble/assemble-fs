/*!
 * assemble-fs <https://github.com/assemble/assemble-fs>
 *
 * Copyright (c) 2015-2018, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

const utils = require('./utils');

module.exports = function(options) {
  const set = new Set();

  return function plugin(app) {
    if ((!app.collections && !app.isCollection) || set.has(app)) return;
    set.add(app);

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

    utils.define(app, 'copy', function(patterns, dest, options) {
      const opts = Object.assign({ allowEmpty: true }, options);
      return utils.vfs.src(patterns, opts)
        .pipe(utils.vfs.dest(dest, opts));
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

    utils.define(app, 'src', function(patterns, options) {
      const opts = Object.assign({ allowEmpty: true }, options);
      return utils.vfs.src(patterns, opts)
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

    utils.define(app, 'symlink', utils.vfs.symlink.bind(utils.vfs));

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

    utils.define(app, 'dest', function(dest, options) {
      if (!dest) {
        throw new TypeError('expected dest to be a string or function');
      }

      // ensure "dest" is added to the context before rendering
      utils.prepareDest(app, dest, options);

      const output = utils.combine([
        handle(this, 'preWrite'),
        utils.vfs.dest(dest, options),
        handle(this, 'postWrite')
      ]);

      output.once('error', app.emit.bind(app, 'error'));
      output.once('end', function() {
        output.emit('finish');
        app.emit('end');
      });

      return output;
    });

    return plugin;
  };
};

function addHandlers(app, handlers) {
  for (const name of handlers) {
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
  const opts = Object.assign({ collection: null }, options);
  const name = opts.collection;
  let collection = app.collections ? name && app[name] : app;
  let view;

  if (!collection && name) {
    collection = app.create(name, opts);
  }

  return utils.through.obj(async function(file, enc, next) {
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

    view = app.view(file.path, file);

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
  return utils.through.obj(async function(file, enc, next) {
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
