const mongoose = require("mongoose");
require("dotenv").config({
  path: "./config.env",
});
const express = require("express");
const app = require("./app");
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

//EXPRESS ENV
// console.log(app.get("env"));
//NODE ENV
// console.log(process.env.NODE_ENV);

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.PASSWORD
);
mongoose.connect(DB).then((con) => {
  // console.log(con.connections);
  // console.log('DB connection connected');
});

// const testTour = new Tour({
//   name: 'The Forest Hiker',
//   rating: 4.7,
//   price: 497,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log(err.message);
//   });

//Start Server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
//callback function as server starts listening)

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("Sigterm received. Shutting down gracefully");
  server.close(() => {
    //Does need to implement process.exit()
    //sigterm will shut down the application
    console.log("Process terminated");
  });
});
