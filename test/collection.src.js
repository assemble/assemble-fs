'use strict';

const path = require('path');
const assert = require('assert');
const App = require('templates');
const fs = require('..');
let app, pages;

describe('collection.src()', function() {
  beforeEach(function() {
    app = new App();
    app.use(fs());

    pages = app.create('pages');
  });

  it('should return a stream', function(cb) {
    const stream = pages.src(path.join(__dirname, 'fixtures/*.coffee'));
    assert(stream);
    assert.equal(typeof stream.on, 'function');
    assert.equal(typeof stream.pipe, 'function');
    cb();
  });

  it('should convert vinyl files to views', function(cb) {
    const patterns = path.join(__dirname, 'fixtures/*.coffee');
    pages.src(patterns)
      .on('error', cb)
      .on('data', function(file) {
        assert(file.isView);
      })
      .on('end', cb);
  });

  it('should add src files to the collection', function(cb) {
    const patterns = path.join(__dirname, 'fixtures/*.coffee');

    pages.src(patterns)
      .on('data', function(file) {
        assert(pages.views);
        assert.equal(pages.views.size, 1);
      })
      .on('error', cb)
      .on('end', cb);
  });

  it('should work with views added with other methods', function(cb) {
    pages.set('a', {content: '...'});
    pages.set('b', {content: '...'});
    pages.set('c', {content: '...'});

    const patterns = path.join(__dirname, 'fixtures/*.coffee');
    pages.src(patterns)
      .on('error', cb)
      .on('data', function(file) {
        assert(pages.views);
        assert.equal(pages.views.size, 4);
      })
      .on('end', cb);
  });

  it('should return an input stream from a flat glob', function(cb) {
    const stream = pages.src(path.join(__dirname, 'fixtures/*.coffee'));
    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      assert(file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
      assert.equal(String(file.contents), 'Hello world!');
    });

    stream.on('end', cb);
  });

  it('should return an input stream for multiple globs', function(cb) {
    const globArray = [
      path.join(__dirname, 'fixtures/generic/run.dmc'),
      path.join(__dirname, 'fixtures/generic/test.dmc')
    ];

    const stream = pages.src(globArray);
    const files = [];

    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      files.push(file);
    });

    stream.on('end', function() {
      assert.equal(files.length, 2);
      assert.equal(files[0].path, globArray[0]);
      assert.equal(files[1].path, globArray[1]);
      cb();
    });
  });

  it('should return an input stream for multiple globs with negation', function(cb) {
    const expectedPath = path.join(__dirname, 'fixtures/generic/run.dmc');
    const globArray = [
      path.join(__dirname, 'fixtures/generic/*.dmc'),
      '!' + path.join(__dirname, 'fixtures/generic/test.dmc')
    ];

    const stream = pages.src(globArray);
    const files = [];

    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      files.push(file);
    });

    stream.on('end', function() {
      assert.equal(files.length, 1);
      assert.equal(files[0].path, expectedPath);
      cb();
    });
  });

  it('should return an input stream with no contents when read is false', function(cb) {
    const stream = pages.src(path.join(__dirname, 'fixtures/*.coffee'), {read: false});
    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      assert(!file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
    });

    stream.on('end', cb);
  });

  it('should return an input stream with contents as stream when buffer is false', function(cb) {
    const stream = pages.src(path.join(__dirname, 'fixtures/*.coffee'), {buffer: false});
    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      assert(file.contents);
      let buf = '';
      file.contents.on('data', function(d) {
        buf += d;
      });
      file.contents.on('end', function() {
        assert.equal(buf, 'Hello world!');
        cb();
      });
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
    });
  });

  it('should return an input stream from a deep glob', function(cb) {
    const stream = pages.src(path.join(__dirname, 'fixtures/**/*.jade'));
    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      assert(file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test/run.jade'));
      assert.equal(String(file.contents), 'test template');
    });

    stream.on('end', cb);
  });

  it('should return an input stream from a deeper glob', function(cb) {
    const stream = pages.src(path.join(__dirname, 'fixtures/**/*.dmc'));
    let count = 0;
    stream.on('error', cb);
    stream.on('data', function() {
      ++count;
    });
    stream.on('end', function() {
      assert.equal(count, 2);
      cb();
    });
  });

  it('should return a file stream from a flat path', function(cb) {
    const stream = pages.src(path.join(__dirname, 'fixtures/test.coffee'));
    let count = 0;

    stream.on('error', cb);
    stream.on('data', function(file) {
      ++count;
      assert(file);
      assert(file.path);
      assert(file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
      assert.equal(String(file.contents), 'Hello world!');
    });

    stream.on('end', function() {
      assert.equal(count, 1);
      cb();
    });
  });

  it('should return an input stream from a flat glob', function(cb) {
    const stream = pages.src(path.join(__dirname, 'fixtures/*.coffee'));
    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      assert(file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
      assert.equal(String(file.contents), 'Hello world!');
    });

    stream.on('end', cb);
  });

  it('should return an input stream for multiple globs', function(cb) {
    const globArray = [
      path.join(__dirname, 'fixtures/generic/run.dmc'),
      path.join(__dirname, 'fixtures/generic/test.dmc')
    ];

    const stream = pages.src(globArray);
    const files = [];

    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      files.push(file);
    });
    stream.on('end', function() {
      assert.equal(files.length, 2);
      assert.equal(files[0].path, globArray[0]);
      assert.equal(files[1].path, globArray[1]);
      cb();
    });
  });

  it('should return an input stream for multiple globs, with negation', function(cb) {
    const expectedPath = path.join(__dirname, 'fixtures/generic/run.dmc');
    const globArray = [
      path.join(__dirname, 'fixtures/generic/*.dmc'),
      '!' + path.join(__dirname, 'fixtures/generic/test.dmc')
    ];
    const stream = pages.src(globArray);
    const files = [];

    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      files.push(file);
    });

    stream.on('end', function() {
      assert.equal(files.length, 1);
      assert.equal(files[0].path, expectedPath);
      cb();
    });
  });

  it('should return an input stream with no contents when read is false', function(cb) {
    const stream = pages.src(path.join(__dirname, 'fixtures/*.coffee'), {read: false});
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      assert(!file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
    });
    stream.on('error', cb);
    stream.on('end', cb);
  });

  it('should return an input stream from a deep glob', function(cb) {
    let piped = false;
    pages.src(path.join(__dirname, 'fixtures/*.txt'))
      .on('data', function(file) {
        piped = true;
        assert(file);
        assert(file.path);
        assert(file.contents);
      })
      .on('error', cb)
      .on('end', function() {
        assert(piped);
        cb();
      });
  });

  it('should return an input stream from a deeper glob', function(cb) {
    const stream = pages.src(path.join(__dirname, 'fixtures/**/*.dmc'));
    let count = 0;
    stream.on('error', cb);
    stream.on('data', function() {
      ++count;
    });
    stream.on('end', function() {
      assert.equal(count, 2);
      cb();
    });
  });

  it('should return a file stream from a flat path', function(cb) {
    let count = 0;
    const stream = pages.src(path.join(__dirname, 'fixtures/test.coffee'));
    stream.on('error', cb);
    stream.on('data', function(file) {
      ++count;
      assert(file);
      assert(file.path);
      assert(file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
      assert.equal(String(file.contents), 'Hello world!');
    });
    stream.on('end', function() {
      assert.equal(count, 1);
      cb();
    });
  });
});
