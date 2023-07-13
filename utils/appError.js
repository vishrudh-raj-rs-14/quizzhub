class AppError extends Error {
  constructor(message, statusCode, home = false) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.redirect = home;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
