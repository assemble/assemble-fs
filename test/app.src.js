'use strict';

var path = require('path');
var assert = require('assert');
var should = require('should');
var App = require('templates');
var afs = require('..');
var app;

describe('src()', function() {
  beforeEach(function() {
    app = new App();
    app.use(afs());
  });

  it('should return a stream', function(cb) {
    var stream = app.src(path.join(__dirname, 'fixtures/*.coffee'));
    assert(stream);
    assert.equal(typeof stream.on, 'function');
    assert.equal(typeof stream.pipe, 'function');
    cb();
  });

  it('should return an input stream from a flat glob', function(cb) {
    var stream = app.src(path.join(__dirname, 'fixtures/*.coffee'));
    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      assert(file.contents);
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test.coffee'));
      String(file.contents).should.equal('Hello world!');
    });
    stream.on('end', cb);
  });

  it('should add files to an existing collection', function(cb) {
    app.create('files');
    app.files('foo', {content: 'this is content'});
    var stream = app.src(path.join(__dirname, 'fixtures/test.coffee'), {collection: 'files'});
    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      assert(file.contents);
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test.coffee'));
      String(file.contents).should.equal('Hello world!');
    });
    stream.on('end', function() {
      assert.equal(Object.keys(app.views.files).length, 2);
      cb();
    });
  });

  it('should add files to a new specified collection', function(cb) {
    var stream = app.src(path.join(__dirname, 'fixtures/test.coffee'), {collection: 'docs'});
    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      assert(file.contents);
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test.coffee'));
      String(file.contents).should.equal('Hello world!');
    });
    stream.on('end', function() {
      assert.equal(Object.keys(app.views.docs).length, 1);
      cb();
    });
  });

  it('should return an input stream for multiple globs', function(cb) {
    var globArray = [
      path.join(__dirname, 'fixtures/generic/run.dmc'),
      path.join(__dirname, 'fixtures/generic/test.dmc')
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
      files.length.should.equal(2);
      files[0].path.should.equal(globArray[0]);
      files[1].path.should.equal(globArray[1]);
      cb();
    });
  });

  it('should return an input stream for multiple globs with negation', function(cb) {
    var expectedPath = path.join(__dirname, 'fixtures/generic/run.dmc');
    var globArray = [
      path.join(__dirname, 'fixtures/generic/*.dmc'),
      '!' + path.join(__dirname, 'fixtures/generic/test.dmc'),
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
      files.length.should.equal(1);
      files[0].path.should.equal(expectedPath);
      cb();
    });
  });

  it('should return an input stream with no contents when read is false', function(cb) {
    app.src(path.join(__dirname, 'fixtures/*.coffee'), {read: false})
      .on('error', cb)
      .on('data', function(file) {
        assert(file);
        assert(file.path);
        assert(!file.contents);
        path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test.coffee'));
      })
      .on('end', cb)
  });

  it('should not blow up when no files are matched', function(cb) {
    app.src(['test.js', 'foo/*.js'])
      .on('error', cb)
      .on('data', function() {})
      .on('end', cb)
  });

  it('should return an input stream with contents as stream when buffer is false', function(cb) {
    var stream = app.src(path.join(__dirname, 'fixtures/*.coffee'), {buffer: false});
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
        buf.should.equal('Hello world!');
        cb();
      });
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test.coffee'));
    });
  });

  it('should return an input stream from a deep glob', function(cb) {
    var stream = app.src(path.join(__dirname, 'fixtures/**/*.jade'));
    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      assert(file.contents);
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test/run.jade'));
      String(file.contents).should.equal('test template');
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
      a.should.equal(2);
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
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test.coffee'));
      String(file.contents).should.equal('Hello world!');
    });
    stream.on('end', function() {
      a.should.equal(1);
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
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test.coffee'));
      String(file.contents).should.equal('Hello world!');
    });
    stream.on('end', cb);
  });

  it('should return an input stream for multiple globs', function(cb) {
    var globArray = [
      path.join(__dirname, 'fixtures/generic/run.dmc'),
      path.join(__dirname, 'fixtures/generic/test.dmc')
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
      files.length.should.equal(2);
      files[0].path.should.equal(globArray[0]);
      files[1].path.should.equal(globArray[1]);
      cb();
    });
  });

  it('should return an input stream for multiple globs, with negation', function(cb) {
    var expectedPath = path.join(__dirname, 'fixtures/generic/run.dmc');
    var globArray = [
      path.join(__dirname, 'fixtures/generic/*.dmc'),
      '!' + path.join(__dirname, 'fixtures/generic/test.dmc'),
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
      files.length.should.equal(1);
      files[0].path.should.equal(expectedPath);
      cb();
    });
  });

  it('should return an input stream with no contents when read is false', function(cb) {
    var stream = app.src(path.join(__dirname, 'fixtures/*.coffee'), {read: false});
    stream.on('error', cb);
    stream.on('data', function(file) {
      assert(file);
      assert(file.path);
      assert(!file.contents);
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test.coffee'));
    });
    stream.on('end', cb);
  });

  it('should return an input stream from a deep glob', function(cb) {
    app.src(path.join(__dirname, 'fixtures/**/*.jade'))
      .on('error', cb)
      .on('data', function(file) {
        assert(file);
        assert(file.path);
        assert(file.contents);
        path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test/run.jade'));
        String(file.contents).should.equal('test template');
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
      a.should.equal(2);
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
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test.coffee'));
      String(file.contents).should.equal('Hello world!');
    });
    stream.on('end', function() {
      a.should.equal(1);
      cb();
    });
  });
});
