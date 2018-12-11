'use strict';

const fs = require('graceful-fs');
const File = require('vinyl');
const expect = require('expect');

const cleanup = require('./utils/cleanup');
const statMode = require('./utils/stat-mode');
const mockError = require('./utils/mock-error');
const isWindows = require('./utils/is-windows');
const applyUmask = require('./utils/apply-umask');
const always = require('./utils/always');
const testConstants = require('./utils/test-constants');

const { concat, from, pipe } = require('mississippi');
const inputBase = testConstants.inputBase;
const outputBase = testConstants.outputBase;
const inputPath = testConstants.inputPath;
const outputPath = testConstants.outputPath;
const inputDirpath = testConstants.inputDirpath;
const outputDirpath = testConstants.outputDirpath;
const inputNestedPath = testConstants.inputNestedPath;
const outputNestedPath = testConstants.outputNestedPath;
const contents = testConstants.contents;
const clean = cleanup(outputBase);
const App = require('templates');
let plugin = require('../..');
let vfs;

describe('.dest() with custom modes', function() {
  beforeEach(() => {
    vfs = new App();
    vfs.use(plugin());
  });

  beforeEach(clean);
  afterEach(clean);

  it('sets the mode of a written buffer file if set on the vinyl object', function(done) {
    // Changing the mode of a file is not supported by node.js in Windows.
    // Windows is treated as though it does not have permission to make this operation.
    if (isWindows) {
      this.skip();
      return;
    }

    let expectedMode = applyUmask('677');
    let file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      stat: {
        mode: expectedMode,
      },
    });

    function assert() {
      expect(statMode(outputPath)).toEqual(expectedMode);
    }

    pipe([
      from.obj([file]),
      vfs.dest(outputBase, { cwd: __dirname }),
      concat(assert),
    ], done);
  });

  it('sets the sticky bit on the mode of a written stream file if set on the vinyl object', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    let expectedMode = applyUmask('1677');

    let file = new File({
      base: inputBase,
      path: inputPath,
      contents: from([contents]),
      stat: {
        mode: expectedMode,
      },
    });

    function assert() {
      expect(statMode(outputPath)).toEqual(expectedMode);
    }

    pipe([
      from.obj([file]),
      vfs.dest(outputBase, { cwd: __dirname }),
      concat(assert),
    ], done);
  });

  it('sets the mode of a written stream file if set on the vinyl object', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    let expectedMode = applyUmask('677');

    let file = new File({
      base: inputBase,
      path: inputPath,
      contents: from([contents]),
      stat: {
        mode: expectedMode,
      },
    });

    function assert() {
      expect(statMode(outputPath)).toEqual(expectedMode);
    }

    pipe([
      from.obj([file]),
      vfs.dest(outputBase, { cwd: __dirname }),
      concat(assert),
    ], done);
  });

  it('sets the mode of a written directory if set on the vinyl object', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    let expectedMode = applyUmask('677');

    let file = new File({
      base: inputBase,
      path: inputDirpath,
      contents: null,
      stat: {
        isDirectory: always(true),
        mode: expectedMode,
      },
    });

    function assert() {
      expect(statMode(outputDirpath)).toEqual(expectedMode);
    }

    pipe([
      from.obj([file]),
      vfs.dest(outputBase, { cwd: __dirname }),
      concat(assert),
    ], done);
  });

  it('sets sticky bit on the mode of a written directory if set on the vinyl object', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    let expectedMode = applyUmask('1677');

    let file = new File({
      base: inputBase,
      path: inputDirpath,
      contents: null,
      stat: {
        isDirectory: always(true),
        mode: expectedMode,
      },
    });

    function assert() {
      expect(statMode(outputDirpath)).toEqual(expectedMode);
    }

    pipe([
      from.obj([file]),
      vfs.dest(outputBase, { cwd: __dirname }),
      concat(assert),
    ], done);
  });

  it('writes new files with the mode specified in options', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    let expectedMode = applyUmask('777');

    let file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
    });

    function assert() {
      expect(statMode(outputPath)).toEqual(expectedMode);
    }

    pipe([
      from.obj([file]),
      vfs.dest(outputBase, { cwd: __dirname, mode: expectedMode }),
      concat(assert),
    ], done);
  });

  it('updates the file mode to match the vinyl mode', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    let startMode = applyUmask('655');
    let expectedMode = applyUmask('722');

    let file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      stat: {
        mode: expectedMode,
      },
    });

    function assert() {
      expect(statMode(outputPath)).toEqual(expectedMode);
    }

    fs.mkdirSync(outputBase);
    fs.closeSync(fs.openSync(outputPath, 'w'));
    fs.chmodSync(outputPath, startMode);

    pipe([
      from.obj([file]),
      vfs.dest(outputBase, { cwd: __dirname }),
      concat(assert),
    ], done);
  });

  it('updates the directory mode to match the vinyl mode', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    let startMode = applyUmask('2777');
    let expectedMode = applyUmask('727');

    let file1 = new File({
      base: inputBase,
      path: outputDirpath,
      stat: {
        isDirectory: always(true),
        mode: startMode,
      },
    });
    let file2 = new File({
      base: inputBase,
      path: outputDirpath,
      stat: {
        isDirectory: always(true),
        mode: expectedMode,
      },
    });

    function assert() {
      expect(statMode(outputDirpath)).toEqual(expectedMode);
    }

    pipe([
      from.obj([file1, file2]),
      vfs.dest(outputBase, { cwd: __dirname }),
      concat(assert),
    ], done);
  });

  it('uses different modes for files and directories', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    let expectedDirMode = applyUmask('2777');
    let expectedFileMode = applyUmask('755');

    let file = new File({
      base: inputBase,
      path: inputNestedPath,
      contents: Buffer.from(contents),
    });

    function assert() {
      expect(statMode(outputDirpath)).toEqual(expectedDirMode);
      expect(statMode(outputNestedPath)).toEqual(expectedFileMode);
    }

    pipe([
      from.obj([file]),
      vfs.dest(outputBase, {
        cwd: __dirname,
        mode: expectedFileMode,
        dirMode: expectedDirMode,
      }),
      concat(assert),
    ], done);
  });

  it('does not fchmod a matching file', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    let fchmodSpy = expect.spyOn(fs, 'fchmod').andCallThrough();

    let expectedMode = applyUmask('777');

    let file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      stat: {
        mode: expectedMode,
      },
    });

    function assert() {
      expect(fchmodSpy.calls.length).toEqual(0);
      expect(statMode(outputPath)).toEqual(expectedMode);
    }

    pipe([
      from.obj([file]),
      vfs.dest(outputBase, { cwd: __dirname }),
      concat(assert),
    ], done);
  });

  it('sees a file with special chmod (setuid/setgid/sticky) as distinct', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    let fchmodSpy = expect.spyOn(fs, 'fchmod').andCallThrough();

    let startMode = applyUmask('3722');
    let expectedMode = applyUmask('722');

    let file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      stat: {
        mode: expectedMode,
      },
    });

    function assert() {
      expect(fchmodSpy.calls.length).toEqual(1);
    }

    fs.mkdirSync(outputBase);
    fs.closeSync(fs.openSync(outputPath, 'w'));
    fs.chmodSync(outputPath, startMode);

    pipe([
      from.obj([file]),
      vfs.dest(outputBase, { cwd: __dirname }),
      concat(assert),
    ], done);
  });

  it('reports fchmod errors', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    let expectedMode = applyUmask('722');
    let fchmodSpy = expect.spyOn(fs, 'fchmod').andCall(mockError);

    let file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      stat: {
        mode: expectedMode,
      },
    });

    function assert(err) {
      expect(err).toExist();
      expect(fchmodSpy.calls.length).toEqual(1);
      done();
    }

    fs.mkdirSync(outputBase);
    fs.closeSync(fs.openSync(outputPath, 'w'));

    pipe([
      from.obj([file]),
      vfs.dest(outputBase, { cwd: __dirname }),
    ], assert);
  });
});
