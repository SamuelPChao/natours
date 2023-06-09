const express = require("express");
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require("../controllers/reviewController");
const {
  protect,
  restrictTo,
} = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

//POST /tours/:tourId/reviews
//POST /reviews

router.use(protect);

router
  .route("/")
  .get(getAllReviews)
  .post(
    setTourUserIds,
    restrictTo("user", "admin"),
    createReview
  );

router
  .route("/:id")
  .get(getReview)
  .patch(restrictTo("user", "admin"), updateReview)
  .delete(restrictTo("user", "admin"), deleteReview);

module.exports = router;
