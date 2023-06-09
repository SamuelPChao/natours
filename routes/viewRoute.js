const express = require("express");
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
  getMyTours,
} = require("../controllers/viewController");
const {
  protect,
  isLoggedIn,
} = require("../controllers/authController");
const {
  createBookingCheckout,
} = require("../controllers/bookingController");

const router = express.Router();

// router.get("/", (req, res) => {
//   res.status(200).render("base", {
//     tour: "The Forest Hiker",
//     user: "Samuel",
//   });
// });

// router.use(isLoggedIn);

router.get(
  "/",
  createBookingCheckout,
  isLoggedIn,
  getOverview
);

router.get("/tours/:slug", isLoggedIn, getTour);
router.get("/login", isLoggedIn, getLoginForm);
router.get("/me", protect, getAccount);
router.get("/my-tours", protect, getMyTours);

router.post("/submit-user-data", protect, updateUserData);

module.exports = router;
