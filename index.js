/*!
 * assemble-fs <https://github.com/jonschlinkert/assemble-fs>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');
var async = require('async');
var utils = require('./utils');

/**
 * Support using the plugin on `app` or a
 * `collection` instance
 */

module.exports = function(options) {
  return function fn(app) {
    vfs(app);
    writeFile(app, options);

    if (app.isViews) {
      app.mixin('writeFiles', writeFiles);
    }

    if (app.isApp) {
      return fn;
    }

    if (app.isViews || app.isList) {
      return writeFile;
    }
  };
}

function writeFile(app, options) {
  app.mixin('writeFile', writer(options));

  function writer(options) {
    options = options || {};

    return function(dest, file, cb) {
      if (this.isView) {
        cb = file;
        file = this;
      }

      if (typeof cb !== 'function') {
        throw new TypeError('expected callback to be a function');
      }
      if (typeof dest !== 'string') {
        return cb(new TypeError('expected dest to be a string'));
      }

      var content = file;
      if (file && typeof file === 'object') {
        content = file.contents.toString();
      }
      if (typeof content !== 'string') {
        return cb(new TypeError('expected "file.contents" to be a buffer or string'));
      }
      utils.writeFile(dest, content, cb);
      return this;
    }
  };
}

function writeFiles(dest, cb) {
  async.eachOf(this.views, function(view, key, next) {
    var filepath;
    if (typeof dest === 'function') {
      filepath = dest(view);
    } else {
      filepath = path.join(dest, view.basename);
    }
    view.writeFile(filepath, next);
  }, cb);
}

/**
 * The actual `fs` plugin
 */

function vfs(app) {

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
      .pipe(toCollection(this));
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
    return utils.vfs.symlink.apply(utils.vfs, arguments);
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
    return utils.vfs.dest.apply(utils.vfs, arguments);
  });
}

/**
 * Push vinyl files into a collection or list.
 */

function toCollection(app, name) {
  var through = utils.through.obj;
  name = name || 'files';
  app[name] = [];

  var collection, item, view;
  if (app.isApp) {
    collection = app.collection();
  }

  var stream = through(function (file, enc, next) {
    app[name].push(file);

    if (app.isApp) {
      item = collection.setView(file.path, file);
      return next(null, item);
    }

    if (app.isCollection) {
      view = app.setView(file.path, file);
      return next(null, view);
    }

    if (app.isList) {
      item = app.setItem(file.path, file);
      return next(null, item);
    }

    next(null, file);
  });

  app.stream = utils.src(stream);
  return stream;
}
