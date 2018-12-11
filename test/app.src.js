'use strict';

const path = require('path');
const assert = require('assert');
const App = require('templates');
const vfs = require('..');
let app;

describe('src()', () => {
  beforeEach(() => {
    app = new App();
    app.create('pages');
    app.use(vfs());
  });

  it('should return a stream', cb => {
    const stream = app.src(path.join(__dirname, 'fixtures/*.coffee'));
    assert(stream);
    assert.equal(typeof stream.on, 'function');
    assert.equal(typeof stream.pipe, 'function');
    cb();
  });

  it('should return an input stream from a flat glob', cb => {
    const stream = app.src(path.join(__dirname, 'fixtures/*.coffee'));
    stream.on('error', cb);
    stream.on('data', file => {
      assert(file);
      assert(file.path);
      assert(file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
      assert.equal(String(file.contents), 'Hello world!');
    });
    stream.on('end', cb);
  });

  it('should return an input stream for multiple globs', cb => {
    const globs = [
      path.join(__dirname, 'fixtures/generic/run.dmc'),
      path.join(__dirname, 'fixtures/generic/test.dmc')
    ];

    const stream = app.src(globs);
    const files = [];

    stream.on('error', cb);
    stream.on('data', file => {
      assert(file);
      assert(file.path);
      files.push(file);
    });

    stream.on('end', () => {
      assert.equal(files.length, 2);
      assert.equal(files[0].path, globs[0]);
      assert.equal(files[1].path, globs[1]);
      cb();
    });
  });

  it('should return an input stream for multiple globs with negation', cb => {
    let expectedPath = path.join(__dirname, 'fixtures/generic/run.dmc');
    let globArray = [
      path.join(__dirname, 'fixtures/generic/*.dmc'),
      '!' + path.join(__dirname, 'fixtures/generic/test.dmc')
    ];
    let stream = app.src(globArray);

    let files = [];
    stream.on('error', cb);
    stream.on('data', file => {
      assert(file);
      assert(file.path);
      files.push(file);
    });
    stream.on('end', () => {
      assert.equal(files.length, 1);
      assert.equal(files[0].path, expectedPath);
      cb();
    });
  });

  it('should return an input stream with no contents when read is false', cb => {
    app.src(path.join(__dirname, 'fixtures/*.coffee'), { read: false })
      .on('error', cb)
      .on('data', file => {
        assert(file);
        assert(file.path);
        assert(!file.contents);
        assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
      })
      .on('end', cb);
  });

  it('should not blow up when no files are matched', cb => {
    app
      .src(['test.js', 'foo/*.js'])
      .on('error', cb)
      .on('data', () => {})
      .on('end', cb);
  });

  it('should return an input stream with contents as stream when buffer is false', cb => {
    let stream = app.src(path.join(__dirname, 'fixtures/*.coffee'), { buffer: false });
    stream.on('error', cb);
    stream.on('data', file => {
      assert(file);
      assert(file.path);
      assert(file.contents);
      let buf = '';
      file.contents.on('data', function(d) {
        buf += d;
      });
      file.contents.on('end', () => {
        assert.equal(buf, 'Hello world!');
        cb();
      });
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
    });
  });

  it('should return an input stream from a deep glob', cb => {
    let stream = app.src(path.join(__dirname, 'fixtures/**/*.jade'));
    stream.on('error', cb);
    stream.on('data', file => {
      assert(file);
      assert(file.path);
      assert(file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test/run.jade'));
      assert.equal(String(file.contents), 'test template');
    });
    stream.on('end', cb);
  });

  it('should return an input stream from a deeper glob', cb => {
    let stream = app.src(path.join(__dirname, 'fixtures/**/*.dmc'));
    let a = 0;
    stream.on('error', cb);
    stream.on('data', () => {
      ++a;
    });
    stream.on('end', () => {
      assert.equal(a, 2);
      cb();
    });
  });

  it('should return a file stream from a flat path', cb => {
    let a = 0;
    let stream = app.src(path.join(__dirname, 'fixtures/test.coffee'));
    stream.on('error', cb);
    stream.on('data', file => {
      ++a;
      assert(file);
      assert(file.path);
      assert(file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
      assert.equal(String(file.contents), 'Hello world!');
    });
    stream.on('end', () => {
      assert.equal(a, 1);
      cb();
    });
  });

  it('should return a stream', cb => {
    let stream = app.src(path.join(__dirname, 'fixtures/*.coffee'));
    assert(stream);
    assert(stream.on);
    cb();
  });

  it('should return an input stream from a flat glob', cb => {
    let stream = app.src(path.join(__dirname, 'fixtures/*.coffee'));
    stream.on('error', cb);
    stream.on('data', file => {
      assert(file);
      assert(file.path);
      assert(file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
      assert.equal(String(file.contents), 'Hello world!');
    });
    stream.on('end', cb);
  });

  it('should return an input stream for multiple globs, with negation', cb => {
    let expectedPath = path.join(__dirname, 'fixtures/generic/run.dmc');
    let globArray = [
      path.join(__dirname, 'fixtures/generic/*.dmc'),
      '!' + path.join(__dirname, 'fixtures/generic/test.dmc')
    ];
    let stream = app.src(globArray);

    let files = [];
    stream.on('error', cb);
    stream.on('data', file => {
      assert(file);
      assert(file.path);
      files.push(file);
    });
    stream.on('end', () => {
      assert.equal(files.length, 1);
      assert.equal(files[0].path, expectedPath);
      cb();
    });
  });

  it('should return an input stream with no contents when read is false', cb => {
    let stream = app.src(path.join(__dirname, 'fixtures/*.coffee'), { read: false });
    stream.on('error', cb);
    stream.on('data', file => {
      assert(file);
      assert(file.path);
      assert(!file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
    });
    stream.on('end', cb);
  });

  it('should return an input stream from a deep glob', cb => {
    app
      .src(path.join(__dirname, 'fixtures/**/*.jade'))
      .on('error', cb)
      .on('data', file => {
        assert(file);
        assert(file.path);
        assert(file.contents);
        assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test/run.jade'));
        assert.equal(String(file.contents), 'test template');
      })
      .on('end', () => {
        cb();
      });
  });

  it('should return an input stream from a deeper glob', cb => {
    let stream = app.src(path.join(__dirname, 'fixtures/**/*.dmc'));
    let a = 0;
    stream.on('error', cb);
    stream.on('data', () => {
      ++a;
    });
    stream.on('end', () => {
      assert.equal(a, 2);
      cb();
    });
  });

  it('should return a file stream from a flat path', cb => {
    let a = 0;
    let stream = app.src(path.join(__dirname, 'fixtures/test.coffee'));
    stream.on('error', cb);
    stream.on('data', file => {
      ++a;
      assert(file);
      assert(file.path);
      assert(file.contents);
      assert.equal(path.join(file.path, ''), path.join(__dirname, 'fixtures/test.coffee'));
      assert.equal(String(file.contents), 'Hello world!');
    });
    stream.on('end', () => {
      assert.equal(a, 1);
      cb();
    });
  });
});
