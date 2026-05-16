// 404 handler
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not found - ${req.originalUrl}`,
  });
};

module.exports = notFound;
