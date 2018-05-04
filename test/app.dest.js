// 'use strict';

// require('mocha');
// const os = require('os');
// const fs = require('graceful-fs');
// const path = require('path');
// const assert = require('assert');
// const rimraf = require('rimraf');
// const expect = require('expect');
// const bufEqual = require('buffer-equal');
// const through = require('through2');
// const File = require('vinyl');
// const App = require('templates');
// const isWindows = (os.platform() === 'win32');
// const actual = path.join(__dirname, 'actual');
// const MASK_MODE = parseInt('777', 8);
// const spies = require('./support/spy');
// const chmodSpy = spies.chmodSpy;
// const statSpy = spies.statSpy;
// let bufferStream;
// let app;

// const masked = mode => mode & MASK_MODE;
// const wipeOut = function(cb) {
//   app = new App();
//   app.use(require('..')());
//   spies.setError('false');
//   statSpy.reset();
//   chmodSpy.reset();
//   expect.restoreSpies();
//   rimraf(path.join(__dirname, 'actual/'), cb);
// };

// const dataWrap = function(fn) {
//   return function(data, enc, cb) {
//     fn(data);
//     cb();
//   };
// };

// describe('dest stream', function() {
//   beforeEach(wipeOut);
//   afterEach(wipeOut);

//   it('should explode on invalid folder (empty)', function(cb) {
//     let stream;
//     try {
//       stream = app.dest();
//     } catch (err) {
//       assert(err && typeof err === 'object');
//       assert(!stream);
//       cb();
//     }
//   });

//   it('should explode on invalid folder (empty string)', function(cb) {
//     let stream;
//     try {
//       stream = app.dest('');
//     } catch (err) {
//       assert(err && typeof err === 'object');
//       assert(!stream);
//       cb();
//     }
//   });

