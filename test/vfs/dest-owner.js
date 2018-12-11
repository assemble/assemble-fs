'use strict';

const fs = require('graceful-fs');
const File = require('vinyl');
const expect = require('expect');
const { concat, from, pipe } = require('mississippi');
const cleanup = require('./utils/cleanup');
const isWindows = require('./utils/is-windows');
const testConstants = require('./utils/test-constants');
const inputBase = testConstants.inputBase;
const outputBase = testConstants.outputBase;
const inputPath = testConstants.inputPath;
const contents = testConstants.contents;
const clean = cleanup(outputBase);
const App = require('templates');
let plugin = require('../..');
let vfs;

describe('.dest() with custom owner', function() {
  beforeEach(() => {
    vfs = new App();
    vfs.use(plugin());
  });

  beforeEach(clean);
  afterEach(clean);

  it('calls fchown when the uid and/or gid are provided on the vinyl stat', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    var fchownSpy = expect.spyOn(fs, 'fchown').andCallThrough();

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      stat: {
        uid: 1001,
        gid: 1001,
      },
    });

    function assert() {
      expect(fchownSpy.calls.length).toEqual(1);
      expect(fchownSpy.calls[0].arguments[1]).toEqual(1001);
      expect(fchownSpy.calls[0].arguments[2]).toEqual(1001);
    }

    pipe([
      from.obj([file]),
      vfs.dest(outputBase),
      concat(assert),
    ], done);
  });

  it('does not call fchown when the uid and gid provided on the vinyl stat are invalid', function(done) {
    if (isWindows) {
      this.skip();
      return;
    }

    var fchownSpy = expect.spyOn(fs, 'fchown').andCallThrough();

    var file = new File({
      base: inputBase,
      path: inputPath,
      contents: Buffer.from(contents),
      stat: {
        uid: -1,
        gid: -1,
      },
    });

    function assert() {
      expect(fchownSpy.calls.length).toEqual(0);
    }

    pipe([
      from.obj([file]),
      vfs.dest(outputBase),
      concat(assert),
    ], done);
  });
});
