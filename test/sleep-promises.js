var Promise = require('bluebird');

module.exports = rest;

function rest(ms) {
  return function () {
    return Promise.delay(ms).cancellable();
  };
}