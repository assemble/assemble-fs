# assemble-fs [![NPM version](https://img.shields.io/npm/v/assemble-fs.svg?style=flat)](https://www.npmjs.com/package/assemble-fs) [![NPM downloads](https://img.shields.io/npm/dm/assemble-fs.svg?style=flat)](https://npmjs.org/package/assemble-fs) [![Build Status](https://img.shields.io/travis/assemble/assemble-fs.svg?style=flat)](https://travis-ci.org/assemble/assemble-fs)

Assemble plugin to add methods to assemble for working with the file system, like src, dest, copy and symlink.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save assemble-fs
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

**v0.6.0**

* emit `end` on `app` when stream ends

**v0.3.0**

* breaking change! plugin is wrapped in a function that now be called when registered. e.g. `fs()`. This is to be consistent with assemble's plugin guidelines, and allows the plugin to be auto-loaded following the same format as other plugins.
* rename `files` array to `streamFiles`
* adds `onStream` middleware handler to `src`
* adds `preWrite` middleware handler to `dest`

## Related projects

You might also be interested in these projects:

* [assemble](https://www.npmjs.com/package/assemble): Assemble is a powerful, extendable and easy to use static site generator for node.js. Used… [more](https://github.com/assemble/assemble) | [homepage](https://github.com/assemble/assemble "Assemble is a powerful, extendable and easy to use static site generator for node.js. Used by thousands of projects for much more than building websites, Assemble is also used for creating themes, scaffolds, boilerplates, e-books, UI components, API docum")
* [assemble-loader](https://www.npmjs.com/package/assemble-loader): Assemble plugin (^0.6.0) for loading globs of views onto custom view collections. Also works with… [more](https://github.com/assemble/assemble-loader) | [homepage](https://github.com/assemble/assemble-loader "Assemble plugin (^0.6.0) for loading globs of views onto custom view collections. Also works with verb or other Templates.js based applications.")
* [assemble-render-file](https://www.npmjs.com/package/assemble-render-file): Assemble plugin for rendering views in a vinyl pipeline. | [homepage](https://github.com/assemble/assemble-render-file "Assemble plugin for rendering views in a vinyl pipeline.")
* [assemble-streams](https://www.npmjs.com/package/assemble-streams): Assemble pipeline plugin for pushing a view collection into a vinyl stream. | [homepage](https://github.com/assemble/assemble-streams "Assemble pipeline plugin for pushing a view collection into a vinyl stream.")
* [generate](https://www.npmjs.com/package/generate): The Santa Claus machine for GitHub projects. Scaffolds out new projects, or creates any kind… [more](https://github.com/generate/generate) | [homepage](https://github.com/generate/generate "The Santa Claus machine for GitHub projects. Scaffolds out new projects, or creates any kind of required file or document from any given templates or source materials.")
* [verb](https://www.npmjs.com/package/verb): Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used… [more](https://github.com/verbose/verb) | [homepage](https://github.com/verbose/verb "Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used on hundreds of projects of all sizes to generate everything from API docs to readmes.")

## Contributing

This document was generated by [verb-readme-generator](https://github.com/verbose/verb-readme-generator) (a [verb](https://github.com/verbose/verb) generator), please don't edit directly. Any changes to the readme must be made in [.verb.md](.verb.md). See [Building Docs](#building-docs).

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

Or visit the [verb-readme-generator](https://github.com/verbose/verb-readme-generator) project to submit bug reports or pull requests for the readme layout template.

## Building docs

_(This document was generated by [verb-readme-generator](https://github.com/verbose/verb-readme-generator) (a [verb](https://github.com/verbose/verb) generator), please don't edit the readme directly. Any changes to the readme must be made in [.verb.md](.verb.md).)_

Generate readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install -g verb verb-readme-generator && verb
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

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on July 04, 2016._