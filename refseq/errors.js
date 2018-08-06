/* 
 Create some custom error classes for HTTP return codes
*/

class HttpError extends Error {
  constructor (message, status) {

  // Calling parent constructor of base Error class.
  super(message || 'Unknown internal server error');
    
  // Saving class name in the property of our custom error as a shortcut.
  this.name = this.constructor.name;

  // Capturing stack trace, excluding constructor call from it.
  Error.captureStackTrace(this, this.constructor);
    
  // Default status type will be 500 unless customized by
  // a sub-class or in instanciation.
    this.status = status || 500;
  }
};

module.exports.HttpError = HttpError;

module.exports.Http400 = class Http404 extends HttpError {
  constructor (message) {
    super(message || 'Bad request', 400);
  }
};

module.exports.Http404 = class Http404 extends HttpError {
  constructor (message) {
    super(message || 'Not found', 404);
  }
};

module.exports.Http415 = class Http415 extends HttpError {
  constructor (message) {
    super(message || 'Unsupported media type', 415);
  }
};

module.exports.Http416 = class Http406 extends HttpError {
  constructor (message) {
    super(message || 'Range Not Satisfiable', 416);
  }
};

module.exports.Http501 = class Http501 extends HttpError {
  constructor (message) {
    super(message || 'Not implemented', 501);
  }
};
