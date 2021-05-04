const express = require("express");
const router = new express.Router();
const User = require("../models/user")
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async (req, res, next) => {
    try {
        const { username, password } = req.body;
        let result = await User.authenticate(username, password);
        if (result) {
            const token = jwt.sign({ username }, SECRET_KEY);
            // update last logged in
            User.updateLoginTimestamp(username);
            return res.json({msg: "Logged in successfully", token})
        }
        throw new ExpressError("Invalid username or password", 400)
    } catch (e) {
        next(e)
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async (req, res, next) => {
    try {
        const { username, password, first_name, last_name, phone } = req.body;
        let user = await User.register(username, password, first_name, last_name, phone);
        if (user) {
            const token = jwt.sign({ username }, SECRET_KEY);
            // update last logged in
            User.updateLoginTimestamp(username);
            return res.json({ msg: "Logged in successfully", token })
        }
        
    } catch (e) {
        next(e)
    }
})


module.exports = router;
