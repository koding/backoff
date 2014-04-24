var Promise = require('bluebird');

module.exports = rest;

function rest(ms) {
  var t = 0;
  return function () {
    return (function (t) {
      return Promise.delay(ms).cancellable().then(function () {
        console.log('fin', t);
      });
    }(t++));
  };
}