module.exports = rest;

function rest(ms) {
  return function (callback) {
    setTimeout(callback, ms);
  };
}
