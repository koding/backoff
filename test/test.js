var assert = require('assert');
var Promise = require('bluebird');
var backoff = require('../');

describe("backoff", function () {
  this.timeout(15000);

  describe("using promises", function () {
    var sleep = require('./sleep-promises.js');

    it("should succeed if the backoff threshold is not met", function (done) {
      var b = backoff()

      b(sleep(100)).then(function () {
        done();
      });
    });

    it('should backoff exponentially if the threshold is exceeded', function (done) {
      var begin = Date.now();

      var b = backoff({ initialDelayMs: 700 });

      b(sleep(1400)).then(function () {
        assert(Date.now() - begin > 700 * 2);
        done();
      })
    });

    it('should throw an exception if the max attempts is exceeded', function (done) {
      var b = backoff({ maxAttempts: 3 });

      b(sleep(7000))
      .then(function () {
        throw new Error("Error expected!");
      })
      .catch(backoff.MaxAttemptsError, function (err) {
        done();
      });
    });

    it('should be resettable', function (done) {
      var begin = Date.now();

      var b = backoff({ verbose: true });

      b(sleep(690)).then(function () {
        b.reset();
        return b(sleep(690));
      })
      .then(function () {
        b.reset();
        return b(sleep(690));
      })
      .then(function () {
        var elapsedMs = Date.now() - begin
        assert(
          (690 * 3) <= elapsedMs && elapsedMs <= (690 * 3 + 30/*ms leeway */)
        );
        done();
      });

    });
  });

  describe('using callbacks', function () {
    var sleep = require('./sleep-callbacks.js');

    it("should succeed if the backoff threshold is not met", function (done) {
      var b = backoff();

      b(sleep(100), function (err) {
        if (err != null) {
          throw err;
        }
        done();
      });
    });

    it('should backoff exponentially if the threshold is exceeded', function (done) {
      var begin = Date.now();

      var b = backoff({ initialDelayMs: 700 });

      b(sleep(1401), function (err) {
        if (err != null) {
          throw err;
        }
        assert(Date.now() - begin > 700 * 2);
        done();
      })
    });

    it('should throw an exception if the max attempts is exceeded', function (done) {

      var b = backoff({ maxAttempts: 3 });

      b(sleep(7000), function (err) {
        if (err) {
          if (!(err instanceof backoff.MaxAttemptsError)) {
            throw err
          }
          done();
          return;
        }
        throw new Error("Error expected!");
      });
    });

  });
});
