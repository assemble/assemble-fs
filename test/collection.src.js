'use strict';

var path = require('path');
var assert = require('assert');
var should = require('should');
var App = require('templates');
var afs = require('..');
var app, pages, posts;

describe('collection.src()', function() {
  beforeEach(function () {
    app = new App();
    app.use(afs());

    pages = app.create('pages');
    posts = app.create('posts');
  });

  it('should return a stream', function (done) {
    var stream = pages.src(path.join(__dirname, 'fixtures/*.coffee'));
    assert(stream);
    assert.equal(typeof stream.on, 'function');
    assert.equal(typeof stream.pipe, 'function');
    done();
  });

  it('should convert vinyl files to views', function (done) {
    var patterns = path.join(__dirname, 'fixtures/*.coffee');
    var stream = pages.src(patterns);
    stream.on('error', done);
    stream.on('data', function (file) {
      assert(file.isView);
    });
    stream.on('end', function () {
      done();
    });
  });

  it('should add src files to a `files` array', function (done) {
    var patterns = path.join(__dirname, 'fixtures/*.coffee');
    var stream = pages.src(patterns);
    stream.on('error', done);
    stream.on('data', function (file) {
      assert(pages.files);
      assert(pages.files.length === 1);
    });
    stream.on('end', function () {
      done();
    });
  });

  it('should add src files to the collection', function (done) {
    var patterns = path.join(__dirname, 'fixtures/*.coffee');
    pages.src(patterns)
      .on('error', done)
      .on('data', function (file) {
        assert(pages.views);
        assert(Object.keys(pages.views).length === 1);
      })
      .on('end', function () {
        done();
      });
  });

  it('should work with views added with other methods', function (done) {
    pages.addView('a', {content: '...'});
    pages.addView('b', {content: '...'});
    pages.addView('c', {content: '...'});

    var patterns = path.join(__dirname, 'fixtures/*.coffee');
    var stream = pages.src(patterns);
    stream.on('error', done);
    stream.on('data', function (file) {
      assert(pages.views);
      assert(Object.keys(pages.views).length === 4);
    });
    stream.on('end', function () {
      done();
    });
  });

  it('should return an input stream from a flat glob', function (done) {
    var stream = pages.src(path.join(__dirname, 'fixtures/*.coffee'));
    stream.on('error', done);
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.contents);
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test.coffee'));
      String(file.contents).should.equal('Hello world!');
    });
    stream.on('end', function () {
      done();
    });
  });

  it('should return an input stream for multiple globs', function (done) {
    var globArray = [
      path.join(__dirname, 'fixtures/generic/run.dmc'),
      path.join(__dirname, 'fixtures/generic/test.dmc')
    ];
    var stream = pages.src(globArray);

    var files = [];
    stream.on('error', done);
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      files.push(file);
    });
    stream.on('end', function () {
      files.length.should.equal(2);
      files[0].path.should.equal(globArray[0]);
      files[1].path.should.equal(globArray[1]);
      done();
    });
  });

  it('should return an input stream for multiple globs with negation', function (done) {
    var expectedPath = path.join(__dirname, 'fixtures/generic/run.dmc');
    var globArray = [
      path.join(__dirname, 'fixtures/generic/*.dmc'),
      '!' + path.join(__dirname, 'fixtures/generic/test.dmc'),
    ];
    var stream = pages.src(globArray);

    var files = [];
    stream.on('error', done);
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      files.push(file);
    });
    stream.on('end', function () {
      files.length.should.equal(1);
      files[0].path.should.equal(expectedPath);
      done();
    });
  });

  it('should return an input stream with no contents when read is false', function (done) {
    var stream = pages.src(path.join(__dirname, 'fixtures/*.coffee'), {read: false});
    stream.on('error', done);
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.not.exist(file.contents);
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test.coffee'));
    });
    stream.on('end', function () {
      done();
    });
  });

  it('should return an input stream with contents as stream when buffer is false', function (done) {
    var stream = pages.src(path.join(__dirname, 'fixtures/*.coffee'), {buffer: false});
    stream.on('error', done);
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.contents);
      var buf = '';
      file.contents.on('data', function (d) {
        buf += d;
      });
      file.contents.on('end', function () {
        buf.should.equal('Hello world!');
        done();
      });
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test.coffee'));
    });
  });

  it('should return an input stream from a deep glob', function (done) {
    var stream = pages.src(path.join(__dirname, 'fixtures/**/*.jade'));
    stream.on('error', done);
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.contents);
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test/run.jade'));
      String(file.contents).should.equal('test template');
    });
    stream.on('end', function () {
      done();
    });
  });

  it('should return an input stream from a deeper glob', function (done) {
    var stream = pages.src(path.join(__dirname, 'fixtures/**/*.dmc'));
    var a = 0;
    stream.on('error', done);
    stream.on('data', function () {
      ++a;
    });
    stream.on('end', function () {
      a.should.equal(2);
      done();
    });
  });

  it('should return a file stream from a flat path', function (done) {
    var a = 0;
    var stream = pages.src(path.join(__dirname, 'fixtures/test.coffee'));
    stream.on('error', done);
    stream.on('data', function (file) {
      ++a;
      should.exist(file);
      should.exist(file.path);
      should.exist(file.contents);
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test.coffee'));
      String(file.contents).should.equal('Hello world!');
    });
    stream.on('end', function () {
      a.should.equal(1);
      done();
    });
  });

  it('should return a stream', function (done) {
    var stream = pages.src(path.join(__dirname, 'fixtures/*.coffee'));
    should.exist(stream);
    should.exist(stream.on);
    done();
  });

  it('should return an input stream from a flat glob', function (done) {
    var stream = pages.src(path.join(__dirname, 'fixtures/*.coffee'));
    stream.on('error', done);
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.contents);
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test.coffee'));
      String(file.contents).should.equal('Hello world!');
    });
    stream.on('end', function () {
      done();
    });
  });

  it('should return an input stream for multiple globs', function (done) {
    var globArray = [
      path.join(__dirname, 'fixtures/generic/run.dmc'),
      path.join(__dirname, 'fixtures/generic/test.dmc')
    ];
    var stream = pages.src(globArray);

    var files = [];
    stream.on('error', done);
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      files.push(file);
    });
    stream.on('end', function () {
      files.length.should.equal(2);
      files[0].path.should.equal(globArray[0]);
      files[1].path.should.equal(globArray[1]);
      done();
    });
  });

  it('should return an input stream for multiple globs, with negation', function (done) {
    var expectedPath = path.join(__dirname, 'fixtures/generic/run.dmc');
    var globArray = [
      path.join(__dirname, 'fixtures/generic/*.dmc'),
      '!' + path.join(__dirname, 'fixtures/generic/test.dmc'),
    ];
    var stream = pages.src(globArray);

    var files = [];
    stream.on('error', done);
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      files.push(file);
    });
    stream.on('end', function () {
      files.length.should.equal(1);
      files[0].path.should.equal(expectedPath);
      done();
    });
  });

  it('should return an input stream with no contents when read is false', function (done) {
    var stream = pages.src(path.join(__dirname, 'fixtures/*.coffee'), {read: false});
    stream.on('error', done);
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.not.exist(file.contents);
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test.coffee'));
    });
    stream.on('end', function () {
      done();
    });
  });

  it.skip('should throw an error when buffer is false', function (done) {
    pages.src(path.join(__dirname, 'fixtures/*.coffee'), {buffer: false})
      .on('error', function () {
        done();
      })
      .on('data', function () {
        done(new Error('should have thrown an error'));
      });
  });

  it('should return an input stream from a deep glob', function (done) {
    pages.src(path.join(__dirname, 'fixtures/**/*.jade'))
      .on('error', done)
      .on('data', function (file) {
        should.exist(file);
        should.exist(file.path);
        should.exist(file.contents);
        path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test/run.jade'));
        String(file.contents).should.equal('test template');
      })
      .on('end', function () {
        done();
      });
  });

  it('should return an input stream from a deeper glob', function (done) {
    var stream = pages.src(path.join(__dirname, 'fixtures/**/*.dmc'));
    var a = 0;
    stream.on('error', done);
    stream.on('data', function () {
      ++a;
    });
    stream.on('end', function () {
      a.should.equal(2);
      done();
    });
  });

  it('should return a file stream from a flat path', function (done) {
    var a = 0;
    var stream = pages.src(path.join(__dirname, 'fixtures/test.coffee'));
    stream.on('error', done);
    stream.on('data', function (file) {
      ++a;
      should.exist(file);
      should.exist(file.path);
      should.exist(file.contents);
      path.join(file.path, '').should.equal(path.join(__dirname, 'fixtures/test.coffee'));
      String(file.contents).should.equal('Hello world!');
    });
    stream.on('end', function () {
      a.should.equal(1);
      done();
    });
  });
});
