const Review = require("../models/reviewModel");
// const APIFeatures = require("./../utils/apiFeatures");
// const catchAsync = require("../utils/catchAsync");
// const AppError = require("../utils/appError");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handlerFactory");

// exports.getAllReviews = catchAsync(
//   async (req, res, next) => {
//     let filter = {};
//     if (req.params.tourId)
//       filter = { tour: req.params.tourId };

//     const reviews = await Review.find(filter);

//     res.status(200).json({
//       status: "SUCCESS",
//       results: reviews.length,
//       data: {
//         reviews,
//       },
//     });
//   }
// );

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// exports.createReview = catchAsync(
//   async (req, res, next) => {
//     if (!req.body.tour) req.body.tour = req.params.tourId;
//     if (!req.body.user) req.body.user = req.user.id;
//     const newReview = await Review.create({
//       user: req.user.id,
//       ...req.body,
//     });
//     // const newReview = await Review.create(req.body);
//     res.status(201).json({
//       status: "Success",
//       data: {
//         review: newReview,
//       },
//     });
//   }
// );

exports.createReview = createOne(Review);
exports.updateReview = updateOne(Review);
exports.deleteReview = deleteOne(Review);
exports.getReview = getOne(Review);
exports.getAllReviews = getAll(Review);
