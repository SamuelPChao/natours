const AppError = require("../utils/appError");

const sendErrorDev = (err, req, res) => {
  // console.log(err.statusCode, err.message);
  //API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }
  //WEBPAGE
  return res.status(err.statusCode).render("error", {
    title: "Error Occurs! DEV",
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      //Operational, Trusted Error: Send Message To Client
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //Programming Or Other Unknown Error: Not Sending Error Details
    console.error("Error", err);
    return res.status(500).json({
      status: "Error",
      message: "Something Went Wrong!!!",
    });
  }
  if (err.isOperational) {
    //Operational, Trusted Error: Send Message To Client
    return res.status(err.statusCode).render("error", {
      title: "Error Occurs! PROD",
      msg: err.message,
    });
  }
  //Programming Or Other Unknown Error: Not Sending Error Details
  console.error("Error", err);
  return res.status(err.statusCode).render("error", {
    title: "Something Went Wrong!!!",
    msg: "Please Try Again Later!!!",
  });
};

const handleCastErrorDB = (err) => {
  const message = `Invalid Error ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate Field Value: ${value} Please Use Another Value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(
    (el) => el.message
  );
  const message = `Invalid input data. ${errors.join(
    ". "
  )}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError("Invalid Token", 401);

const handleJWTExpiredError = (err) =>
  new AppError("Token Expired, Please Login Again", 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = JSON.parse(JSON.stringify(err));
    error.name = err.name;
    error.message = err.message;

    if (error.name === "CastError") {
      error = handleCastErrorDB(err);
    }
    if (error.code === 11000)
      error = handleDuplicateFieldsDB(err);

    if (error.name === "ValidationError")
      error = handleValidationErrorDB(err);

    if (err.name === "JsonWebTokenError")
      error = handleJWTError();

    if (err.name === "TokenExpiredError")
      error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
