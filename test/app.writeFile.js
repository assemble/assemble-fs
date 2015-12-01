'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var App = require('templates');
var afs = require('..');
var app;

describe('app.writeFile', function() {
  beforeEach(function() {
    app = new App();
    app.use(afs());
  });

  it('should throw when dest path is not defined', function(cb) {
    app.writeFile(null, null, function(err) {
      assert(err);
      cb();
    });
  });

  it('should throw when file is not defined', function(cb) {
    app.writeFile('foo', null, function(err) {
      assert(err);
      cb();
    });
  });

  it('should throw when callback is not defined', function(cb) {
    try {
      app.writeFile('foo', 'bar');
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      cb();
    }
  });

  it('should write all views in a collection to the file system', function(cb) {
    app.create('pages');
    app.page('foo.md', {content: 'some content'});
    app.page('bar.md', {content: 'some content'});
    app.page('baz.md', {content: 'some content'});

    app.pages.writeFiles('test/actual', function(err) {
      if (err) return cb(err);
      cb();
    });
  });

  it('should write a view to the file system', function(cb) {
    app.create('pages');
    app.page('foo', {content: 'some content'})
      .writeFile('test/actual/foo.md', function(err) {
        if (err) return cb(err);
        cb();
      });
  });
});
