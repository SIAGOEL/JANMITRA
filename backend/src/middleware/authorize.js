const ApiError = require('../utils/ApiError');

/**
 * Restrict access to specific user roles.
 *
 * Usage:
 * protect,
 * authorize('Admin', 'Senior Officer')
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          'You do not have permission to perform this action'
        )
      );
    }

    next();
  };
}

module.exports = { authorize };