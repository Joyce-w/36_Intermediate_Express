const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config")
const db = require("../db");
const jwt = require("jsonwebtoken");

/** User class for message.ly */



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register(un, pw, f_name, l_name, phone_num) {
    // hash the pw 
    let hashedPassword = await bcrypt.hash(pw, BCRYPT_WORK_FACTOR);
    // create a timestamp for join_at
    let timestamp = new Date();
    // save to db
    const results = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING username, password, first_name, last_name, phone`,
      [un, hashedPassword, f_name, l_name, phone_num, timestamp])
    console.log(results.rows[0])
    return results.rows[0]
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    // search username in db
    const result = await db.query(`
    SELECT username, password FROM users
    WHERE username = $1
    `, [username])
    const user = result.rows[0];

    // if a user is found, compare pw
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        return true
      }
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {

    /** All: basic info on all users:
     * [{username, first_name, last_name, phone}, ...] */
    // make new timestamp
    const last_logged_in = new Date();
    // Add last logged in, into db 
    const result = await db.query(
      `UPDATE users SET last_login_at = $1
      WHERE username = $2
      RETURNING username, first_name, last_name, phone, last_login_at`,
      [last_logged_in, username]);
    return result
  }

  static async all() { }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}


module.exports = User;