const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const { listingSchema,reviewSchema } = require("./Schema.js")

module.exports.isLoggedIn=(req,res,next)=>{
    // console.log(req.originalUrl);
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be login first,then try");
        return res.redirect("/login");
    };
    next();
};

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    };
    next();
};

module.exports.isOwner=async (req,res,next)=>{
    let id = req.params.id;
    let listing = await Listing.findById(id);
    // console.log(currUser);
    if (! listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "Changes Only by Owner");
        return res.redirect(`/listings/${id}`);
    };
    next();
};

// Sever-Side Validation middleware
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    // console.log(result);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    // console.log(result);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    };
};

module.exports.isReviewAuthor=async (req,res,next)=>{
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    // console.log(currUser);
    if (! review.author._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not original author");
        return res.redirect(`/listings/${id}`);
    };
    next();
};