module.exports = (err, req, res, next) => {
  console.log(err);
  const statusCode = err.statusCode || 500;
  const statusMessage = err.message || "Something went wrong!";
  res.status(statusCode).json({
    status: "fail",
    message: statusMessage,
    err,
  });
};
