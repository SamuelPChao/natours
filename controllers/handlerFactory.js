const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(
      req.params.id
    );
    if (!doc) {
      return next(
        new AppError("No Document Found With The ID", 404)
      );
    }
    res.status(204).json({
      status: "Success",
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        //return the updated
        runValidators: true,
        //validate schema before update
      }
    );
    if (!doc) {
      return next(
        new AppError("No Document Found With The ID", 404)
      );
    }

    res.status(200).json({
      status: "SUCCESS",
      data: {
        doc: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "SUCCESS",
      data: {
        doc: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions)
      query = Model.findById(req.params.id).populate(
        popOptions
      );
    const doc = await query;

    if (!doc) {
      return next(
        new AppError("No Document Found With The ID", 404)
      );
    }

    res.status(200).json({
      status: "SUCCESS",
      data: {
        doc: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To Allow For Nested Get Reviews On Tour
    let filter = {};
    if (req.params.tourId)
      filter = { tour: req.params.tourId };

    const features = new APIFeatures(
      Model.find(filter),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    // Using .explain() To Examine The Query Execution Status
    // const doc = await features.query.explain();

    //SEND RESPOND
    res.status(200).json({
      status: "SUCCESS",
      results: doc.length,
      data: {
        doc: doc,
        //key:value
      },
    });
  });
