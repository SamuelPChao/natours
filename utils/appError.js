const { prototype } = require("./apiFeatures");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4")
      ? "Fail"
      : "Error";
    this.isOperational = true;
    // console.log(this, this.constructor);
    Error.captureStackTrace(this, this.constructor);
    //Pass in the Error constructor function to mark the exact point the error occurs
  }
}

module.exports = AppError;
