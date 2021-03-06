const express = require("express");
const router = new express.Router();
const Message = require("../models/message")
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { ensureLoggedIn, authenticateJWT } = require("../middleware/auth")

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", authenticateJWT, async (req, res, next) => {
    try {
        const result = await Message.get(req.params.id);
        const { id, body, sent_at, read_at, from_user, to_user } = result;
        return res.json({
            message:
            {
                id,
                body,
                sent_at,
                read_at,
                from_user,
                to_user
            }
        })        
    } catch (e) {
        next(e)
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async (req, res, next) => {
    try {
        const result = await Message.create(req.body);
        return res.json({message: { result }})        
    } catch (e) {
        next(e)
    }

})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", async (req, res, next) => {
    try {
        const result = await Message.markRead(req.params.id);
        return res.json({message: result })        
    } catch (e) {
        next(e)
    }
});

module.exports = router;