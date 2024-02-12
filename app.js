if(process.env.NODE_ENV!="production"){
require('dotenv').config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session =require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/User");
const Review = require("./models/review");
const listingsRouter=require("./routes/listing");
const reviewsRouter=require("./routes/review");
const userRouter=require("./routes/user");

// ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// css & js
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
// method-override
app.use(methodOverride('_method'));
// url encoded
app.use(express.urlencoded({ extended: true }));
// ejs-mate
app.engine("ejs", ejsMate);

// Database
// const MONGO_Url="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl)
}

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

// home route
// app.get("/", (req, res) => {
//     res.send("Hi, I am root");
// });

// Session 
const store=MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter:24 * 3600 ,
});

store.on("error",()=>{
    console.log("Error come in Mongo:",err);
});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        exprires: Date.now()+ 7 * 24 * 60 * 60 * 1000,
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

// Middleware
app.all("*",(req,res,next)=>{
   next( new ExpressError(400,"Page not Found"));
});

app.use((err, req, res, next) => {
    let {statusCode=500,message="Something went wrong"}=err;
    res.status(statusCode).render("listings/error.ejs",{message});
});

// Port 
app.listen(8080, () => {
    console.log("Listening on Port:8080");
});