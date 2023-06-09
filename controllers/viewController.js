const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError.js");

exports.getOverview = catchAsync(async (req, res, next) => {
  console.log("Overview");
  const tours = await Tour.find();
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({
    slug: req.params.slug,
  })
    .populate({
      path: "reviews",
      fields: "review rating user",
    })
    .populate({
      path: "guides",
    });
  if (!tour) {
    return next(
      new AppError("No Tour Found With The Name", 404)
    );
  }
  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Login",
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your Account",
  });
};

exports.updateUserData = catchAsync(
  async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).render("account", {
      title: "Your Account",
      user: updatedUser,
    });
  }
);

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({
    user: req.user.id,
  });
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  //using $in query operator to query the property whose value matches with one of the element in the array

  res.status(200).render("overview", {
    title: "My Tours",
    tours,
  });
});
