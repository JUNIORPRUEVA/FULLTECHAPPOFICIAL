function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      return res.status(400).json({
        ok: false,
        message: "Validación fallida",
        errors: e.errors ?? e,
      });
    }
  };
}

module.exports = { validate };
