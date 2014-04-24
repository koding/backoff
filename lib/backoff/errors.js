var inherits = require('util').inherits;

module.exports = {
  MaxAttemptsError: MaxAttemptsError
};

inherits(MaxAttemptsError, Error);

function MaxAttemptsError(message) {
  this.name = "MaxAttemptsError";
  this.message = message;
  this.cause = message;
  this.isAsync = true;

  if (message instanceof Error) {
    this.message = message.message;
    this.stack = message.stack;
  }
  else if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  }
}
