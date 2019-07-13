exports.notLoggedIn = function(req, res, next) {
    if (
        !req.session.userId &&
        req.url != "/welcome" &&
        req.url != "/login" &&
        req.url != "/about"
    ) {
        return res.redirect("/welcome");
    }
    next();
};

exports.requireSignature = function(req, res, next) {
    if (
        req.url != "/userinfo" &&
        req.url != "/about" &&
        !req.session.signId &&
        req.session.userId
    ) {
        return res.redirect("/signature");
    }
    next();
};

exports.loggedIn = (req, res, next) => {
    if (
        req.url != "/thank-you" &&
        req.url != "/about" &&
        req.url != "/signers" &&
        req.url != "/myprofile" &&
        req.session.signId
    ) {
        return res.redirect("/thankyou");
    }
    next();
};
