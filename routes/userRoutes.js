const express = require("express");

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} = require("../controllers/userController");
const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

//Protect Routes After This
router.use(protect);

router.patch("/updateMyPassword", updatePassword);
router.get("/me", getMe, getUser);
router.patch(
  "/updateMe",
  uploadUserPhoto,
  resizeUserPhoto,
  updateMe
);
router.delete("/deleteMe", deleteMe);

//Protect Routes After This For admin Access Only
router.use(restrictTo("admin"));
router.route("/").get(getAllUsers).post(createUser);

router
  .route("/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
