const { json } = require("express");

class ApiError {
  constructor(code, message) {
    this.code = code;
    this.message = message;
  }

  static notFound(msg) {
    return new ApiError(404, msg);
  }

  static internal(msg) {
    return new ApiError(500, msg);
  }
}

module.exports = ApiError;
