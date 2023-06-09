const multer = require("multer");
const sharp = require("sharp");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const {
  deleteOne,
  updateOne,
  getOne,
  getAll,
} = require("./handlerFactory");
const AppError = require("../utils/appError");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, "public/img/users");
//   },
//   filename: (req, file, callback) => {
//     const ext = file.mimetype.split("/")[1];
//     callback(
//       null,
//       `user-${req.user.id}-${Date.now()}.${ext}`
//     );
//   },
// });
const multerStorage = multer.memoryStorage();
//Image Stored As A "Buffer"

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

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(
  async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${
      req.user.id
    }-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.file.filename}`);

    next();
  }
);

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: "SUCCESS",
//     data: {
//       users,
//     },
//   });
// });

exports.getAllUsers = getAll(User);

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError("Cannot Update Password Here"),
      400
    );

  const filterBody = filterObj(req.body, "name", "email");
  if (req.file) filterBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filterBody,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    status: "Success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: "Success",
    data: null,
  });
});

exports.getUser = getOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "ERROR",
    message: "This Route Is Not Defined",
  });
};

//DO NOT UPDATE PASSWORD WITH THIS
exports.updateUser = updateOne(User);
exports.deleteUser = deleteOne(User);
