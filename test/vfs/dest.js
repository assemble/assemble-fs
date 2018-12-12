'use strict';

var path = require('path');

var assert = require('assert');
var fs = require('graceful-fs');
var File = require('vinyl');
var expect = require('expect');
var miss = require('mississippi');

var cleanup = require('./utils/cleanup');
var statMode = require('./utils/stat-mode');
var mockError = require('./utils/mock-error');
var applyUmask = require('./utils/apply-umask');
var testStreams = require('./utils/test-streams');
var always = require('./utils/always');
var testConstants = require('./utils/test-constants');
var breakPrototype = require('./utils/break-prototype');

var from = miss.from;
var pipe = miss.pipe;
var concat = miss.concat;

var count = testStreams.count;
var rename = testStreams.rename;
var includes = testStreams.includes;
var slowCount = testStreams.slowCount;
var string = testStreams.string;

function noop() {}

var inputRelative = testConstants.inputRelative;
var outputRelative = testConstants.outputRelative;
var inputBase = testConstants.inputBase;
var outputBase = testConstants.outputBase;
var inputPath = testConstants.inputPath;
var outputPath = testConstants.outputPath;
var outputRenamePath = testConstants.outputRenamePath;
var inputDirpath = testConstants.inputDirpath;
var outputDirpath = testConstants.outputDirpath;
var contents = testConstants.contents;
var sourcemapContents = testConstants.sourcemapContents;

function makeSourceMap() {
  return {
    version: 3,
    file: inputRelative,
    names: [],
    mappings: '',
    sources: [inputRelative],
    sourcesContent: [contents]
  };
}

var clean = cleanup(outputBase);
const App = require('templates');
let plugin = require('../..');
let vfs;

