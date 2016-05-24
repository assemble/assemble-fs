# assemble-fs [![NPM version](https://img.shields.io/npm/v/assemble-fs.svg?style=flat)](https://www.npmjs.com/package/assemble-fs) [![NPM downloads](https://img.shields.io/npm/dm/assemble-fs.svg?style=flat)](https://npmjs.org/package/assemble-fs) [![Build Status](https://img.shields.io/travis/assemble/assemble-fs.svg?style=flat)](https://travis-ci.org/assemble/assemble-fs)

Assemble plugin to add methods to assemble for working with the file system, like src, dest, copy and symlink.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install assemble-fs --save
```

This is an assemble core plugin, you probably won't need to use this directly.

## Usage

```js
var assemble = require('assemble');

// create your application and add the plugin
var app = assemble()
  .use(require('assemble-fs'))

// now you can use `src` and `dest`
app.src(['foo/*.hbs'])
  .pipe(app.dest('site/'))
```

## History

**v0.3.0**

* breaking change! plugin is wrapped in a function that now be called when registered. e.g. `fs()`. This is to be consistent with assemble's plugin guidelines, and allows the plugin to be auto-loaded following the same format as other plugins.
* rename `files` array to `streamFiles`
* adds `onStream` middleware handler to `src`
* adds `preWrite` middleware handler to `dest`

## Related projects

You might also be interested in these projects:

* [assemble-loader](https://www.npmjs.com/package/assemble-loader): Assemble plugin (^0.6.0) for loading globs of views onto custom view collections. Also works with… [more](https://www.npmjs.com/package/assemble-loader) | [homepage](https://github.com/assemble/assemble-loader)
* [assemble-render-file](https://www.npmjs.com/package/assemble-render-file): Assemble plugin for rendering views in a vinyl pipeline. | [homepage](https://github.com/assemble/assemble-render-file)
* [assemble-streams](https://www.npmjs.com/package/assemble-streams): Assemble pipeline plugin for pushing a view collection into a vinyl stream. | [homepage](https://github.com/assemble/assemble-streams)
* [assemble](https://www.npmjs.com/package/assemble): Assemble is a powerful, extendable and easy to use static site generator for node.js. Used… [more](https://www.npmjs.com/package/assemble) | [homepage](https://github.com/assemble/assemble)
* [generate](https://www.npmjs.com/package/generate): Fast, composable, highly extendable project generator with a user-friendly and expressive API. | [homepage](https://github.com/generate/generate)
* [verb](https://www.npmjs.com/package/verb): Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used… [more](https://www.npmjs.com/package/verb) | [homepage](https://github.com/verbose/verb)

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/assemble/assemble-fs/issues/new).

## Building docs

Generate readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install verb && npm run docs
```

Or, if [verb](https://github.com/verbose/verb) is installed globally:

```sh
$ verb
```

## Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

## Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2016, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT license](https://github.com/assemble/assemble-fs/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on May 24, 2016._