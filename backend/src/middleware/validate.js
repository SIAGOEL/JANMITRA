const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Collects express-validator results and turns them into a 400 ApiError.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(', ');
    return next(new ApiError(400, message));
  }
  next();
}

module.exports = validate;
