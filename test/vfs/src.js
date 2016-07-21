'use strict';

var vfs = require('vinyl-fs');

var path = require('path');
var fs = require('graceful-fs');

var bufEqual = require('buffer-equal');
var through = require('through2');
var File = require('vinyl');

var should = require('should');
require('mocha');

var dataWrap = function(fn) {
  return function(data, enc, cb) {
    fn(data);
    cb();
  };
};

describe('source stream', function() {

  it('should explode on invalid glob (empty)', function(done) {
    var stream;
    try {
      stream = vfs.src();
    } catch (err) {
      should.exist(err);
      should.not.exist(stream);
      done();
    }
  });

  it('should explode on invalid glob (empty string)', function(done) {
    var stream;
    try {
      stream = vfs.src('');
    } catch (err) {
      should.exist(err);
      should.not.exist(stream);
      done();
    }
  });

  it('should explode on invalid glob (number)', function(done) {
    var stream;
    try {
      stream = vfs.src(123);
    } catch (err) {
      should.exist(err);
      should.not.exist(stream);
      done();
    }
  });

  it('should explode on invalid glob (nested array)', function(done) {
    var stream;
    try {
      stream = vfs.src([['./fixtures/*.coffee']]);
    } catch (err) {
      should.exist(err);
      should.not.exist(stream);
      err.message.should.containEql('Invalid glob argument');
      done();
    }
  });

  it('should explode on invalid glob (empty string in array)', function(done) {
    var stream;
    try {
      stream = vfs.src(['']);
    } catch (err) {
      should.exist(err);
      should.not.exist(stream);
      done();
    }
  });

  it('should explode on invalid glob (empty array)', function(done) {
    var stream;
    try {
      stream = vfs.src([]);
    } catch (err) {
      should.exist(err);
      should.not.exist(stream);
      done();
    }
  });

  it('should error on file not existing', function(done) {
    var stream = vfs.src('./fixtures/noexist.coffee');
    stream.on('error', function(err) {
      should.exist(err);
      done();
    });
  });

  it('should pass through writes', function(done) {
    var expectedPath = path.join(__dirname, './fixtures/test.coffee');
    var expectedContent = fs.readFileSync(expectedPath);
    var files = [];
    var expectedFile = new File({
      base: __dirname,
      cwd: __dirname,
      path: expectedPath,
      contents: expectedContent,
      stat: fs.lstatSync(expectedPath),
    });

    var stream = vfs.src(expectedPath, { cwd: __dirname, base: __dirname });
    stream.on('data', function(file) {
      files.push(file);
    });
    stream.once('end', function() {
      files.length.should.equal(2);
      files[0].should.eql(expectedFile);
      bufEqual(files[0].contents, expectedContent).should.equal(true);
      files[1].should.eql(expectedFile);
      bufEqual(files[1].contents, expectedContent).should.equal(true);
      done();
    });
    stream.write(expectedFile);
  });

  it('should strip BOM from UTF-8-encoded files by default', function(done) {
    var expectedPath = path.join(__dirname, './fixtures/bom-utf8.txt');
    var expectedContent = fs.readFileSync(expectedPath)
      // U+FEFF takes up 3 bytes in UTF-8: http://mothereff.in/utf-8#%EF%BB%BF
      .slice(3);

    var buffered = [];

    var onEnd = function() {
      buffered.length.should.equal(1);
      should.exist(buffered[0].stat);
      buffered[0].path.should.equal(expectedPath);
      buffered[0].isBuffer().should.equal(true);
      bufEqual(buffered[0].contents, expectedContent).should.equal(true);
      done();
    };

    var stream = vfs.src('./fixtures/bom-utf8.txt', { cwd: __dirname });

    var bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
    stream.pipe(bufferStream);
  });

  it('should not strip BOM from UTF-8-encoded files if option is false', function(done) {
    var expectedPath = path.join(__dirname, './fixtures/bom-utf8.txt');
    var expectedContent = fs.readFileSync(expectedPath);

    var buffered = [];

    var onEnd = function() {
      buffered.length.should.equal(1);
      should.exist(buffered[0].stat);
      buffered[0].path.should.equal(expectedPath);
      buffered[0].isBuffer().should.equal(true);
      bufEqual(buffered[0].contents, expectedContent).should.equal(true);
      done();
    };

    var stream = vfs.src('./fixtures/bom-utf8.txt', { cwd: __dirname, stripBOM: false });

    var bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
    stream.pipe(bufferStream);
  });

  it('should not strip anything that looks like a UTF-8-encoded BOM from UTF-16-BE-encoded files', function(done) {
    // Note: this goes for any non-UTF-8 encoding, but testing for UTF-16-BE
    // and UTF-16-LE is enough to demonstrate this is done properly.
    var expectedPath = path.join(__dirname, './fixtures/bom-utf16be.txt');
    var expectedContent = fs.readFileSync(expectedPath);

    var buffered = [];

    var onEnd = function() {
      buffered.length.should.equal(1);
      should.exist(buffered[0].stat);
      buffered[0].path.should.equal(expectedPath);
      buffered[0].isBuffer().should.equal(true);
      bufEqual(buffered[0].contents, expectedContent).should.equal(true);
      done();
    };

    var stream = vfs.src('./fixtures/bom-utf16be.txt', { cwd: __dirname });

    var bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
    stream.pipe(bufferStream);
  });

  it('should not strip anything that looks like a UTF-8-encoded BOM from UTF-16-LE-encoded files', function(done) {
    // Note: this goes for any non-UTF-8 encoding, but testing for UTF-16-BE
    // and UTF-16-LE is enough to demonstrate this is done properly.
    var expectedPath = path.join(__dirname, './fixtures/bom-utf16le.txt');
    var expectedContent = fs.readFileSync(expectedPath);

    var buffered = [];

    var onEnd = function() {
      buffered.length.should.equal(1);
      should.exist(buffered[0].stat);
      buffered[0].path.should.equal(expectedPath);
      buffered[0].isBuffer().should.equal(true);
      bufEqual(buffered[0].contents, expectedContent).should.equal(true);
      done();
    };

    var stream = vfs.src('./fixtures/bom-utf16le.txt', { cwd: __dirname });

    var bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
    stream.pipe(bufferStream);
  });

  it('should glob a file with default settings', function(done) {
    var expectedPath = path.join(__dirname, './fixtures/test.coffee');
    var expectedContent = fs.readFileSync(expectedPath);

    var buffered = [];

    var onEnd = function() {
      buffered.length.should.equal(1);
      should.exist(buffered[0].stat);
      buffered[0].path.should.equal(expectedPath);
      buffered[0].isBuffer().should.equal(true);
      bufEqual(buffered[0].contents, expectedContent).should.equal(true);
      done();
    };

    var stream = vfs.src('./fixtures/*.coffee', { cwd: __dirname });

    var bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
    stream.pipe(bufferStream);
  });

  it('should glob a file with default settings and relative cwd', function(done) {
    var expectedPath = path.join(__dirname, './fixtures/test.coffee');
    var expectedContent = fs.readFileSync(expectedPath);

    var buffered = [];

    var onEnd = function() {
      buffered.length.should.equal(1);
      should.exist(buffered[0].stat);
      buffered[0].path.should.equal(expectedPath);
      buffered[0].isBuffer().should.equal(true);
      bufEqual(buffered[0].contents, expectedContent).should.equal(true);
      done();
    };

    var stream = vfs.src('./fixtures/*.coffee', { cwd: path.relative(process.cwd(), __dirname) });

    var bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
    stream.pipe(bufferStream);
  });

  it('should glob a directory with default settings', function(done) {
    var expectedPath = path.join(__dirname, './fixtures/wow/');

    var buffered = [];

    var onEnd = function() {
      buffered.length.should.equal(1);
      buffered[0].path.should.equal(expectedPath);
      buffered[0].isNull().should.equal(true);
      buffered[0].isDirectory().should.equal(true);
      done();
    };

    var stream = vfs.src('./fixtures/wow/', { cwd: __dirname });

    var bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
    stream.pipe(bufferStream);
  });

  it('should glob a file with with no contents', function(done) {
    var expectedPath = path.join(__dirname, './fixtures/test.coffee');

    var buffered = [];

    var onEnd = function() {
      buffered.length.should.equal(1);
      buffered[0].path.should.equal(expectedPath);
      buffered[0].isNull().should.equal(true);
      should.not.exist(buffered[0].contents);
      done();
    };

    var stream = vfs.src('./fixtures/*.coffee', { cwd: __dirname, read: false });

    var bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
    stream.pipe(bufferStream);
  });

  it('should glob a file changed after since', function(done) {
    var expectedPath = path.join(__dirname, './fixtures/test.coffee');
    var expectedContent = fs.readFileSync(expectedPath);
    var lastUpdateDate = new Date(+fs.statSync(expectedPath).mtime - 1000);

    var buffered = [];

    var onEnd = function() {
      buffered.length.should.equal(1);
      should.exist(buffered[0].stat);
      buffered[0].path.should.equal(expectedPath);
      buffered[0].isBuffer().should.equal(true);
      bufEqual(buffered[0].contents, expectedContent).should.equal(true);
      done();
    };

    var stream = vfs.src('./fixtures/*.coffee', { cwd: __dirname, since: lastUpdateDate });

    var bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
    stream.pipe(bufferStream);
  });

  it('should not glob a file changed before since', function(done) {
    var expectedPath = path.join(__dirname, './fixtures/test.coffee');
    var lastUpdateDate = new Date(+fs.statSync(expectedPath).mtime + 1000);

    var buffered = [];

    var onEnd = function() {
      buffered.length.should.equal(0);
      done();
    };

    var stream = vfs.src('./fixtures/*.coffee', { cwd: __dirname, since: lastUpdateDate });

    var bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
    stream.pipe(bufferStream);
  });

  it('should glob a file with streaming contents', function(done) {
    var expectedPath = path.join(__dirname, './fixtures/test.coffee');
    var expectedContent = fs.readFileSync(expectedPath);

    var buffered = [];

    var onEnd = function() {
      buffered.length.should.equal(1);
      should.exist(buffered[0].stat);
      buffered[0].path.should.equal(expectedPath);
      buffered[0].isStream().should.equal(true);

      var contentBuffer = new Buffer([]);
      var contentBufferStream = through(dataWrap(function(data) {
        contentBuffer = Buffer.concat([contentBuffer, data]);
      }));
      buffered[0].contents.pipe(contentBufferStream);
      buffered[0].contents.once('end', function() {
        bufEqual(contentBuffer, expectedContent);
        done();
      });
    };

    var stream = vfs.src('./fixtures/*.coffee', { cwd: __dirname, buffer: false });

    var bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
    stream.pipe(bufferStream);
  });

  it('should pass files through', function(done) {
    var expectedPaths = [
      path.join(__dirname, './fixtures/test.coffee'),
      path.join(__dirname, './fixtures/wow/suchempty'),
    ];
    var expectedContents = expectedPaths.map(function(path/* More args here so can't pass function directly */) {
      return fs.readFileSync(path);
    });

    var buffered = [];

    var onEnd = function() {
      buffered.length.should.equal(2);
      buffered.forEach(function(file) {
        should.exist(file.stat);
        file.isBuffer().should.equal(true);

        expectedPaths.some(function(expectedPath) {
          return file.path === expectedPath;
        }).should.equal(true);

        expectedContents.some(function(expectedContent) {
          return bufEqual(file.contents, expectedContent);
        }).should.equal(true);
      });
      done();
    };

    var stream1 = vfs.src('./fixtures/*.coffee', { cwd: __dirname });
    var stream2 = vfs.src('./fixtures/wow/*', { cwd: __dirname, passthrough: true });

    var bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
    stream1.pipe(stream2).pipe(bufferStream);
  });

  it('should not pass options.read on to through2', function(done) {
    // Note: https://github.com/gulpjs/vinyl-fs/issues/153
    var canary = 0;
    var expected = 1;
    var read = function() {
      canary++;
      return 0;
    };

    var onEnd = function() {
      canary.should.equal(expected);
      done();
    };

    var buffered = [];
    var stream = vfs.src('./fixtures/test.coffee', { cwd: __dirname, read: read });
    var bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
    stream.pipe(bufferStream);
  });
});

