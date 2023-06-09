const fs = require("fs");
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const viewRouter = require("./routes/viewRoute");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// const tours = JSON.parse(
//   fs.readFileSync(
//     `${__dirname}/dev-data/data/tours-simple.json`
//   )
// );

//Middleware
//SET Security HTTP Headers
app.use(helmet({ contentSecurityPolicy: false }));
//calling helmet to return a function waiting to be called

//Development Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Limit Request From Same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  //Time window(mil-secs)
  message:
    "Too Many Request From This IP, Please Try Later",
});
app.use("/api", limiter);

//Body Parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
//Parses incoming requests with urlencoded payloads and is based on body-parser
app.use(
  express.urlencoded({ extended: true, limit: "10kb" })
);
app.use(cookieParser());
//parse client side json into javascript object and attach to request object

//DATA Sanitization against NOSQL Query Injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss());

//Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

//compress text file (JSON, HTML) to client
app.use(compression());

//Serving Static Files
// app.use(express.static(`${__dirname}/public`));

// Create Custom  Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

//Route
// app.get("/", (req, res) => {
//   // res.status(200).send("Hello from the server side!")
//   res.status(200).json({
//     message: "Hello from the server side!",
//     app: "Natours",
//   });
// });
app.post("/", (req, res) => {
  res.send("You can post to this endpoint...");
});

//Route
//res.send(), res.json() ..etc ends the Request Response Cycle
//Middleware After it will not be called

//Mounting Router
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

//Use .all() to apply all http request methods
app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "FAIL",
  //   message: `Cannot Find ${req.originalUrl} On This Server`,
  // });

  // const err = new Error(
  //   "`Cannot Find ${req.originalUrl} On This Server`"
  // );
  // err.status = "Fail";
  // err.statusCode = 404;
  next(
    new AppError(
      `Cannot Find ${req.originalUrl} On This Server`,
      404
    )
  );
  //express assume anything passed into the next() the error
});

// app.use((err, req, res, next) => {
//   console.log(err.stack);
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "Error";
//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });

app.use(globalErrorHandler);

module.exports = app;
