const ApiError = require('./ApiError');

function apiErrorHandler(err, req, res, next) {
  // in prod, don't use console.log or console.err because
  // it is not async
  // console.error(err);

  if (err instanceof ApiError) {
    res.status(err.code).json({
      "error_code": err.code,
      "error_message": err.message
    });
    return;
  }

  res.status(500).json('Something went wrong');
}

module.exports = apiErrorHandler;
