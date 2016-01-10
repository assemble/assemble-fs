'use strict';

var path = require('path');
var assert = require('assert');
var should = require('should');
var rimraf = require('rimraf');
var File = require('vinyl');
var App = require('templates');
var fs = require('..');
var app

describe('handlers', function() {
  beforeEach(function() {
    app = new App();
    app.use(fs());
  });

  afterEach(function(cb) {
    rimraf(path.join(__dirname, './out-fixtures/'), cb);
  });

  it('should emit on preWrite', function(cb) {
    var count = 0;
    app.preWrite(/./, function(file, next) {
      count++;
      next();
    });

    var srcPath = path.join(__dirname, './fixtures/vinyl/test.coffee');
    var stream = app.dest('./out-fixtures/', {
      cwd: __dirname
    });

    stream.once('finish', function () {
      assert.equal(count, 1);
      cb();
    });

    var file = new File({
      path: srcPath,
      cwd: __dirname,
      contents: new Buffer("1234567890")
    });
    file.options = {};

    stream.write(file);
    stream.end();
  });

  it('should emit on postWrite', function(cb) {
    var count = 0;
    app.postWrite(/./, function(file, next) {
      count++;
      next();
    });

    var srcPath = path.join(__dirname, './fixtures/vinyl/test.coffee');
    var stream = app.dest('./out-fixtures/', {
      cwd: __dirname
    });

    stream.once('finish', function () {
      assert.equal(count, 1);
      cb();
    });

    var file = new File({
      path: srcPath,
      cwd: __dirname,
      contents: new Buffer("1234567890")
    });
    file.options = {};

    stream.write(file);
    stream.end();
  });
});
