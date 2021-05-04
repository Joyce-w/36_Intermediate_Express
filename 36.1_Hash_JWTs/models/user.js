const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config")
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
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES ($1, $2, $3, $4, $5, $6, current_timestamp)
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
    
    if (!result.rows[0]) {
      throw new ExpressError(`No such user: ${username}`, 404);
    }
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
      throw new ExpressError("This user does not exist", 404)
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

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT
      m.id,
      m.body,
      m.sent_at,
      m.read_at,
      m.from_username,
      u.username,
      u.first_name,
      u.last_name,
      u.phone
      FROM messages AS m
      JOIN users AS u ON m.from_username = u.username
      WHERE u.username = $1`,
      [username])
    if (result.rows.length === 0) {
      throw new ExpressError(`No messages to ${username}`, 400)
    }
    return result.rows.map(m => ({
      id: m.id,
      to_user: {
        username: m.username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.sent_at
    }))
  
  }
   

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */
  

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT
      m.id,
      m.body,
      m.sent_at,
      m.read_at,
      m.from_username,
      u.first_name,
      u.last_name,
      u.phone
      FROM messages AS m
      JOIN users AS u ON m.from_username = u.username
      WHERE to_username = $1`,
      [username])
    if (result.rows.length === 0) {
      throw new ExpressError(`No messages to ${username}`, 400)
    }
    return result.rows.map(m => ({
        id: m.id,
      from_user: {
        username: m.username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at
    }))
  }
  
  
}


module.exports = User;