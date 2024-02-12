const User = require("../models/User.js");

module.exports.renderSignUpForm=(req, res) => {
    res.render("user/signup.ejs");
}

module.exports.signUp=async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        let registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            };
            req.flash("success", "User Registration Successfully");
            res.redirect("/listings");
        })
    } catch (err) {
        req.flash("error", err.message);
        console.log(err);
        res.redirect("/signup");
    };
};

module.exports.renderLoginForm=(req, res) => {
    res.render("user/login.ejs");
};

module.exports.login=(req, res) => {
    req.flash("success", "Welcome back to WanderLust");
    let redirect=res.locals.redirectUrl||"/listings";
    res.redirect(redirect);
};

module.exports.logout=(req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        };
        req.flash("success", "You are Logged out");
        res.redirect("/listings");
    });
};