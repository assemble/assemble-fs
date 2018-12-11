'use strict';

const fs = require('graceful-fs');
const sinon = require('sinon');
let errorfn = false;

function maybeCallAsync(module, func) {
  let original = module[func];
  return sinon.stub(module, func, function() {
    let args = Array.prototype.slice.call(arguments);
    args.unshift(module, func);
    let err = typeof errorfn === 'function' && errorfn.apply(this, args);
    if (!err) {
      original.apply(this, arguments);
    } else {
      arguments[arguments.length - 1](err);
    }
  });
}

module.exports = {
  setError: function(fn) {
    errorfn = fn;
  },
  chmodSpy: maybeCallAsync(fs, 'chmod'),
  fchmodSpy: maybeCallAsync(fs, 'fchmod'),
  futimesSpy: maybeCallAsync(fs, 'futimes'),
  statSpy: maybeCallAsync(fs, 'stat'),
  fstatSpy: maybeCallAsync(fs, 'fstat'),
};
