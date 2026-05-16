function responseStatus(res, code = 200, message = "", data = null) {
  const success = code >= 200 && code < 300;
  return res.status(code).json({ success, message, data });
}

module.exports = {
  responseStatus,
  // Backward compatible alias with different casing used elsewhere
  ResponseStatus: responseStatus,
};


