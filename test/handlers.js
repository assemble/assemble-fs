'use strict';

const path = require('path');
const assert = require('assert');
const rimraf = require('rimraf');
const App = require('templates');
const File = require('vinyl');
const vfs = require('..');
let app;

describe('handlers', function() {
  beforeEach(function() {
    app = new App();
    app.use(vfs());
  });

  afterEach(function(cb) {
    rimraf(path.join(__dirname, './out-fixtures/'), cb);
  });

  it('should handle onLoad', function(cb) {
    let count = 0;
    app.onLoad(/./, function(file) {
      count++;
    });

    app.src(path.join(__dirname, './fixtures/vinyl/test.coffee'))
      .pipe(app.dest('./out-fixtures/', {cwd: __dirname}))
      .on('end', function() {
        assert.equal(count, 1);
        cb();
      });
  });

  it('should handle preWrite', function(cb) {
    let count = 0;
    app.preWrite(/./, function(file) {
      count++;
    });

    const srcPath = path.join(__dirname, './fixtures/vinyl/test.coffee');
    const stream = app.dest('./out-fixtures/', {
      cwd: __dirname
    });

    stream.once('finish', function() {
      assert.equal(count, 1);
      cb();
    });

    const file = new File({
      path: srcPath,
      cwd: __dirname,
      contents: Buffer.from('1234567890')
    });

    stream.write(file);
    stream.end();
  });

  it('should handle postWrite', function(cb) {
    let count = 0;
    app.postWrite(/./, function(file) {
      count++;
    });

    const srcPath = path.join(__dirname, './fixtures/vinyl/test.coffee');
    const stream = app.dest('./out-fixtures/', {
      cwd: __dirname
    });

    stream.once('finish', function() {
      assert.equal(count, 1);
      cb();
    });

    const file = new File({
      path: srcPath,
      cwd: __dirname,
      contents: Buffer.from('1234567890')
    });

    stream.write(file);
    stream.end();
  });
});
