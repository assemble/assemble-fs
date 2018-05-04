'use strict';

const path = require('path');
const assert = require('assert');
const App = require('templates');
const vfs = require('..');
let app;

describe('src()', function() {
  beforeEach(function() {
    app = new App();
    app.create('pages');
    app.use(vfs());
  });

  it('should return a stream', function(cb) {
    const stream = app.src(path.join(__dirname, 'fixtures/*.coffee'));
    assert(stream);
    assert.equal(typeof stream.on, 'function');
    assert.equal(typeof stream.pipe, 'function');
    cb();
  });

  it('should return an input stream from a flat glob', function(cb) {
    const stream = app.src(path.join(__dirname, 'fixtures/*.coffee'));
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

  it('should add files to an existing collection', function(cb) {
    app.create('files');
    app.files('foo', { content: 'this is content' });

    const stream = app.src(path.join(__dirname, 'fixtures/test.coffee'), { collection: 'files' });
    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      assert(file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
      assert.equal(String(file.contents), 'Hello world!');
    });

    stream.on('end', function() {
      assert.equal(app.views.get('files').size, 2);
      cb();
    });
  });

  it('should add files to a new specified collection', function(cb) {
    var stream = app.src(path.join(__dirname, 'fixtures/test.coffee'), { collection: 'docs' });
    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      assert(file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
      assert.equal(String(file.contents), 'Hello world!');
    });

    stream.on('end', function() {
      assert.equal(app.views.get('docs').size, 1);
      cb();
    });
  });

  it('should return an input stream for multiple globs', function(cb) {
    const globs = [
      path.join(__dirname, 'fixtures/generic/run.dmc'),
      path.join(__dirname, 'fixtures/generic/test.dmc')
    ];

    const stream = app.src(globs);
    const files = [];

    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      files.push(file);
    });

    stream.on('end', function() {
      assert.equal(files.length, 2);
      assert.equal(files[0].path, globs[0]);
      assert.equal(files[1].path, globs[1]);
      cb();
    });
  });

  it('should return an input stream for multiple globs with negation', function(cb) {
    var expectedPath = path.join(__dirname, 'fixtures/generic/run.dmc');
    var globArray = [
      path.join(__dirname, 'fixtures/generic/*.dmc'),
      '!' + path.join(__dirname, 'fixtures/generic/test.dmc')
    ];
    var stream = app.src(globArray);

    var files = [];
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
    app.src(path.join(__dirname, 'fixtures/*.coffee'), { read: false })
      .on('error', cb)
      .on('data', function(file) {
        assert(file);
        assert(file.path);
        assert(!file.contents);
        assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
      })
      .on('end', cb);
  });

  it('should not blow up when no files are matched', function(cb) {
    app
      .src(['test.js', 'foo/*.js'])
      .on('error', cb)
      .on('data', function() {})
      .on('end', cb);
  });

  it('should return an input stream with contents as stream when buffer is false', function(cb) {
    var stream = app.src(path.join(__dirname, 'fixtures/*.coffee'), { buffer: false });
    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      assert(file.contents);
      var buf = '';
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
    var stream = app.src(path.join(__dirname, 'fixtures/**/*.jade'));
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
    var stream = app.src(path.join(__dirname, 'fixtures/**/*.dmc'));
    var a = 0;
    stream.on('error', cb);
    stream.on('data', function() {
      ++a;
    });
    stream.on('end', function() {
      assert.equal(a, 2);
      cb();
    });
  });

  it('should return a file stream from a flat path', function(cb) {
    var a = 0;
    var stream = app.src(path.join(__dirname, 'fixtures/test.coffee'));
    stream.on('error', cb);
    stream.on('data', function(file) {
      ++a;
      assert(file);
      assert(file.path);
      assert(file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
      assert.equal(String(file.contents), 'Hello world!');
    });
    stream.on('end', function() {
      assert.equal(a, 1);
      cb();
    });
  });

  it('should return a stream', function(cb) {
    var stream = app.src(path.join(__dirname, 'fixtures/*.coffee'));
    assert(stream);
    assert(stream.on);
    cb();
  });

  it('should return an input stream from a flat glob', function(cb) {
    var stream = app.src(path.join(__dirname, 'fixtures/*.coffee'));
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

  it('should return an input stream for multiple globs, with negation', function(cb) {
    var expectedPath = path.join(__dirname, 'fixtures/generic/run.dmc');
    var globArray = [
      path.join(__dirname, 'fixtures/generic/*.dmc'),
      '!' + path.join(__dirname, 'fixtures/generic/test.dmc')
    ];
    var stream = app.src(globArray);

    var files = [];
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
    var stream = app.src(path.join(__dirname, 'fixtures/*.coffee'), { read: false });
    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      assert(!file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
    });
    stream.on('end', cb);
  });

  it('should return an input stream from a deep glob', function(cb) {
    app
      .src(path.join(__dirname, 'fixtures/**/*.jade'))
      .on('error', cb)
      .on('data', function(file) {
        assert(file);
        assert(file.path);
        assert(file.contents);
        assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test/run.jade'));
        assert.equal(String(file.contents), 'test template');
      })
      .on('end', function() {
        cb();
      });
  });

  it('should return an input stream from a deeper glob', function(cb) {
    var stream = app.src(path.join(__dirname, 'fixtures/**/*.dmc'));
    var a = 0;
    stream.on('error', cb);
    stream.on('data', function() {
      ++a;
    });
    stream.on('end', function() {
      assert.equal(a, 2);
      cb();
    });
  });

  it('should return a file stream from a flat path', function(cb) {
    var a = 0;
    var stream = app.src(path.join(__dirname, 'fixtures/test.coffee'));
    stream.on('error', cb);
    stream.on('data', function(file) {
      ++a;
      assert(file);
      assert(file.path);
      assert(file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
      assert.equal(String(file.contents), 'Hello world!');
    });
    stream.on('end', function() {
      assert.equal(a, 1);
      cb();
    });
  });
});