describe('.dest()', function() {
  beforeEach(clean);
  afterEach(clean);
  beforeEach(() => {
    vfs = new App();
    vfs.use(plugin());
  });

  it('throws on no folder argument', cb => {
    function noFolder() {
      vfs.dest();
    }

    expect(noFolder).toThrow();
    cb();
  });

  it('throws on empty string folder argument', cb => {
    function emptyFolder() {
      vfs.dest('');
    }
    expect(emptyFolder).toThrow();
    cb();
  });

  it('accepts the sourcemap option as true', cb => {
    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      sourceMap: makeSourceMap()
    });

    function compare(files) {
      assert.equal(files.length, 1);
      expect(files).toInclude(file);
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase, { sourcemaps: true }), concat(compare)],
      cb
    );
  });

  it('accepts the sourcemap option as a string', cb => {
    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      sourceMap: makeSourceMap()
    });

    function compare(files) {
      assert.equal(files.length, 2);
      expect(files).toInclude(file);
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase, { sourcemaps: '.' }), concat(compare)],
      cb
    );
  });

  it('inlines sourcemaps when option is true', cb => {
    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      sourceMap: makeSourceMap()
    });

    function compare(files) {
      assert.equal(files.length, 1);
      expect(files).toInclude(file);
      expect(files[0].contents.toString()).toMatch(new RegExp(sourcemapContents));
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase, { sourcemaps: true }), concat(compare)],
      cb
    );
  });

  it('generates an extra File when option is a string', cb => {
    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      sourceMap: makeSourceMap()
    });

    function compare(files) {
      assert.equal(files.length, 2);
      expect(files).toInclude(file);
      expect(files[0].contents.toString()).toMatch(new RegExp('//# sourceMappingURL=test.txt.map'));
      assert.equal(files[1].contents, JSON.stringify(makeSourceMap()));
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase, { sourcemaps: '.' }), concat(compare)],
      cb
    );
  });

  it('passes through writes with cwd', cb => {
    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: null
    });

    function compare(files) {
      assert.equal(files.length, 1);
      expect(files).toInclude(file);
      assert.equal(files[0].cwd, __dirname, 'cwd should have changed');
    }

    pipe(
      [from.obj([file]), vfs.dest(outputRelative, { cwd: __dirname }), concat(compare)],
      cb
    );
  });

  it('passes through writes with default cwd', cb => {
    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: null
    });

    function compare(files) {
      assert.equal(files.length, 1);
      expect(files).toInclude(file);
      assert.equal(files[0].cwd, process.cwd(), 'cwd should not have changed');
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase), concat(compare)],
      cb
    );
  });

  it('does not write null files', cb => {
    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: null
    });

    function compare(files) {
      var exists = fs.existsSync(outputPath);

      assert.equal(files.length, 1);
      expect(files).toInclude(file);
      assert.equal(files[0].base, outputBase, 'base should have changed');
      assert.equal(files[0].path, outputPath, 'path should have changed');
      assert.equal(exists, false);
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase), concat(compare)],
      cb
    );
  });

  it('writes buffer files to the right folder with relative cwd', cb => {
    var cwd = path.relative(process.cwd(), __dirname);

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents)
    });

    function compare(files) {
      var outputContents = fs.readFileSync(outputPath, 'utf8');

      assert.equal(files.length, 1);
      expect(files).toInclude(file);
      assert.equal(files[0].cwd, __dirname, 'cwd should have changed');
      assert.equal(files[0].base, outputBase, 'base should have changed');
      assert.equal(files[0].path, outputPath, 'path should have changed');
      assert.equal(outputContents, contents);
    }

    pipe(
      [from.obj([file]), vfs.dest(outputRelative, { cwd: cwd }), concat(compare)],
      cb
    );
  });

  it('writes buffer files to the right folder with function and relative cwd', cb => {
    var cwd = path.relative(process.cwd(), __dirname);

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents)
    });

    function outputFn(f) {
      assert(f);
      assert(file);
      return outputRelative;
    }

    function compare(files) {
      var outputContents = fs.readFileSync(outputPath, 'utf8');

      assert.equal(files.length, 1);
      expect(files).toInclude(file);
      assert.equal(files[0].cwd, __dirname, 'cwd should have changed');
      assert.equal(files[0].base, outputBase, 'base should have changed');
      assert.equal(files[0].path, outputPath, 'path should have changed');
      assert.equal(outputContents, contents);
    }

    pipe(
      [from.obj([file]), vfs.dest(outputFn, { cwd: cwd }), concat(compare)],
      cb
    );
  });

  it('writes buffer files to the right folder', cb => {
    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents)
    });

    function compare(files) {
      var outputContents = fs.readFileSync(outputPath, 'utf8');

      assert.equal(files.length, 1);
      expect(files).toInclude(file);
      assert.equal(files[0].base, outputBase, 'base should have changed');
      assert.equal(files[0].path, outputPath, 'path should have changed');
      assert.equal(outputContents, contents);
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase), concat(compare)],
      cb
    );
  });

  it('writes streaming files to the right folder', cb => {
    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: from([contents])
    });

    function compare(files) {
      var outputContents = fs.readFileSync(outputPath, 'utf8');

      assert.equal(files.length, 1);
      expect(files).toInclude(file);
      assert.equal(files[0].base, outputBase, 'base should have changed');
      assert.equal(files[0].path, outputPath, 'path should have changed');
      assert.equal(outputContents, contents);
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase), concat(compare)],
      cb
    );
  });

  it('writes large streaming files to the right folder', cb => {
    var size = 40000;

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: string(size)
    });

    function compare(files) {
      var stats = fs.lstatSync(outputPath);

      assert.equal(files.length, 1);
      expect(files).toInclude(file);
      assert.equal(stats.size, size);
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase), concat(compare)],
      cb
    );
  });

  it('writes directories to the right folder', cb => {
    var file = new File({
      base: inputBase,
      path: inputDirpath,
      contents: null,
      stat: {
        isDirectory: always(true)
      }
    });

    function compare(files) {
      var stats = fs.lstatSync(outputDirpath);

      assert.equal(files.length, 1);
      expect(files).toInclude(file);
      assert.equal(files[0].base, outputBase, 'base should have changed');
      // TODO: normalize this path
      assert.equal(files[0].path, outputDirpath, 'path should have changed');
      assert.equal(stats.isDirectory(), true);
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase), concat(compare)],
      cb
    );
  });

  it('allows piping multiple dests in streaming mode', cb => {
    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents)
    });

    function compare() {
      var outputContents1 = fs.readFileSync(outputPath, 'utf8');
      var outputContents2 = fs.readFileSync(outputRenamePath, 'utf8');
      assert.equal(outputContents1, contents);
      assert.equal(outputContents2, contents);
    }

    pipe(
      [
        from.obj([file]),
        includes({ path: inputPath }),
        vfs.dest(outputBase),
        rename(outputRenamePath),
        includes({ path: outputRenamePath }),
        vfs.dest(outputBase),
        concat(compare)
      ],
      cb
    );
  });

  it('writes new files with the default user mode', cb => {
    var expectedMode = applyUmask('666');

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents)
    });

    function compare(files) {
      assert.equal(files.length, 1);
      expect(files).toInclude(file);
      assert.equal(statMode(outputPath), expectedMode);
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase), concat(compare)],
      cb
    );
  });

  it('reports i/o errors', cb => {
    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents)
    });

    function compare(err) {
      assert(err, 'expected an error');
      cb();
    }

    fs.mkdirSync(outputBase);
    fs.closeSync(fs.openSync(outputPath, 'w'));
    fs.chmodSync(outputPath, 0);

    pipe(
      [from.obj([file]), vfs.dest(outputBase)],
      compare
    );
  });

  it('reports stat errors', cb => {
    var expectedMode = applyUmask('722');

    var fstatSpy = expect.spyOn(fs, 'fstat').andCall(mockError);

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      stat: {
        mode: expectedMode
      }
    });

    function compare(err) {
      assert(err, 'expected an error');
      assert.equal(fstatSpy.calls.length, 1);
      cb();
    }

    fs.mkdirSync(outputBase);
    fs.closeSync(fs.openSync(outputPath, 'w'));

    pipe(
      [from.obj([file]), vfs.dest(outputBase)],
      compare
    );
  });

  it('does not overwrite files with overwrite option set to false', cb => {
    var existingContents = 'Lorem Ipsum';

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents)
    });

    function compare(files) {
      var outputContents = fs.readFileSync(outputPath, 'utf8');

      assert.equal(files.length, 1);
      assert.equal(outputContents, existingContents);
    }

    // Write expected file which should not be overwritten
    fs.mkdirSync(outputBase);
    fs.writeFileSync(outputPath, existingContents);

    pipe(
      [from.obj([file]), vfs.dest(outputBase, { overwrite: false }), concat(compare)],
      cb
    );
  });

  it('overwrites files with overwrite option set to true', cb => {
    var existingContents = 'Lorem Ipsum';

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents)
    });

    function compare(files) {
      var outputContents = fs.readFileSync(outputPath, 'utf8');

      assert.equal(files.length, 1);
      assert.equal(outputContents, contents);
    }

    // This should be overwritten
    fs.mkdirSync(outputBase);
    fs.writeFileSync(outputPath, existingContents);

    pipe(
      [from.obj([file]), vfs.dest(outputBase, { overwrite: true }), concat(compare)],
      cb
    );
  });

  it('does not overwrite files with overwrite option set to a function that returns false', cb => {
    var existingContents = 'Lorem Ipsum';

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents)
    });

    function overwrite(f) {
      assert.equal(f, file);
      return false;
    }

    function compare(files) {
      var outputContents = fs.readFileSync(outputPath, 'utf8');

      assert.equal(files.length, 1);
      assert.equal(outputContents, existingContents);
    }

    // Write expected file which should not be overwritten
    fs.mkdirSync(outputBase);
    fs.writeFileSync(outputPath, existingContents);

    pipe(
      [from.obj([file]), vfs.dest(outputBase, { overwrite: overwrite }), concat(compare)],
      cb
    );
  });

  it('overwrites files with overwrite option set to a function that returns true', cb => {
    var existingContents = 'Lorem Ipsum';

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents)
    });

    function overwrite(f) {
      assert.equal(f, file);
      return true;
    }

    function compare(files) {
      var outputContents = fs.readFileSync(outputPath, 'utf8');

      assert.equal(files.length, 1);
      assert.equal(outputContents, contents);
    }

    // This should be overwritten
    fs.mkdirSync(outputBase);
    fs.writeFileSync(outputPath, existingContents);

    pipe(
      [from.obj([file]), vfs.dest(outputBase, { overwrite: overwrite }), concat(compare)],
      cb
    );
  });

  it('appends content with append option set to true', cb => {
    var existingContents = 'Lorem Ipsum';

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents)
    });

    function compare(files) {
      var outputContents = fs.readFileSync(outputPath, 'utf8');

      assert.equal(files.length, 1);
      assert.equal(outputContents, existingContents + contents);
    }

    // This should be overwritten
    fs.mkdirSync(outputBase);
    fs.writeFileSync(outputPath, existingContents);

    pipe(
      [from.obj([file]), vfs.dest(outputBase, { append: true }), concat(compare)],
      cb
    );
  });

  it('appends content with append option set to a function that returns true', cb => {
    var existingContents = 'Lorem Ipsum';

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents)
    });

    function append(f) {
      assert.equal(f, file);
      return true;
    }

    function compare(files) {
      var outputContents = fs.readFileSync(outputPath, 'utf8');

      assert.equal(files.length, 1);
      assert.equal(outputContents, existingContents + contents);
    }

    // This should be overwritten
    fs.mkdirSync(outputBase);
    fs.writeFileSync(outputPath, existingContents);

    pipe(
      [from.obj([file]), vfs.dest(outputBase, { append: append }), concat(compare)],
      cb
    );
  });

  it('emits a finish event', cb => {
    var destStream = vfs.dest(outputBase);

    destStream.once('finish', cb);

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from('1234567890')
    });

    pipe([from.obj([file]), destStream]);
  });

  it('does not get clogged by highWaterMark', cb => {
    var expectedCount = 17;
    var highwatermarkFiles = [];
    for (var idx = 0; idx < expectedCount; idx++) {
      var file = new File({
        base: inputBase,
        path: inputPath,
        contents: Buffer.from(contents)
      });
      highwatermarkFiles.push(file);
    }

    pipe(
      [
        from.obj(highwatermarkFiles),
        count(expectedCount),
        // Must be in the Writable position to test this
        // So concat-stream cannot be used
        vfs.dest(outputBase)
      ],
      cb
    );
  });

  it('allows backpressure when piped to another, slower stream', function(cb) {
    this.timeout(20000);

    var expectedCount = 24;
    var highwatermarkFiles = [];
    for (var idx = 0; idx < expectedCount; idx++) {
      var file = new File({
        base: inputBase,
        path: inputPath,
        contents: Buffer.from(contents)
      });
      highwatermarkFiles.push(file);
    }

    pipe(
      [from.obj(highwatermarkFiles), count(expectedCount), vfs.dest(outputBase), slowCount(expectedCount)],
      cb
    );
  });

  it('respects readable listeners on destination stream', cb => {
    var file = new File({
      base: inputBase,
      path: inputDirpath,
      contents: null
    });

    var destStream = vfs.dest(outputBase);
    var readables = 0;
    destStream.on('readable', function() {
      var data = destStream.read();
      if (data != null) {
        readables++;
      }
    });

    function compare(err) {
      assert.equal(readables, 1);
      cb(err);
    }

    pipe([from.obj([file]), destStream], compare);
  });

  it('respects data listeners on destination stream', cb => {
    var file = new File({
      base: inputBase,
      path: inputDirpath,
      contents: null
    });

    var destStream = vfs.dest(outputBase);

    var datas = 0;
    destStream.on('data', function() {
      datas++;
    });

    function compare(err) {
      assert.equal(datas, 1);
      cb(err);
    }

    pipe([from.obj([file]), destStream], compare);
  });

  it('sinks the stream if all the readable event handlers are removed', cb => {
    var expectedCount = 17;
    var highwatermarkFiles = [];
    for (var idx = 0; idx < expectedCount; idx++) {
      var file = new File({
        base: inputBase,
        path: inputPath,
        contents: Buffer.from(contents)
      });
      highwatermarkFiles.push(file);
    }

    var destStream = vfs.dest(outputBase);

    destStream.on('readable', noop);

    pipe(
      [
        from.obj(highwatermarkFiles),
        count(expectedCount),
        // Must be in the Writable position to test this
        // So concat-stream cannot be used
        destStream
      ],
      cb
    );

    process.nextTick(function() {
      destStream.removeListener('readable', noop);
    });
  });

  it('sinks the stream if all the data event handlers are removed', cb => {
    var expectedCount = 17;
    var highwatermarkFiles = [];
    for (var idx = 0; idx < expectedCount; idx++) {
      var file = new File({
        base: inputBase,
        path: inputPath,
        contents: Buffer.from(contents)
      });
      highwatermarkFiles.push(file);
    }

    var destStream = vfs.dest(outputBase);

    destStream.on('data', noop);

    pipe(
      [
        from.obj(highwatermarkFiles),
        count(expectedCount),
        // Must be in the Writable position to test this
        // So concat-stream cannot be used
        destStream
      ],
      cb
    );

    process.nextTick(function() {
      destStream.removeListener('data', noop);
    });
  });

  it('successfully processes files with streaming contents', cb => {
    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: from([contents])
    });

    pipe([from.obj([file]), vfs.dest(outputBase)], cb);
  });

  it('errors when a non-Vinyl object is emitted', cb => {
    let file = {};
    pipe([from.obj([file]), vfs.dest(outputBase)], err => {
      assert(err, 'expected an error');
      assert.equal(err.message, 'Received a non-Vinyl object in `dest()`');
      cb();
    });
  });

  it('errors when a buffer-mode stream is piped to it', cb => {
    let file = Buffer.from('test');

    pipe([from([file]), vfs.dest(outputBase)], err => {
      assert(err, 'expected an error');
      assert.equal(err.message, 'Received a non-Vinyl object in `dest()`');
      cb();
    });
  });

  it('errors if we cannot mkdirp', cb => {
    let mkdirSpy = expect.spyOn(fs, 'mkdir').andCall(mockError);
    let file = new File({
      base: inputBase,
      path: inputPath,
      contents: null
    });

    pipe([from.obj([file]), vfs.dest(outputBase)], err => {
      assert(err, 'expected an error');
      assert.equal(mkdirSpy.calls.length, 1);
      cb();
    });
  });

  it('errors if vinyl object is a directory and we cannot mkdirp', cb => {
    var ogMkdir = fs.mkdir;
    var mkdirSpy = expect.spyOn(fs, 'mkdir').andCall(function() {
      if (mkdirSpy.calls.length > 1) {
        mockError.apply(this, arguments);
      } else {
        ogMkdir.apply(this, arguments);
      }
    });

    var file = new File({
      base: inputBase,
      path: inputDirpath,
      contents: null,
      stat: {
        isDirectory: always(true)
      }
    });

    function compare(err) {
      assert(err, 'expected an error');
      assert.equal(mkdirSpy.calls.length, 2);
      cb();
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase)],
      compare
    );
  });

  // TODO: is this correct behavior? had to adjust it
  it('does not error if vinyl object is a directory and we cannot open it', cb => {
    var file = new File({
      base: inputBase,
      path: inputDirpath,
      contents: null,
      stat: {
        isDirectory: always(true),
        mode: applyUmask('000')
      }
    });

    function compare() {
      var exists = fs.existsSync(outputDirpath);
      assert.equal(exists, true);
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase), concat(compare)],
      cb
    );
  });

  it('errors if vinyl object is a directory and open errors', cb => {
    var openSpy = expect.spyOn(fs, 'open').andCall(mockError);

    var file = new File({
      base: inputBase,
      path: inputDirpath,
      contents: null,
      stat: {
        isDirectory: always(true)
      }
    });

    function compare(err) {
      assert(err, 'expected an error');
      assert.equal(openSpy.calls.length, 1);
      cb();
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase)],
      compare
    );
  });

  it('errors if content stream errors', cb => {
    var contentStream = from(function(size, cb) {
      cb(new Error('mocked error'));
    });

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: contentStream
    });

    function compare(err) {
      assert(err, 'expected an error');
      cb();
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase)],
      compare
    );
  });

  it('does not pass options on to through2', cb => {
    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: null
    });

    // Reference: https://github.com/gulpjs/vinyl-fs/issues/153
    var read = expect.createSpy().andReturn(false);

    function compare() {
      // Called never because it's not a valid option
      assert.equal(read.calls.length, 0);
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase, { read: read }), concat(compare)],
      cb
    );
  });

  it('does not marshall a Vinyl object with isSymbolic method', cb => {
    var file = new File({
      base: outputBase,
      path: outputPath
    });

    function compare(files) {
      assert.equal(files.length, 1);
      // Avoid comparing stats because they get reflected
      delete files[0].stat;
      expect(files[0]).toMatch(file);
      expect(files[0]).toBe(file);
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase), concat(compare)],
      cb
    );
  });

  it('marshalls a Vinyl object without isSymbolic to a newer Vinyl', cb => {
    var file = new File({
      base: outputBase,
      path: outputPath
    });

    breakPrototype(file);

    function compare(files) {
      assert.equal(files.length, 1);
      // Avoid comparing stats because they get reflected
      delete files[0].stat;
      expect(files[0]).toMatch(file);
      expect(files[0]).toNotBe(file);
    }

    pipe(
      [from.obj([file]), vfs.dest(outputBase), concat(compare)],
      cb
    );
  });
});
