const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview=async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    let newReview= new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);
    // console.log(newReview);
    await newReview.save();
    await listing.save();
    // console.log("reviews saved");
    req.flash("success","New Review Created");
    res.redirect(`/listings/${id}`);
};

module.exports.editReview=async(req,res)=>{
    let {id,reviewId}=req.params;
    let review=await Review.findById(reviewId);
    req.flash("success","Review Deleted");
    res.redirect("listings/show.ejs", {review});
};
module.exports.destroyReview=async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted");
    res.redirect(`/listings/${id}`);
};