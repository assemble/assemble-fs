'use strict';

const path = require('path');
const assert = require('assert');
const rimraf = require('rimraf');
const App = require('templates');
const File = require('vinyl');
const vfs = require('..');
let app;

describe('handlers', () => {
  beforeEach(() => {
    app = new App();
    app.use(vfs());
  });

  afterEach(cb => {
    rimraf(path.join(__dirname, './out-fixtures/'), cb);
  });

  it('should handle onLoad', cb => {
    let count = 0;
    app.onLoad(/./, file => {
      count++;
    });

    app.src(path.join(__dirname, './fixtures/vinyl/test.coffee'))
      .pipe(app.dest('./out-fixtures/', {cwd: __dirname}))
      .on('end', () => {
        assert.equal(count, 1);
        cb();
      });
  });

  it('should handle preWrite', cb => {
    let count = 0;
    app.preWrite(/./, file => {
      count++;
    });

    const srcPath = path.join(__dirname, './fixtures/vinyl/test.coffee');
    const stream = app.dest('./out-fixtures/', {
      cwd: __dirname
    });

    stream.once('finish', () => {
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

  it('should handle postWrite', cb => {
    let count = 0;
    app.postWrite(/./, file => {
      count++;
    });

    const srcPath = path.join(__dirname, './fixtures/vinyl/test.coffee');
    const stream = app.dest('./out-fixtures/', {
      cwd: __dirname
    });

    stream.once('finish', () => {
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
