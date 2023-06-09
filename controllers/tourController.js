const multer = require("multer");
const sharp = require("sharp");
const Tour = require("../models/tourModel");
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
// const APIFeatures = require("./../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handlerFactory");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(
      new AppError("File Accepts Image Only", 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);
// upload.single('image')(req.file)
// upload.array('images',5)(req.files)

exports.resizeTourImages = catchAsync(
  async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images)
      return next();

    req.body.imageCover = `tour-${
      req.params.id
    }-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);

    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${
          req.params.id
        }-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
      })
    );
    console.log(req.body);

    next();
  }
);

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price,-ratingsAverage";
  req.query.fields =
    "name,price,ratingsAverage,summary,difficulity";
  next();
};

// exports.getAllTours = async (req, res) => {
//   try {
//     //Query Chainning
//     // const tours = await Tour.find().where(property).equals(value)

//     //BUILD QUERY
//     //QUERY 1
//     // const queryObj = { ...req.query };
//     // const excludedFields = ["page", "sort", "limit", "fields"];
//     // excludedFields.forEach((el) => delete queryObj[el]);
//     // const query = Tour.find(queryObj);

//     //QUERY 2
//     // let queryStr = JSON.stringify(queryObj);
//     // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//     // const query = Tour.find(JSON.parse(queryStr));

//     // let query = Tour.find(JSON.parse(queryStr));
//     //returns a query

//     //SORT
//     // if (req.query.sort) {
//     //   const sortBy = req.query.sort.split(",").join(" ");
//     //   query = query.sort(sortBy);
//     // } else {
//     //   query = query.sort("-createdAt");
//     // }

//     //FIELD LIMITING
//     // if (req.query.fields) {
//     //   const fields = req.query.fields.split(",").join(" ");
//     //   query = query.select(fields);
//     // } else {
//     //   query = query.select("-__v");
//     //Or set the schema property{ select:false }
//     // }
//     // console.log(req.query);

//     //PAGINATION
//     // const page = req.query.page * 1 || 1;
//     // const limit = req.query.limit * 1 || 10;
//     // const skip = (page - 1) * limit;
//     // query = query.skip(skip).limit(limit);

//     // if (req.query.page) {
//     //   const numTours = await Tour.countDocuments();
//     //   if (skip > numTours) throw new Error("This Page Does Not Exist");
//     // }

//     //EXECUTE QUERY
//     // const tours = await query;
//     const features = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();
//     const tours = await features.query;

//     //SEND RESPOND
//     res.status(200).json({
//       status: "SUCCESS",
//       results: tours.length,
//       data: {
//         tours: tours,
//         //key:value
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: "FAIL",
//       message: err.message,
//     });
//   }
// };
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   //EXECUTE QUERY
//   // const tours = await query;
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   //SEND RESPOND
//   res.status(200).json({
//     status: "SUCCESS",
//     results: tours.length,
//     data: {
//       tours: tours,
//       //key:value
//     },
//   });
// });
exports.getAllTours = getAll(Tour);
// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate(
//     "reviews"
//   );
//   //using populate will execute another query
//   // .populate({
//   //   path: "guides",
//   //   select: "-__v -passwordChangedAt",
//   // });

//   // => Tour.findOne({_id:req.params.id})
//   if (!tour) {
//     return next(
//       new AppError("No Tour Found With The ID", 404)
//     );
//   }

//   res.status(200).json({
//     status: "SUCCESS",
//     data: {
//       tour: tour,
//     },
//   });
// });

exports.getTour = getOne(Tour, { path: "reviews" });

// exports.createTour = async (req, res) => {
//   try {
//     // const newTour = new Tour({})
//     // newTour.save()
//     const newTour = await Tour.create(req.body);

//     res.status(201).json({
//       status: "SUCCESS",
//       data: {
//         tour: newTour,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "Fail",
//       message: err.message,
//     });
//   }
// };

exports.createTour = createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: "SUCCESS",
//     data: {
//       tour: newTour,
//     },
//   });
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(
//     req.params.id,
//     req.body,
//     {
//       new: true,
//       //return the updated
//       runValidators: true,
//       //validate schema before update
//     }
//   );
//   if (!tour) {
//     return next(
//       new AppError("No Tour Found With The ID", 404)
//     );
//   }

//   res.status(200).json({
//     status: "SUCCESS",
//     data: {
//       tour: tour,
//     },
//   });
// });
exports.updateTour = updateOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(
//       new AppError("No Tour Found With The ID", 404)
//     );
//   }
//   res.status(204).json({
//     status: "Success",
//     data: null,
//   });
// });
exports.deleteTour = deleteOne(Tour);

exports.getTourStats = catchAsync(
  async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.0 } },
      },
      {
        $group: {
          // _id: null,
          _id: { $toUpper: "$difficulty" },
          // _id: "$ratingsAverage",
          numTours: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { avgPrice: -1 },
      },
      // {
      //   $match: { _id: { $ne: "EASY" } },
      // }, //Stages can be repeat
    ]);
    res.status(200).json({
      status: "SUCCESS",
      data: {
        stats,
      },
    });
  }
);

exports.getMonthlyPlan = catchAsync(
  async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numTourStarts: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 6,
      },
    ]);
    res.status(200).json({
      status: "SUCCESS",
      data: {
        results: plan.length,
        plan,
      },
    });
  }
);

exports.getTourWithin = catchAsync(
  async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");

    const radius =
      unit === "mi" ? distance / 3963.2 : distance / 6378.1;
    if (!lat || !lng)
      next(
        new AppError(
          "Please Provide Latitude And Longitude In The Format lat,lng",
          400
        )
      );
    const tours = await Tour.find({
      startLocation: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
    });
    res.status(200).json({
      status: "Success",
      results: tours.length,
      data: {
        data: tours,
      },
    });
  }
);

exports.getDistances = catchAsync(
  async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");

    const multiplier =
      unit === "mi" ? 0.000621371192 : 0.001;

    if (!lat || !lng)
      next(
        new AppError(
          "Please Provide Latitude And Longitude In The Format lat,lng",
          400
        )
      );
    const distances = await Tour.aggregate([
      {
        //only use $geoNear as the first stage of a pipeline.
        // $geoNear requires a geospatial index.
        //more than one geospatial index on the collection,
        //use the keys parameter to specify which field to use in the calculation.
        //For only one geospatial index,
        //$geoNearimplicitly uses the indexed field for the calculation.
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: "distance",
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);
    res.status(200).json({
      status: "Success",
      data: {
        data: distances,
      },
    });
  }
);
