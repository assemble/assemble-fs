# assemble-fs [![NPM version](https://img.shields.io/npm/v/assemble-fs.svg?style=flat)](https://www.npmjs.com/package/assemble-fs) [![NPM monthly downloads](https://img.shields.io/npm/dm/assemble-fs.svg?style=flat)](https://npmjs.org/package/assemble-fs) [![NPM total downloads](https://img.shields.io/npm/dt/assemble-fs.svg?style=flat)](https://npmjs.org/package/assemble-fs) [![Linux Build Status](https://img.shields.io/travis/assemble/assemble-fs.svg?style=flat&label=Travis)](https://travis-ci.org/assemble/assemble-fs)

> Light wrapper for vinyl-fs to add streams support in a way that plays nice with Assemble middleware.

Please consider following this project's author, [Jon Schlinkert](https://github.com/jonschlinkert), and consider starring the project to show your :heart: and support.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save assemble-fs
```

## Heads up!

Major breaking changes in v2.0 of this plugin! [See the Release History](#release-history) for details.

## Usage

```js
const Assemble = require('assemble');

// create your application and add the plugin
const app = new Assemble();
app.use(require('assemble-fs'))

// now you can use `src` and `dest`
app.src(['foo/*.hbs'])
  .pipe(app.dest('site/'));
```

## API

Adds the following methods to your [assemble](https://github.com/assemble/assemble) instance (works with any [Templates][] application):

### [.copy](index.js#L43)

Copy files with the given glob `patterns` to the specified `dest`.

**Params**

* `patterns` **{String|Array}**: Glob patterns of files to copy.
* `dest` **{String|Function}**: Desination directory.
* `returns` **{Stream}**: Stream, to continue processing if necessary.

**Example**

```js
app.task('assets', function(cb) {
  app.copy('assets/**', 'dist/')
    .on('error', cb)
    .on('finish', cb)
});
```

### [.src](index.js#L60)

Glob patterns or filepaths to source files.

**Params**

* `glob` **{String|Array}**: Glob patterns or file paths to source files.
* `options` **{Object}**: Options or locals to merge into the context and/or pass to `src` plugins

**Example**

```js
app.src('src/*.hbs', {layout: 'default'});
```

### [.symlink](index.js#L80)

Glob patterns or paths for symlinks.

**Params**

* `glob` **{String|Array}**

**Example**

```js
app.symlink('src/**');
```

### [.dest](index.js#L95)

Specify a destination for processed files. Runs `.preWrite` and `.postWrite` middleware handlers on all files.

**Params**

* `dest` **{String|Function}**: File path or rename function.
* `options` **{Object}**: Options and locals to pass to `dest` plugins

**Example**

```js
app.dest('dist/');
```

## Release History

**v2.0.0**

* Major breaking changes based on v1.0 of Assemble! Requires Assemble v1.0 or above.

**v0.6.0**

* emit `end` on `app` when stream ends

**v0.3.0**

* breaking change! plugin is wrapped in a function that now be called when registered. e.g. `fs()`. This is to be consistent with assemble's plugin guidelines, and allows the plugin to be auto-loaded following the same format as other plugins.
* rename `files` array to `streamFiles`
* adds `onStream` middleware handler to `src`
* adds `preWrite` middleware handler to `dest`

## About

<details>
<summary><strong>Contributing</strong></summary>

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

</details>

<details>
<summary><strong>Running Tests</strong></summary>

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

</details>

<details>
<summary><strong>Building docs</strong></summary>

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

</details>

### Related projects

You might also be interested in these projects:

* [generate](https://www.npmjs.com/package/generate): Command line tool and developer framework for scaffolding out new GitHub projects. Generate offers the… [more](https://github.com/generate/generate) | [homepage](https://github.com/generate/generate "Command line tool and developer framework for scaffolding out new GitHub projects. Generate offers the robustness and configurability of Yeoman, the expressiveness and simplicity of Slush, and more powerful flow control and composability than either.")
* [update](https://www.npmjs.com/package/update): Be scalable! Update is a new, open source developer framework and CLI for automating updates… [more](https://github.com/update/update) | [homepage](https://github.com/update/update "Be scalable! Update is a new, open source developer framework and CLI for automating updates of any kind in code projects.")
* [verb](https://www.npmjs.com/package/verb): Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used… [more](https://github.com/verbose/verb) | [homepage](https://github.com/verbose/verb "Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used on hundreds of projects of all sizes to generate everything from API docs to readmes.")

### Contributors

| **Commits** | **Contributor** |  
| --- | --- |  
| 100 | [jonschlinkert](https://github.com/jonschlinkert) |  
| 11  | [doowb](https://github.com/doowb) |  

### Author

**Jon Schlinkert**

* [GitHub Profile](https://github.com/jonschlinkert)
* [Twitter Profile](https://twitter.com/jonschlinkert)
* [LinkedIn Profile](https://linkedin.com/in/jonschlinkert)

### License

Copyright © 2018, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.8.0, on December 11, 2018._