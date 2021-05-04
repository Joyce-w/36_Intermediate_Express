const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config")
const db = require("../db");
const jwt = require("jsonwebtoken");
const ExpressError = require("../expressError");

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

    /** All: basic info on all users:
     * [{username, first_name, last_name, phone}, ...] */
  
  static async all() {
    const results = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users;`
    )
    if (results.rows.length === 0) {
      throw new ExpressError("No user in database", 404)
    }
    return results;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */
  
  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users WHERE username=$1`,
      [username]
    )
    if (result.rows.length === 0) {
      throw new ExpressError("This user does not exist", 400)
    }
    return result;
  }

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