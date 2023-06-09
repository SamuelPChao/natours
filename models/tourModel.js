const mongoose = require("mongoose");
const slugify = require("slugify");
const User = require("./userModel");

const validator = require("validator");
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Tour Must Have A Name"],
      unique: true,
      trim: true,
      maxlength: [
        40,
        "A Tour Name Have Less Or Equal Than 40 Characters",
      ],
      minlength: [
        10,
        "A Tour Name Have More Or Equal Than 10 Characters",
      ],
      // validate: [validator.isAlpha, "Tour Name Must Only Contains Characters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A Tour Must Have A Duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A Tour Must Have A Group Size"],
    },
    difficulty: {
      type: String,
      required: [true, "A Tour Must Have A Difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message:
          "Difficulty Is Either: easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating Must Be Above 1.0"],
      max: [5, "Rating Must Be Below 5.0"],
      set: (val) => Math.round(val * 100) / 100,
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: {
      type: Number,
      required: [true, "A Tour Must Have A Price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
          //this keyword only points to current document when creating a new document
          //does not apply to updating document
        },
        message:
          "Discount Price ({VALUE}) Should Be Below Regular Price",
        //{VALUE} mongoose feature
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A Tour Must Have A Image"],
    },
    images: [String],
    //an array of strings to keep multiple image reference
    createAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startLocation: {
      //GeoJSON for MongoDB
      //sub-fields schema option
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      //[ Longitude, Latitude]
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//Adding Index Of Price By Accending Order (Single Field Query)
// tourSchema.index({ price: 1 });
////Adding Index Of Price By Accending Order (Compound Query)
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

//VIRTUAL PROPERTY
// tourSchema.virtual("durationWeeks").get(function () {
//   return this.duration / 7;
//   //this keyword needed
// });

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

//DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre("save", function (next) {
  //this points to current document
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Embedding tour guides into tour document when creating tour
// tourSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   //map() returns Promise elements in a Array
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.post("save", function (doc, next) {
//   // console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  //using regular expression to handle all the find methods
  //this points to current query
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(
    `Query took ${Date.now() - this.start} milliseconds!`
  );
  // console.log(docs);
  next();
});

// AGGREGATION MIDDLEWARE
// tourSchema.pre("aggregate", function (next) {
//   // console.log(this.pipeline());
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } },
//   });
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
