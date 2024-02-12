const BetterSQLite = require("better-sqlite3");
const path = require("path");

class Database extends BetterSQLite {
    constructor() {
        super(path.join(__dirname, "../../data/database.sqlite"));

        this.createTables();
    }

    /**
     * @param {string} query
     * @param {Array} [params]
     * @returns {Object}
     */
    query = (query, params = []) => this.prepare(query).all(...params);

    /**
     * @param {string} statement
     * @param {Array} [params]
     * @returns {Object}
     */
    exec = (statement, params = [])  => this.prepare(statement).run(...params);

    // TODO: vylepsit u vsech tabulek ty datovy typy at vse nema text lol (chci spachat neziti)
    createTables() {
        this.exec("CREATE TABLE IF NOT EXISTS users (uuid VARCHAR(36), email TEXT, password TEXT, username TEXT, createdAt NUMBER)");

        this.exec("CREATE TABLE IF NOT EXISTS lecturers (uuid VARCHAR(36), title_before TEXT, first_name TEXT, middle_name TEXT, last_name TEXT, title_after TEXT, picture_url TEXT, location TEXT, claim TEXT, bio TEXT, tags TEXT, price_per_hour INTEGER, emails TEXT, telephone_numbers TEXT)");
        this.exec("CREATE TABLE IF NOT EXISTS tags (uuid VARCHAR(36), name TEXT)");
    }
}

module.exports = Database;