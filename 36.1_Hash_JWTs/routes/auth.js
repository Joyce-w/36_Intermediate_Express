const { Router } = require("express")
const router = new Router();
const { User } = require("../models/user")
const jwt = require("jsonwebtoken")

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

Router.post("/register", async (req, res, next) => {
    try {
        const { username, password, first_name, last_name, phone } = req.body;
        let user = await User.register(username, password, first_name, last_name, phone);
        return res.json(user)        
    } catch (e) {
        next(e)
    }

})