//   it('should pass through writes with cwd', function(cb) {
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const expectedFile = new File({
//       base: __dirname,
//       cwd: __dirname,
//       path: inputPath,
//       contents: null
//     });

//     const onEnd = function() {
//       assert.equal(buffered.length, 1);
//       assert.equal(buffered[0], expectedFile);
//       cb();
//     };

//     const stream = app.dest('actual/', {cwd: __dirname});
//     const buffered = [];

//     bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
//     stream.pipe(bufferStream);
//     stream.write(expectedFile);
//     stream.end();
//   });

//   it('should pass through writes with default cwd', function(cb) {
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const expectedFile = new File({
//       base: __dirname,
//       cwd: __dirname,
//       path: inputPath,
//       contents: null
//     });

//     const onEnd = function() {
//       assert.equal(buffered.length, 1);
//       assert.equal(buffered[0], expectedFile);
//       cb();
//     };

//     const stream = app.dest(path.join(__dirname, 'actual/'));
//     const buffered = [];

//     bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
//     stream.pipe(bufferStream);
//     stream.write(expectedFile);
//     stream.end();
//   });

//   it('should not write null files', function(cb) {
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const expectedPath = path.join(__dirname, 'actual/test.coffee');
//     const expectedBase = path.join(__dirname, 'actual');
//     const expectedCwd = __dirname;

//     const expectedFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: null
//     });

//     const onEnd = function() {
//       assert.equal(buffered.length, 1);
//       assert.equal(buffered[0], expectedFile);
//       assert.equal(buffered[0].cwd, expectedCwd, 'cwd should have changed');
//       assert.equal(buffered[0].base, expectedBase, 'base should have changed');
//       assert.equal(buffered[0].path, expectedPath, 'path should have changed');
//       assert.equal(fs.existsSync(expectedPath), false);
//       cb();
//     };

//     const stream = app.dest('actual/', {cwd: __dirname});
//     const buffered = [];

//     bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
//     stream.pipe(bufferStream);
//     stream.write(expectedFile);
//     stream.end();
//   });

//   it('should write buffer files to the right folder with relative cwd', function(cb) {
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const expectedPath = path.join(__dirname, 'actual/test.coffee');
//     const expectedCwd = __dirname;
//     const expectedBase = path.join(__dirname, 'actual');
//     const expectedContents = fs.readFileSync(inputPath);

//     const expectedFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: expectedContents
//     });

//     const onEnd = function() {
//       assert.equal(buffered.length, 1);
//       assert.equal(buffered[0], expectedFile);
//       assert.equal(buffered[0].cwd, expectedCwd, 'cwd should have changed');
//       assert.equal(buffered[0].base, expectedBase, 'base should have changed');
//       assert.equal(buffered[0].path, expectedPath, 'path should have changed');
//       assert.equal(fs.existsSync(expectedPath), true);
//       assert.equal(bufEqual(fs.readFileSync(expectedPath), expectedContents), true);
//       cb();
//     };

//     const stream = app.dest('actual/', {cwd: path.relative(process.cwd(), __dirname)});
//     const buffered = [];

//     bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
//     stream.pipe(bufferStream);
//     stream.write(expectedFile);
//     stream.end();
//   });

//   it('should write buffer files to the right folder with function and relative cwd', function(cb) {
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const expectedPath = path.join(__dirname, 'actual/test.coffee');
//     const expectedCwd = __dirname;
//     const expectedBase = path.join(__dirname, 'actual');
//     const expectedContents = fs.readFileSync(inputPath);
//     const buffered = [];

//     const expectedFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: expectedContents
//     });

//     const onEnd = function() {
//       assert.equal(buffered.length, 1);
//       assert.equal(buffered[0], expectedFile);
//       assert.equal(buffered[0].cwd, expectedCwd, 'cwd should have changed');
//       assert.equal(buffered[0].base, expectedBase, 'base should have changed');
//       assert.equal(buffered[0].path, expectedPath, 'path should have changed');
//       assert.equal(fs.existsSync(expectedPath), true);
//       assert.equal(bufEqual(fs.readFileSync(expectedPath), expectedContents), true);
//       cb();
//     };

//     const stream = app.dest(function(file) {
//       assert(file);
//       assert.equal(file, expectedFile);
//       return './actual';
//     }, { cwd: path.relative(process.cwd(), __dirname) });

//     bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
//     stream.pipe(bufferStream);
//     stream.write(expectedFile);
//     stream.end();
//   });

//   it('should write buffer files to the right folder', function(cb) {
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const expectedPath = path.join(__dirname, 'actual/test.coffee');
//     const expectedContents = fs.readFileSync(inputPath);
//     const expectedCwd = __dirname;
//     const expectedBase = path.join(__dirname, 'actual');
//     const expectedMode = parseInt('655', 8);

//     const expectedFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: expectedContents,
//       stat: {
//         mode: expectedMode
//       }
//     });

//     const onEnd = function() {
//       assert.equal(buffered.length, 1);
//       assert.equal(buffered[0], expectedFile);
//       assert.equal(buffered[0].cwd, expectedCwd, 'cwd should have changed');
//       assert.equal(buffered[0].base, expectedBase, 'base should have changed');
//       assert.equal(buffered[0].path, expectedPath, 'path should have changed');
//       assert.equal(fs.existsSync(expectedPath), true);
//       assert.equal(bufEqual(fs.readFileSync(expectedPath), expectedContents), true);
//       assert.equal(masked(fs.lstatSync(expectedPath).mode), expectedMode);
//       cb();
//     };

//     const stream = app.dest('actual/', {cwd: __dirname});
//     const buffered = [];

//     bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
//     stream.pipe(bufferStream);
//     stream.write(expectedFile);
//     stream.end();
//   });

//   it('should write streaming files to the right folder', function(cb) {
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const expectedPath = path.join(__dirname, 'actual/test.coffee');
//     const expectedContents = fs.readFileSync(inputPath);
//     const expectedCwd = __dirname;
//     const expectedBase = path.join(__dirname, 'actual');
//     const expectedMode = parseInt('655', 8);

//     const contentStream = through.obj();
//     const expectedFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: contentStream,
//       stat: {
//         mode: expectedMode
//       }
//     });

//     const onEnd = function() {
//       assert.equal(buffered.length, 1);
//       assert.equal(buffered[0], expectedFile);
//       assert.equal(buffered[0].cwd, expectedCwd, 'cwd should have changed');
//       assert.equal(buffered[0].base, expectedBase, 'base should have changed');
//       assert.equal(buffered[0].path, expectedPath, 'path should have changed');
//       assert.equal(fs.existsSync(expectedPath), true);
//       assert.equal(bufEqual(fs.readFileSync(expectedPath), expectedContents), true);
//       assert.equal(masked(fs.lstatSync(expectedPath).mode), expectedMode);
//       cb();
//     };

//     const stream = app.dest('actual/', {cwd: __dirname});

//     const buffered = [];
//     bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
//     stream.pipe(bufferStream);
//     stream.write(expectedFile);
//     setTimeout(function() {
//       contentStream.write(expectedContents);
//       contentStream.end();
//     }, 100);
//     stream.end();
//   });

//   it('should write directories to the right folder', function(cb) {
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const expectedPath = path.join(__dirname, 'actual/test');
//     const expectedCwd = __dirname;
//     const expectedBase = path.join(__dirname, 'actual');
//     const expectedMode = parseInt('655', 8);

//     const expectedFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: null,
//       stat: {
//         isDirectory: function() {
//           return true;
//         },
//         mode: expectedMode
//       }
//     });

//     const onEnd = function() {
//       assert.equal(buffered.length, 1);
//       assert.equal(buffered[0], expectedFile);
//       assert.equal(buffered[0].cwd, expectedCwd, 'cwd should have changed');
//       assert.equal(buffered[0].base, expectedBase, 'base should have changed');
//       assert.equal(buffered[0].path, expectedPath, 'path should have changed');
//       assert.equal(fs.existsSync(expectedPath), true);
//       assert.equal(fs.lstatSync(expectedPath).isDirectory(), true);
//       assert.equal(masked(fs.lstatSync(expectedPath).mode), expectedMode);
//       cb();
//     };

//     const stream = app.dest('actual/', {cwd: __dirname});

//     const buffered = [];
//     bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
//     stream.pipe(bufferStream);
//     stream.write(expectedFile);
//     stream.end();
//   });

//   it('should allow piping multiple dests in streaming mode', function(cb) {
//     const inputPath1 = path.join(__dirname, 'actual/multiple-first');
//     const inputPath2 = path.join(__dirname, 'actual/multiple-second');
//     const inputBase = path.join(__dirname, 'actual/');
//     const srcPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const stream1 = app.dest('actual/', {cwd: __dirname});
//     const stream2 = app.dest('actual/', {cwd: __dirname});
//     const content = fs.readFileSync(srcPath);
//     const rename = through.obj(function(file, _, next) {
//       file.path = inputPath2;
//       this.push(file);
//       next();
//     });

//     stream1.on('data', function(file) {
//       assert.equal(file.path, inputPath1);
//     });

//     stream1.pipe(rename).pipe(stream2);
//     stream2.on('data', function(file) {
//       assert.equal(file.path, inputPath2);
//     }).once('end', function() {
//       assert.equal(fs.readFileSync(inputPath1, 'utf8'), content.toString());
//       assert.equal(fs.readFileSync(inputPath2, 'utf8'), content.toString());
//       cb();
//     });

//     const file = new File({
//       base: inputBase,
//       path: inputPath1,
//       cwd: __dirname,
//       contents: content
//     });

//     stream1.write(file);
//     stream1.end();
//   });

//   it('should write new files with the default user mode', function(cb) {
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const expectedPath = path.join(__dirname, 'actual/test.coffee');
//     const expectedContents = fs.readFileSync(inputPath);
//     const expectedMode = parseInt('0666', 8) & (~process.umask());

//     const expectedFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: expectedContents
//     });

//     const onEnd = function() {
//       assert.equal(buffered.length, 1);
//       assert.equal(buffered[0], expectedFile);
//       assert.equal(fs.existsSync(expectedPath), true);
//       assert.equal(masked(fs.lstatSync(expectedPath).mode), expectedMode);
//       cb();
//     };

//     chmodSpy.reset();
//     const stream = app.dest('actual/', {cwd: __dirname});

//     const buffered = [];
//     bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);

//     stream.pipe(bufferStream);
//     stream.write(expectedFile);
//     stream.end();
//   });

//   it('should write new files with the specified mode', function(cb) {
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const expectedPath = path.join(__dirname, 'actual/test.coffee');
//     const expectedContents = fs.readFileSync(inputPath);
//     const expectedMode = parseInt('744', 8);

//     const expectedFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: expectedContents
//     });

//     const onEnd = function() {
//       assert.equal(buffered.length, 1);
//       assert.equal(buffered[0], expectedFile);
//       assert.equal(fs.existsSync(expectedPath), true);
//       assert.equal(masked(fs.lstatSync(expectedPath).mode), expectedMode);
//       cb();
//     };

//     chmodSpy.reset();
//     const stream = app.dest('actual/', { cwd: __dirname, mode: expectedMode });

//     const buffered = [];
//     bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);

//     stream.pipe(bufferStream);
//     stream.write(expectedFile);
//     stream.end();
//   });

//   it('should update file mode to match the vinyl mode', function(cb) {
//     if (isWindows) {
//       this.skip();
//       return;
//     }

//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const expectedPath = path.join(__dirname, 'actual/test.coffee');
//     const expectedContents = fs.readFileSync(inputPath);
//     const expectedBase = path.join(__dirname, 'actual');
//     const startMode = parseInt('0655', 8);
//     const expectedMode = parseInt('0722', 8);

//     const expectedFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: expectedContents,
//       stat: {
//         mode: expectedMode
//       }
//     });

//     const onEnd = function() {
//       assert.equal(masked(fs.lstatSync(expectedPath).mode), expectedMode);
//       cb();
//     };

//     fs.mkdirSync(expectedBase);
//     fs.closeSync(fs.openSync(expectedPath, 'w'));
//     fs.chmodSync(expectedPath, startMode);

//     const stream = app.dest('actual/', {cwd: __dirname});
//     stream.on('end', onEnd);
//     stream.write(expectedFile);
//     stream.end();
//   });

//   it('should use different modes for files and directories', function(cb) {
//     const inputBase = path.join(__dirname, 'fixtures/vinyl');
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/wow/suchempty');
//     const expectedBase = path.join(__dirname, 'actual/wow');
//     const expectedDirMode = parseInt('755', 8);
//     const expectedFileMode = parseInt('655', 8);

//     const firstFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       stat: fs.statSync(inputPath)
//     });

//     const onEnd = function() {
//       assert.equal(masked(fs.lstatSync(expectedBase).mode), expectedDirMode);
//       assert.equal(masked(buffered[0].stat.mode), expectedFileMode);
//       cb();
//     };

//     const stream = app.dest('actual/', {
//       cwd: __dirname,
//       mode: expectedFileMode,
//       dirMode: expectedDirMode
//     });

//     const buffered = [];
//     bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);

//     stream.pipe(bufferStream);
//     stream.write(firstFile);
//     stream.end();
//   });

//   it('should change to the specified base as string', function(cb) {
//     const inputBase = path.join(__dirname, 'fixtures/vinyl');
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/wow/suchempty');

//     const firstFile = new File({
//       cwd: __dirname,
//       path: inputPath,
//       stat: fs.statSync(inputPath)
//     });

//     const onEnd = function() {
//       assert.equal(buffered[0].base, inputBase);
//       cb();
//     };

//     const stream = app.dest('actual/', {
//       cwd: __dirname,
//       base: inputBase
//     });

//     const buffered = [];
//     bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);

//     stream.pipe(bufferStream);
//     stream.write(firstFile);
//     stream.end();
//   });

//   it.skip('should change to the specified base as function', function(cb) {
//     const inputBase = path.join(__dirname, 'fixtures/vinyl');
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/wow/suchempty');

//     const firstFile = new File({
//       cwd: __dirname,
//       path: inputPath,
//       stat: fs.statSync(inputPath)
//     });

//     const stream = app.dest('actual/', {
//       cwd: __dirname,
//       base: function(file) {
//         assert(file);
//         assert.equal(file.path, inputPath);
//         return inputBase;
//       }
//     });

//     const onEnd = function() {
//       assert.equal(buffered[0].base, inputBase);
//       cb();
//     };

//     const buffered = [];
//     bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);

//     stream.pipe(bufferStream);
//     stream.write(firstFile);
//     stream.end();
//   });

//   it('should report IO errors', function(cb) {
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const expectedPath = path.join(__dirname, 'actual/test.coffee');
//     const expectedContents = fs.readFileSync(inputPath);
//     const expectedBase = path.join(__dirname, 'actual');
//     const expectedMode = parseInt('722', 8);

//     const expectedFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: expectedContents,
//       stat: {
//         mode: expectedMode
//       }
//     });

//     fs.mkdirSync(expectedBase);
//     fs.closeSync(fs.openSync(expectedPath, 'w'));
//     fs.chmodSync(expectedPath, 0);

//     const stream = app.dest('actual/', {cwd: __dirname});
//     stream.on('error', function(err) {
//       assert.equal(err.code, 'EACCES');
//       cb();
//     });
//     stream.write(expectedFile);
//   });

//   it('should report stat errors', function(cb) {
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const expectedPath = path.join(__dirname, 'actual/test.coffee');
//     const expectedContents = fs.readFileSync(inputPath);
//     const expectedBase = path.join(__dirname, 'actual');
//     const expectedMode = parseInt('722', 8);

//     const expectedFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: expectedContents,
//       stat: {
//         mode: expectedMode
//       }
//     });

//     fs.mkdirSync(expectedBase);
//     fs.closeSync(fs.openSync(expectedPath, 'w'));

//     spies.setError(function(mod, fn) {
//       if (fn === 'fstat' && typeof arguments[2] === 'number') {
//         return new Error('stat error');
//       }
//     });

//     const stream = app.dest('actual/', {cwd: __dirname});
//     stream.on('error', function(err) {
//       assert.equal(err.message, 'stat error');
//       cb();
//     });
//     stream.write(expectedFile);
//   });

//   it('should report fchmod errors', function(cb) {
//     if (isWindows) {
//       this.skip();
//       return;
//     }

//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const expectedPath = path.join(__dirname, 'actual/test.coffee');
//     const expectedContents = fs.readFileSync(inputPath);
//     const expectedBase = path.join(__dirname, 'actual');
//     const expectedMode = parseInt('722', 8);

//     const fchmodSpy = expect.spyOn(fs, 'fchmod').andCall(function() {
//       const callback = arguments[arguments.length - 1];
//       callback(new Error('mocked error'));
//     });

//     const expectedFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: expectedContents,
//       stat: {
//         mode: expectedMode
//       }
//     });

//     fs.mkdirSync(expectedBase);
//     fs.closeSync(fs.openSync(expectedPath, 'w'));

//     const stream = app.dest('actual/', { cwd: __dirname });
//     stream.on('error', function(err) {
//       assert(err);
//       assert.equal(fchmodSpy.calls.length, 1);
//       cb();
//     });
//     stream.write(expectedFile);
//   });

//   it('should not fchmod a matching file', function(cb) {
//     if (isWindows) {
//       this.skip();
//       return;
//     }

//     const fchmodSpy = expect.spyOn(fs, 'fchmod').andCallThrough();

//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const expectedPath = path.join(__dirname, 'actual/test.coffee');
//     const expectedContents = fs.readFileSync(inputPath);
//     const expectedBase = path.join(__dirname, 'actual');
//     const expectedMode = parseInt('711', 8);

//     const expectedFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: expectedContents,
//       stat: {
//         mode: expectedMode
//       }
//     });

//     const stream = app.dest('actual/', { cwd: __dirname });
//     stream.on('end', function() {
//       assert.equal(fchmodSpy.calls.length, 0);
//       assert.equal(masked(fs.lstatSync(expectedPath).mode), expectedMode);
//       cb();
//     });
//     stream.write(expectedFile);
//     stream.end();
//   });

//   it('should see a file with special chmod (setuid/setgid/sticky) as matching', function(cb) {
//     if (isWindows) {
//       this.skip();
//       return;
//     }

//     const fchmodSpy = expect.spyOn(fs, 'fchmod').andCallThrough();
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const expectedPath = path.join(__dirname, 'actual/test.coffee');
//     const expectedContents = fs.readFileSync(inputPath);
//     const expectedBase = path.join(__dirname, 'actual');
//     const expectedMode = parseInt('3722', 8);
//     const normalMode = parseInt('722', 8);

//     const expectedFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: expectedContents,
//       stat: {
//         mode: normalMode
//       }
//     });

//     const onEnd = function() {
//       assert.equal(fchmodSpy.calls.length, 0);
//       cb();
//     };

//     fs.mkdirSync(expectedBase);
//     fs.closeSync(fs.openSync(expectedPath, 'w'));
//     fs.chmodSync(expectedPath, expectedMode);

//     const stream = app.dest('actual/', { cwd: __dirname });
//     stream.on('end', onEnd);
//     stream.write(expectedFile);
//     stream.end();
//   });

//   it('should not overwrite files with overwrite option set to false', function(cb) {
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const inputContents = fs.readFileSync(inputPath);

//     const expectedPath = path.join(__dirname, 'actual/test.coffee');
//     const expectedBase = path.join(__dirname, 'actual');
//     const existingContents = 'Lorem Ipsum';

//     const inputFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: inputContents
//     });

//     const onEnd = function() {
//       assert.equal(buffered.length, 1);
//       assert.equal(bufEqual(fs.readFileSync(expectedPath), Buffer.from(existingContents)), true);
//       cb();
//     };

//     // Write expected file which should not be overwritten
//     fs.mkdirSync(expectedBase);
//     fs.writeFileSync(expectedPath, existingContents);

//     const stream = app.dest('actual/', {cwd: __dirname, overwrite: false});

//     const buffered = [];
//     bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
//     stream.pipe(bufferStream);
//     stream.write(inputFile);
//     stream.end();
//   });

//   it('should overwrite files with overwrite option set to true', function(cb) {
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const inputContents = fs.readFileSync(inputPath);

//     const expectedPath = path.join(__dirname, 'actual/test.coffee');
//     const expectedBase = path.join(__dirname, 'actual');
//     const existingContents = 'Lorem Ipsum';

//     const inputFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: inputContents
//     });

//     const onEnd = function() {
//       assert.equal(buffered.length, 1);
//       assert.equal(bufEqual(fs.readFileSync(expectedPath), Buffer.from(inputContents)), true);
//       cb();
//     };

//     // This should be overwritten
//     fs.mkdirSync(expectedBase);
//     fs.writeFileSync(expectedPath, existingContents);

//     const stream = app.dest('actual/', {cwd: __dirname, overwrite: true});

//     const buffered = [];
//     bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
//     stream.pipe(bufferStream);
//     stream.write(inputFile);
//     stream.end();
//   });

//   it('should create symlinks when the `symlink` attribute is set on the file', function(cb) {
//     const inputPath = path.join(__dirname, 'fixtures/vinyl/test-create-dir-symlink');
//     const inputBase = path.join(__dirname, 'fixtures/vinyl/');
//     const inputRelativeSymlinkPath = 'wow';

//     const expectedPath = path.join(__dirname, 'actual/test-create-dir-symlink');

//     const inputFile = new File({
//       base: inputBase,
//       cwd: __dirname,
//       path: inputPath,
//       contents: null
//     });

//     // `src()` adds this side-effect with `keepSymlinks` option set to false
//     inputFile.symlink = inputRelativeSymlinkPath;

//     const onEnd = function() {
//       fs.readlink(buffered[0].path, function() {
//         assert.equal(buffered[0].symlink, inputFile.symlink);
//         assert.equal(buffered[0].path, expectedPath);
//         cb();
//       });
//     };

//     const stream = app.dest('actual/', {cwd: __dirname});

//     const buffered = [];
//     bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
//     stream.pipe(bufferStream);
//     stream.write(inputFile);
//     stream.end();
//   });

//   it('should emit finish event', function(cb) {
//     const srcPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
//     const stream = app.dest('actual/', {cwd: __dirname});

//     stream.once('finish', function() {
//       cb();
//     });

//     const file = new File({
//       path: srcPath,
//       cwd: __dirname,
//       contents: Buffer.from('1234567890')
//     });

//     stream.write(file);
//     stream.end();
//   });
// });

// describe('dest', function() {
//   beforeEach(function(cb) {
//     app = new App();
//     app.use(require('..')());
//     rimraf(actual, cb);
//   });

//   afterEach(function(cb) {
//     rimraf(actual, cb);
//   });

//   describe('streams', function() {
//     it('should return a stream', function(cb) {
//       const stream = app.dest(path.join(__dirname, 'fixtures/'));
//       assert(stream);
//       assert(stream.on);
//       cb();
//     });

//     it('should return an output stream that writes files', function(cb) {
//       const instream = app.src(path.join(__dirname, 'fixtures/copy/e*.txt'));
//       const outstream = app.dest(actual);
//       instream.pipe(outstream);

//       outstream.on('error', cb);
//       outstream.on('data', function(file) {
//         // data should be re-emitted correctly
//         assert(file);
//         assert(file.path);
//         assert(file.contents);
//         assert.equal(path.join(file.path, ''), path.join(actual, 'example.txt'));
//         assert.equal(String(file.contents), 'Hello world!');
//       });
//       outstream.on('end', function() {
//         fs.readFile(path.join(actual, 'example.txt'), function(err, contents) {
//           assert(!err);
//           assert(contents);
//           assert.equal(String(contents), 'Hello world!');
//           cb();
//         });
//       });
//     });

//     it('should return an output stream that does not write non-read files', function(cb) {
//       const instream = app.src(path.join(__dirname, 'fixtures/copy/e*.txt'), {read: false});
//       const outstream = app.dest(actual);
//       instream.pipe(outstream);

//       outstream.on('error', cb);
//       outstream.on('data', function(file) {
//         // data should be re-emitted correctly
//         assert(file);
//         assert(file.path);
//         assert(!file.contents);
//         assert.equal(path.join(file.path, ''), path.join(actual, 'example.txt'));
//       });

//       outstream.on('end', function() {
//         fs.readFile(path.join(actual, 'example.txt'), function(err, contents) {
//           assert(err);
//           assert(!contents);
//           cb();
//         });
//       });
//     });

//     it('should return an output stream that writes streaming files', function(cb) {
//       const instream = app.src(path.join(__dirname, 'fixtures/copy/e*.txt'), {buffer: false});
//       const outstream = instream.pipe(app.dest(actual));

//       outstream.on('error', cb);
//       outstream.on('data', function(file) {
//         // data should be re-emitted correctly
//         assert(file);
//         assert(file.path);
//         assert(file.contents);
//         assert.equal(path.join(file.path, ''), path.join(actual, 'example.txt'));
//       });
//       outstream.on('end', function() {
//         fs.readFile(path.join(actual, 'example.txt'), function(err, contents) {
//           assert(!err);
//           assert(contents);
//           assert.equal(String(contents), 'Hello world!');
//           cb();
//         });
//       });
//     });

//     it('should return an output stream that writes streaming files to new directories', function(cb) {
//       testWriteDir({}, cb);
//     });

//     it('should return an output stream that writes streaming files to new directories (buffer: false)', function(cb) {
//       testWriteDir({buffer: false}, cb);
//     });

//     it('should return an output stream that writes streaming files to new directories (read: false)', function(cb) {
//       testWriteDir({read: false}, cb);
//     });

//     it('should return an output stream that writes streaming files to new directories (read: false, buffer: false)', function(cb) {
//       testWriteDir({buffer: false, read: false}, cb);
//     });

//   });

//   describe('ext', function() {
//     beforeEach(function() {
//       app = new App();
//       app.use(require('..')());
//       app.option('engine', '.txt');
//     });

//     afterEach(function() {
//       app.option('engine', '.html');
//     });

//     it('should return a stream', function(cb) {
//       const stream = app.dest(path.join(__dirname, 'fixtures/'));
//       assert(stream);
//       assert(stream.on);
//       cb();
//     });

//     it('should return an output stream that writes files', function(cb) {
//       const instream = app.src(path.join(__dirname, 'fixtures/copy/e*.txt'));
//       const outstream = app.dest(actual);
//       instream.pipe(outstream);

//       outstream.on('error', cb);
//       outstream.on('data', function(file) {
//         // data should be re-emitted correctly
//         assert(file);
//         assert(file.path);
//         assert(file.contents);
//         assert.equal(path.join(file.path, ''), path.join(actual, 'example.txt'));
//         assert.equal(String(file.contents), 'Hello world!');
//       });
//       outstream.on('end', function() {
//         fs.readFile(path.join(actual, 'example.txt'), function(err, contents) {
//           assert(!err);
//           assert(contents);
//           assert.equal(String(contents), 'Hello world!');
//           cb();
//         });
//       });
//     });

//     it('should return an output stream that does not write non-read files', function(cb) {
//       const instream = app.src(path.join(__dirname, 'fixtures/dest/*.txt'), {read: false});
//       const outstream = app.dest(actual);
//       instream.pipe(outstream);

//       outstream.on('error', cb);
//       outstream.on('data', function(file) {
//         // data should be re-emitted correctly
//         assert(file);
//         assert(file.path);
//         assert(!file.contents);
//         assert.equal(path.join(file.path, ''), path.join(actual, 'example.txt'));
//       });

//       outstream.on('end', function() {
//         fs.readFile(path.join(actual, 'example.txt'), function(err, contents) {
//           assert(err);
//           assert(!contents);
//           cb();
//         });
//       });
//     });
//   });

//   function testWriteDir(srcOptions, cb) {
//     const instream = app.src(path.join(__dirname, 'fixtures/generic'), srcOptions);
//     const outstream = instream.pipe(app.dest(actual));

//     outstream.on('error', cb);
//     outstream.on('data', function(file) {
//       // data should be re-emitted correctly
//       assert(file);
//       assert(file.path);
//       assert.equal(path.join(file.path, ''), path.join(actual, 'generic'));
//     });

//     outstream.on('end', function() {
//       fs.exists(path.join(actual, 'generic'), function(exists) {
//         assert(exists);
//         cb();
//       });
//     });
//   }
// });

