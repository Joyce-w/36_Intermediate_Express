const express = require("express");
const router = new express.Router();
const User = require("../models/user")
const { ensureLoggedIn, ensureCorrectUser, authenticateJWT } = require("../middleware/auth")

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        const results = await User.all();
        return res.json(results.rows)
    } catch (e) {
        next(e)
    }
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureCorrectUser, async (req, res, next) => {
    try {
        let result = await User.get(req.params.username);
        if (result) {
            return res.json(result.rows[0]);
        } 
    } catch (e) {
        next(e)
    }
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to",ensureCorrectUser, async (req, res, next) => {
    try {
        const { username } = req.params;
        const result = await User.messagesTo(username);
        return res.json({messages: result})
    } catch (e) {
        next(e)
    }
})

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from",ensureCorrectUser, async (req, res, next) => {
    try {
        const { username } = req.params;
        const result = await User.messagesFrom(username);
        return res.json({messages: result})
    } catch (e) {
        next(e)
    }
})


module.exports = router;