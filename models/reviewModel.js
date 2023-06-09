const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review Can Not Be Empty"],
    },
    rating: {
      required: [true, "Review Must Have A Rating"],
      type: Number,
      default: 4.5,
      min: [1, "Rating Must Be Above 1.0"],
      max: [5, "Rating Must Be Below 5.0"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [
        true,
        "A Review Must Commented By Someone",
      ],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review Must Belong To A Tour"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Set A Compound Unique Index Of tour and user To Prevent User Implement Duplicate Review On Same Tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  // .populate({
  //   path: "tour",
  //   select: "name",
  // });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (
  tourId
) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        numRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numRating,
      ratingsAverage: stats[0].avgRating,
    });
    return;
  }
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: 0,
    ratingsAverage: 4.5,
  });
};
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post("save", function () {
  //This Points To Current Review(Model)
  //Review Hasnt Not Been Declared
  //Using constructor Instead Of The Instance(Review) Created By The reviewSchema  Constructor
  this.constructor.calcAverageRatings(this.tour);
});

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   //NOT WORKING
//   //Error Query was already executed: Review.findOne({ _id: '5c8a37f114eb5c17645c9114' })
//   this.docPassToPost = await this.findOne();
//   console.log(this.docPassToPost);
//   next();
// });

reviewSchema.post(/^findOneAnd/, async function (doc) {
  await doc.constructor.calcAverageRatings(doc.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
