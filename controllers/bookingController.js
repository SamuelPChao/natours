const stripe = require("stripe")(
  process.env.STRIPE_SECRET_KEY
);
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handlerFactory");

exports.getCheckoutSession = catchAsync(
  async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // price: "price_1NGRLjBZjK3aIaqelO8tHvhy",
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tour.name}`,
            },
            unit_amount: `${tour.price * 100}`,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${req.protocol}://${req.get(
        "host"
      )}/?tour=${req.params.tourId}&user=${
        req.user.id
      }&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get(
        "host"
      )}/tours/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
    });

    res.status(200).json({
      status: "Success",
      session,
    });
  }
);

exports.createBookingCheckout = catchAsync(
  async (req, res, next) => {
    const { tour, user, price } = req.query;

    // implementing at viewRouter base route with query
    if (!tour && !user && !price) return next();

    await Booking.create({
      tour,
      user,
      price,
    });

    res.redirect(req.originalUrl.split("?")[0]);
  }
);

exports.createBooking = createOne(Booking);
exports.getBooking = getOne(Booking);
exports.getAllBooking = getAll(Booking);
exports.updateBooking = updateOne(Booking);
exports.deleteBooking = deleteOne(Booking);
