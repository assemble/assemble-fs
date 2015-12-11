/*!
 * assemble-fs <https://github.com/jonschlinkert/assemble-fs>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

/**
 * Support using the plugin on `app` or a
 * `collection` instance
 */

module.exports = function() {
  return function(app) {
    plugin.call(app, app);
    return function(collection) {
      plugin.call(collection, collection);
    };
  };
};

/**
 * The actual `fs` plugin
 */

function plugin(app) {
  // we'll assume none of them exist if `onStream` is not registered
  if (typeof this.onStream !== 'function') {
    this.handler('onStream');
    this.handler('preWrite');
    this.handler('postWrite');
  }

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

  app.mixin('copy', function (patterns, dest, options) {
    return utils.vfs.src(patterns, options)
      .pipe(utils.vfs.dest(dest, options))
      .on('data', function () {});
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

  app.mixin('src', function() {
    return utils.vfs.src.apply(utils.vfs, arguments)
      .pipe(toCollection(this))
      .pipe(handle('onStream'));
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

  app.mixin('symlink', function () {
    return utils.vfs.symlink.apply(utils.vfs, arguments)
      .pipe(toCollection(this))
      .pipe(handle('onStream'));
  });

  /**
   * Specify a destination for processed files.
   *
   * ```js
   * app.dest('dist/');
   * ```
   * @name .dest
   * @param {String|Function} `dest` File path or rename function.
   * @param {Object} `options` Options and locals to pass to `dest` plugins
   * @api public
   */

  app.mixin('dest', function (dir) {
    if (!dir) {
      throw new TypeError('expected dest to be a string or function.');
    }
    return handle('preWrite')
      .pipe(utils.vfs.dest.apply(utils.vfs, arguments));
  });

  function handle(stage) {
    return utils.through.obj(function(file, enc, next) {
      if (file.isNull()) return next();
      app.handle(stage, file, next);
    });
  }
}

/**
 * Push vinyl files into a collection or list.
 */

function toCollection(app) {
  var through = utils.through.obj;
  app.streamFiles = [];

  var collection;
  if (app.isApp) {
    collection = app.collection();
  }

  var stream = through(function(file, enc, next) {
    if (app.isApp) {
      file = collection.setView(file.path, file);
    } else if (app.isCollection) {
      file = app.setView(file.path, file);
    } else if (app.isList) {
      file = app.setItem(file.path, file);
    }

    app.streamFiles.push(file);
    next(null, file);
  });

  app.stream = utils.src(stream);
  return stream;
}
