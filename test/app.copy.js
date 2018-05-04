'use strict';

require('mocha');
const path = require('path');
const assert = require('assert');
const rimraf = require('rimraf');
const App = require('templates');
const vfs = require('..');
let app;

const fixtures = path.join(__dirname, 'fixtures/copy/*.txt');
const outpath = path.join(__dirname, 'out-fixtures');

describe('app.copy', function() {
  beforeEach(function(cb) {
    rimraf(outpath, cb);
    app = new App();
    app.use(vfs());
  });

  afterEach(function(cb) {
    rimraf(outpath, cb);
  });

  describe('streams', function() {
    it('should copy files', function(cb) {
      app.copy(fixtures, path.join(__dirname, 'actual'))
        .on('error', cb)
        .on('data', function(file) {
          assert.equal(typeof file, 'object');
        })
        .on('end', cb);
    });
  });
});
