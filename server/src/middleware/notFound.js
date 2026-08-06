export function apiNotFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: "Not found",
    path: req.originalUrl,
  });
}
