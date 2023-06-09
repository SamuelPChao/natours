const express = require("express");
// const tourController = require('../controllers/tourController');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getTourWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} = require("../controllers/tourController");

const {
  protect,
  restrictTo,
} = require("../controllers/authController");

const reviewRouter = require("./reviewRoutes");
// const {
//   getAllReviews,
//   createReview,
// } = require("./../controllers/reviewController");

const router = express.Router();

// Implement Review Router In
// router
//   .route("/:tourId/reviews")
//   .post(protect, restrictTo("user"), createReview)
//   .get(getAllReviews);
router.use("/:tourId/reviews", reviewRouter);

// router.param('id', checkID);

router.route("/top5-tour").get(aliasTopTours, getAllTours);
router.route("/tour-stats").get(getTourStats);
router
  .route("/monthly-plan/:year")
  .get(
    protect,
    restrictTo("admin", "lead-guide"),
    getMonthlyPlan
  );

router
  .route("/tours-within/:distance/center/:latlng/:unit")
  .get(getTourWithin);

router
  .route("/distances/:latlng/unit/:unit")
  .get(getDistances);

router
  .route("/")
  .get(getAllTours)
  .post(
    protect,
    restrictTo("admin", "lead-guide"),
    createTour
  );
router
  .route("/:id")
  .get(getTour)
  .patch(
    protect,
    restrictTo("admin", "lead-guide"),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(
    protect,
    restrictTo("admin", "lead-guide"),
    deleteTour
  );

module.exports = router;