describe('.src() symlinks', function() {


  var dirPath = path.join(__dirname, './fixtures/wow');
  var dirSymlinkPath = path.join(__dirname, './fixtures/test-symlink-dir');

  var filePath = path.join(__dirname, './fixtures/test.coffee');
  var fileSymlinkPath = path.join(__dirname, './fixtures/test-symlink');

  var symlinkFirstLayer = path.join(__dirname, './fixtures/test-multi-layer-symlink');
  var symlinkSecondLayer = path.join(__dirname, './fixtures/foo/baz-link.txt');
  var symlinkSecondLayerTarget = path.join(__dirname, './fixtures/foo/bar/baz.txt');

  beforeEach(function(done) {
    fs.symlinkSync(dirPath, dirSymlinkPath);
    fs.symlinkSync(filePath, fileSymlinkPath);
    fs.symlinkSync(symlinkSecondLayerTarget, symlinkSecondLayer);
    fs.symlinkSync(symlinkSecondLayer, symlinkFirstLayer);
    done();
  });

  afterEach(function(done) {
    fs.unlinkSync(dirSymlinkPath);
    fs.unlinkSync(fileSymlinkPath);
    fs.unlinkSync(symlinkSecondLayer);
    fs.unlinkSync(symlinkFirstLayer);
    done();
  });

  it('should follow symlinks correctly', function(done) {
    var linkTarget = './fixtures/test-multi-layer-symlink';
    var expectedPath = path.join(__dirname, linkTarget);

    var stream = vfs.src(linkTarget, { cwd: __dirname, base: __dirname });
    stream.on('data', function(file) {
      file.base.should.equal(__dirname);
      // The path should be the symlink itself
      file.path.should.equal(expectedPath);
      // But the content should be what's in the actual file
      file.contents.toString().should.equal('symlink works\n');
      file.stat.isSymbolicLink().should.equal(false);
      file.stat.isFile().should.equal(true);
      done();
    });
  });

  it('should follow dir symlinks correctly', function(done) {
    var linkTarget = './fixtures/test-symlink-dir';
    var expectedPath = path.join(__dirname, linkTarget);

    var stream = vfs.src(linkTarget, { cwd: __dirname, base: __dirname });
    stream.on('data', function(file) {
      file.base.should.equal(__dirname);
      // The path should be the symlink itself
      file.path.should.equal(expectedPath);
      // But the stats should have been updated
      file.stat.isSymbolicLink().should.equal(false);
      file.stat.isDirectory().should.equal(true);
      done();
    });
  });


  it('should preserve file symlinks with followSymlinks option set to false', function(done) {
    fs.readlink(fileSymlinkPath, function(err, expectedRelativeSymlinkPath) {
      if (err) {
        throw err;
      }

      var stream = vfs.src(fileSymlinkPath, { cwd: __dirname, followSymlinks: false });
      stream.on('data', function(file) {
        file.path.should.equal(fileSymlinkPath);
        file.symlink.should.equal(expectedRelativeSymlinkPath);
        done();
      });
    });
  });

  it('should preserve dir symlinks with followSymlinks option set to false', function(done) {
    fs.readlink(dirSymlinkPath, function(err, expectedRelativeSymlinkPath) {
      if (err) {
        throw err;
      }

      var stream = vfs.src(dirSymlinkPath, { cwd: __dirname, followSymlinks: false });
      stream.on('data', function(file) {
        file.path.should.equal(dirSymlinkPath);
        file.symlink.should.equal(expectedRelativeSymlinkPath);
        done();
      });
    });
  });
});
