module.exports = rest;

function rest(ms) {
  var t = 0;
  return function (callback) {
    return (function (t) {
      setTimeout(callback, ms);
    }(t++));
  };
}
