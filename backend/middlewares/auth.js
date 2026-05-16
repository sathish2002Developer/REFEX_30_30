const { User } = require("../models");
const jwt = require("jsonwebtoken");
const { getAppJwtSecret } = require("../helpers/jwtSecret");
const APP_KEY = getAppJwtSecret();
const { API_KEY } = process.env;
const Response = require("../helpers/response");

exports.authCheck = (req, res, next) => {
  const { authorization } = req.headers;
  try {
    if (authorization && authorization.startsWith("Bearer")) {
      const token = authorization.substr(7);
      const data = jwt.verify(token, APP_KEY);
      if (data) {
        req.userData = data;
        return next();
      }
    }
    return next();
  } catch (error) {
    return next();
   
  }
};

// Strict auth middleware that requires valid authentication
exports.requireAuth = (req, res, next) => {
  const { authorization } = req.headers;
  try {
    if (authorization && authorization.startsWith("Bearer")) {
      const token = authorization.substr(7);
      const data = jwt.verify(token, APP_KEY);
      if (data) {
        req.userData = data;
        return next();
      }
    }
    return Response.responseStatus(res, 401, "Authentication required");
  } catch (error) {
    return Response.responseStatus(res, 401, "Invalid or expired token");
  }
};

exports.authType = (type) => {
  return async (req, res, next) => {
    const data = req.userData;
    const user = await User.findByPk(data.id);
    if (!user) {
      return Response.responseStatus(res, 401, "Invalid Token");
    }
    if (user.user_type === type) {
      return next();
    } else {
       return next();
      // return Response.responseStatus(res, 403, "You don't have permission");
    }
  };
};

exports.authAllowTypes = (types = []) => {
  return async (req, res, next) => {
    const data = req.userData;
    const user = await User.findByPk(data.id);

    if (!user) {
      return Response.responseStatus(res, 403, "You don't have permission");
    }
    if (types.includes(user.user_type)) {
      return next();
    }
  };
};

exports.validateAPI = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    const token = authorization.substr(7);
    try {
      const data = jwt.verify(token, API_KEY);
      if (data) {
        req.userData = data;
        return next();
      }
    } catch (error) {
      return Response.responseStatus(res, 401, "Invalid token", error);
    }
  }
  return next();
};
