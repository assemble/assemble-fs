'use strict';

const fs = require('graceful-fs');
const File = require('vinyl');
const expect = require('expect');
const cleanup = require('./utils/cleanup');
const isWindows = require('./utils/is-windows');
const testConstants = require('./utils/test-constants');
const { concat, from, pipe } = require('mississippi');

const inputBase = testConstants.inputBase;
const outputBase = testConstants.outputBase;
const inputPath = testConstants.inputPath;
const outputPath = testConstants.outputPath;
const contents = testConstants.contents;
const clean = cleanup(outputBase);
const App = require('templates');
let plugin = require('../..');
let vfs;

describe('.dest() with custom times', function() {
  beforeEach(() => {
    vfs = new App();
    vfs.use(plugin());
  });

  beforeEach(clean);
  afterEach(clean);

  it('does not call futimes when no mtime is provided on the vinyl stat', function(done) {
    // Changing the time of a directory errors in Windows.
    // Windows is treated as though it does not have permission to make this operation.
    if (isWindows) {
      this.skip();
      return;
    }

    var earlier = Date.now() - 1001;

    var futimesSpy = expect.spyOn(fs, 'futimes').andCallThrough();

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      stat: {},
    });

    function assert() {
      var stats = fs.lstatSync(outputPath);

      expect(futimesSpy.calls.length).toEqual(0);
      expect(stats.atime.getTime()).toBeGreaterThan(earlier);
      expect(stats.mtime.getTime()).toBeGreaterThan(earlier);
    }

    pipe([
      from.obj([file]),
      vfs.dest(outputBase, { cwd: __dirname }),
      concat(assert),
    ], done);
  });

  it('calls futimes when an mtime is provided on the vinyl stat', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    // Use new mtime
    var mtime = new Date(Date.now() - 2048);

    var futimesSpy = expect.spyOn(fs, 'futimes').andCallThrough();

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      stat: {
        mtime: mtime,
      },
    });

    function assert() {
      expect(futimesSpy.calls.length).toEqual(1);

      // Compare args instead of fs.lstats(), since mtime may be drifted in x86 Node.js
      var mtimeSpy = futimesSpy.calls[0].arguments[2];

      expect(mtimeSpy.getTime())
        .toEqual(mtime.getTime());

      expect(file.stat.mtime).toEqual(mtime);
    }

    pipe([
      from.obj([file]),
      vfs.dest(outputBase, { cwd: __dirname }),
      concat(assert),
    ], done);
  });

  it('does not call futimes when provided mtime on the vinyl stat is invalid', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    var earlier = Date.now() - 1001;

    var futimesSpy = expect.spyOn(fs, 'futimes').andCallThrough();

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      stat: {
        mtime: new Date(undefined),
      },
    });

    function assert() {
      var stats = fs.lstatSync(outputPath);

      expect(futimesSpy.calls.length).toEqual(0);
      expect(stats.mtime.getTime()).toBeGreaterThan(earlier);
    }

    pipe([
      from.obj([file]),
      vfs.dest(outputBase, { cwd: __dirname }),
      concat(assert),
    ], done);
  });

  it('calls futimes when provided mtime on the vinyl stat is valid but provided atime is invalid', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    // Use new mtime
    var mtime = new Date(Date.now() - 2048);
    var invalidAtime = new Date(undefined);

    var futimesSpy = expect.spyOn(fs, 'futimes').andCallThrough();

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      stat: {
        atime: invalidAtime,
        mtime: mtime,
      },
    });

    function assert() {
      expect(futimesSpy.calls.length).toEqual(1);

      var mtimeSpy = futimesSpy.calls[0].arguments[2];

      expect(mtimeSpy.getTime()).toEqual(mtime.getTime());
    }

    pipe([
      from.obj([file]),
      vfs.dest(outputBase, { cwd: __dirname }),
      concat(assert),
    ], done);
  });

  it('writes file atime and mtime using the vinyl stat', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    // Use new atime/mtime
    var atime = new Date(Date.now() - 2048);
    var mtime = new Date(Date.now() - 1024);

    var futimesSpy = expect.spyOn(fs, 'futimes').andCallThrough();

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      stat: {
        atime: atime,
        mtime: mtime,
      },
    });

    function assert() {
      expect(futimesSpy.calls.length).toEqual(1);

      var atimeSpy = futimesSpy.calls[0].arguments[1];
      var mtimeSpy = futimesSpy.calls[0].arguments[2];

      expect(atimeSpy.getTime()).toEqual(atime.getTime());
      expect(mtimeSpy.getTime()).toEqual(mtime.getTime());
      expect(file.stat.mtime).toEqual(mtime);
      expect(file.stat.atime).toEqual(atime);
    };

    pipe([
      from.obj([file]),
      vfs.dest(outputBase, { cwd: __dirname }),
      concat(assert),
    ], done);
  });
});
