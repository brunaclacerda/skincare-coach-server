import User from "../user/user.model.js";

export default async function auth(req, res, next) {
    if (!req.session.passport || !req.session.passport.user)
        return next(new Error("Please authenticate!"));

    const user = req.session.passport.user.id
        ? await User.findById(req.session.passport.user.id)
        : null;

    if (!user) {
        return next(new Error("Please authenticate!"));
    }
    req.user = user._id;
    next();
}
