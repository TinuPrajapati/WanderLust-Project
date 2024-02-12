const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
// Listing Home Page
module.exports.index=async (req, res) => {
    let allListing = await Listing.find();
    res.render("listings/index.ejs", { allListing });
};

// New Page for create new Listing
module.exports.renderNewForm=(req, res) => {
    res.render("listings/new1.ejs");
};

// show page
module.exports.showListing=async (req, res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate:{
                path:"author"
            }
        })
        .populate("owner");
    // sever side validation
    if (!listing) {
        req.flash("error", "your Listing request does not exist");
        return res.redirect("/listings");
    };
    res.render("listings/show.ejs", { listing });
};
// create listing sent to listings home page
module.exports.createListing= async (req, res, next) => {
    let {location,country}=req.body.listing;
    let response= await geocodingClient.forwardGeocode({
        query:`${location}`,
        limit: 1
      }).send();
    let url=req.file.path;
    let filename=req.file.filename;
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image={url,filename};
    newListing.geometry=response.body.features[0].geometry;
    let result=await newListing.save();
    console.log(result);
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};
// edit page for listing
module.exports.renderEditForm=async (req, res) => {
    let id = req.params.id;
    let listing = await Listing.findById(id);
    // sever side validation
    if (!listing) {
        req.flash("error", "Listing you request does not exist");
        return res.redirect("/listings");
    };

    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs", { listing,originalImageUrl });
};
// Update page for listing
module.exports.updateListing=async (req, res) => {
    let id = req.params.id;
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};
// delete request for listing
module.exports.destroyListing=async (req, res) => {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect(`/listings`);
};