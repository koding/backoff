var Promise = require('bluebird');

var MaxAttemptsError = require('./lib/backoff/errors.js').MaxAttemptsError;

createBackoff.MaxAttemptsError = MaxAttemptsError;

module.exports = createBackoff;

function createBackoff(options) {
  if (options == null) {
    options = {};
  }

  var initialDelayMs = null
    , multiplyFactor = null
    , maxDelayMs = null
    , maxAttempts = null
    , verbose = null
    , tries = null
  ;

  reset();

  backoff.reset = reset;

  return backoff;

  function backoff(fn, callback) {

    var timeout = Math.min(initialDelayMs * Math.pow(
      multiplyFactor, tries++
    ), maxDelayMs);

    if (fn.length > 1) {
      throw new Error("Function has too many parameters!");
    }

    if (fn.length === 1) {
      fn = Promise.promisify(fn);
    }

    if (verbose === true) {
      console.info("Current timeout: " + timeout);
    }

    var task = fn().cancellable()

    return task.timeout(timeout)
      .then(function (result) {
        return result;
      })
      .catch(Promise.TimeoutError, function () {
        var cancelled = task.cancel();
        if (verbose === true) {
          console.info("Timed out");
        }
        if (tries < maxAttempts) {
          if (verbose === true) {
            console.info("Trying again");
          }
          return backoff(fn);
        }
        if (verbose === true) {
          console.info("Giving up");
        }
        throw new MaxAttemptsError("Maximum attempts exceeded!");
      })
      .nodeify(callback);
  }

  function reset() {
    initialDelayMs = option(options.initialDelayMs, 700)
    multiplyFactor = option(options.multiplyFactor, 1.4)
    maxDelayMs = option(options.maxDelayMs, 1000 * 15 /* 15 seconds */)
    maxAttempts = option(options.maxAttempts, 50)
    verbose = option(options.verbose, false)
    tries = 0
  }

}

function option(val, defaultVal) {
  return val != null ? val : defaultVal;
}

function noop() {}
