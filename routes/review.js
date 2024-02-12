const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync");
const {validateReview, isLoggedIn, isReviewAuthor}=require("../middleware.js");
const reviewControllers=require("../controllers/reviews.js");

//ADD Review Post in Show Route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewControllers.createReview));

router.get("/:reviewId/edit",isLoggedIn,isReviewAuthor,wrapAsync(reviewControllers.editReview))

// DELETE Post Review Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewControllers.destroyReview));

module.exports=router;