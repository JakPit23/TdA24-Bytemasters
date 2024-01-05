const BetterSQLite = require("better-sqlite3");
const path = require("path");

class Database extends BetterSQLite {
    constructor() {
        super(path.join(__dirname, "../../data/database.sqlite"));

        this.createTables();
    }

    /**
     * Executes a SQL query with parameters and returns the result.
     * @param {string} query - The SQL query to execute.
     * @param {Array} [params] - The parameters to bind to the query (optional).
     * @returns {Object} The result of the query.
     */
    query = (query, params = []) => this.prepare(query).all(...params);

    /**
     * Executes a non-query SQL statement (e.g., CREATE TABLE, INSERT, UPDATE, DELETE).
     * @param {string} statement - The SQL statement to execute.
     * @param {Array} [params] - The parameters to bind to the statement (optional).
     * @returns {Object} The result of the execution.
     */
    exec = (statement, params = [])  => this.prepare(statement).run(...params);

    createTables() {
        this.exec("CREATE TABLE IF NOT EXISTS lecturers (uuid VARCHAR(36), title_before TEXT, first_name TEXT, middle_name TEXT, last_name TEXT, title_after TEXT, picture_url TEXT, location TEXT, claim TEXT, bio TEXT, tags TEXT, price_per_hour INTEGER, emails TEXT, telephone_numbers TEXT)");
        this.exec("CREATE TABLE IF NOT EXISTS tags (uuid VARCHAR(36), name TEXT)");
    }
}

module.exports = Database;