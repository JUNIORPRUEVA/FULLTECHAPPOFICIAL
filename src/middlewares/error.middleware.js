function errorMiddleware(err, req, res, next) {
  console.error("❌ ERROR:", err);

  const status = err.statusCode ?? 500;
  res.status(status).json({
    ok: false,
    message: err.message ?? "Error interno",
  });
}

module.exports = { errorMiddleware };
