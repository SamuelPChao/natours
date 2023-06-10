const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const { verify } = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Email = require("./../utils/email");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN *
          24 *
          60 *
          60 *
          1000
    ),
    // secure: true,
    //set secure to true so cookie will be sent on a encrypted connection (HTTPS)
    httpOnly: true,
    //set httpOnly to true so cookie cannot be accessed or modified in any way by the browser
  };
  // if (process.env.NODE_ENV === "production")
  //   cookieOptions.secure = true;

  //for proxy server https secure
  if (
    req.secure ||
    req.headers("x-forwarded-proto") === "https"
  )
    cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  //remove password from outputing
  user.password = undefined;

  res.status(statusCode).json({
    status: "Success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    // passwordChangedAt: Date.now(),
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get("host")}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new AppError(
        "Please Provide Valid Email And Password",
        400
      )
    );
  }

  const user = await User.findOne({
    email: email,
  }).select("+password");
  if (
    !user ||
    !(await user.correctPassword(password, user.password))
  ) {
    return next(
      new AppError("Invalid Email Or Password", 401)
    );
  }

  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  };
  res.cookie("jwt", "loggedout", cookieOptions);
  res.status(200).json({
    status: "Success",
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //Check And Get Token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    //Protect From Access The Route Without Token
    return next(new AppError("Not Authorized", 401));

  //Verify Token
  //jwt.verify is an asynchronous function with callback function as third argument
  //Promisify the function in case of blocking the code from executing
  //And Call the function with the (argument1, argument2)
  const decoded = await promisify(verify)(
    token,
    process.env.JWT_SECRET
  );

  //Protect From Token Issued Before User Deleted Or No Longer Exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "User Belonging To The Token No Longer Exist",
        401
      )
    );
  }

  //Protect From Using Token Issued Before Password Changed
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError("User Recently Changed Password", 401)
    );
  }

  //Assign The User Found In DB With The Token To The Request For Later Use
  req.user = currentUser;
  res.locals.user = currentUser;
  //Grant Access To Protected Route => next()
  next();
});

//For Rendering Pages
// exports.isLoggedIn = catchAsync(async (req, res, next) => {
//   if (req.cookies.jwt) {
//     //Verifies Token
//     const decoded = await promisify(verify)(
//       req.cookies.jwt,
//       process.env.JWT_SECRET
//     );

//     const currentUser = await User.findById(decoded.id);
//     if (!currentUser) {
//       return next();
//     }

//     if (currentUser.changePasswordAfter(decoded.iat)) {
//       return next();
//     }

//     res.locals.user = currentUser;
//     return next();
//   }
//   next();
// });

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //Verifies Token
      const decoded = await promisify(verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      if (currentUser.changePasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      console.log(err);
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  //Use Wrapper Function To Wrap Middleware Function
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("Not Authorized To The Action"),
        403
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    // console.log(req.body);
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user)
      return next(
        new AppError("No User Found With The Email"),
        404
      );

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // const resetURL = `${req.protocol}://${req.get(
    //   "host"
    // )}/api/v1/users/resetPassword/${resetToken}`;

    // const message = `Click On ${resetURL} To Reset Password`;

    try {
      const resetURL = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/resetPassword/${resetToken}`;
      await new Email(user, resetURL).sendPasswordReset();

      //NOTE
      // await sendEmail({
      //   email: user.email,
      //   subject:
      //     "Password Reset Token (Expires In 10 Minutes)",
      //   message: message,
      // });

      res.status(200).json({
        status: "Success",
        message: "Token Sent To Email",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError("Error Occurs When Sending Email", 500)
      );
    }
  }
);

exports.resetPassword = catchAsync(
  async (req, res, next) => {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new AppError("Token Invalid Or Expired", 400)
      );
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, req, res);
  }
);

exports.updatePassword = catchAsync(
  async (req, res, next) => {
    const user = await User.findById(req.user.id).select(
      "+password"
    );
    console.log(req.body.passwordCurrent);
    if (
      !(await user.correctPassword(
        req.body.passwordCurrent,
        user.password
      ))
    ) {
      return next(
        new AppError("Current Password Is Wrong", 401)
      );
    }

    const { password, passwordConfirm } = req.body;
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    createSendToken(user, 200, req, res);
  }
);
