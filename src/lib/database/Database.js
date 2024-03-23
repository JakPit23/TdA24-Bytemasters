const BetterSQLite = require("better-sqlite3");
const path = require("path");
const Logger = require("../Logger");

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
    exec = (statement, params = [])  => {
        if (params.constructor === Object) {
            return this.prepare(statement).run(params);
        }

        return this.prepare(statement).run(...params);
    };

    createTables = () => {
        try {
            Logger.debug(Logger.Type.Database, "Creating tables...");
            this.exec("CREATE TABLE IF NOT EXISTS users (uuid VARCHAR(36), type INTEGER(1) DEFAULT 0, email VARCHAR(254), password BINARY(60), username VARCHAR(32), createdAt NUMBER)");
            this.exec("CREATE TABLE IF NOT EXISTS lecturers (uuid VARCHAR(36), title_before VARCHAR(32), first_name VARCHAR(32), middle_name VARCHAR(32), last_name VARCHAR(32), title_after VARCHAR(32), picture_url VARCHAR(256), location VARCHAR(128), claim VARCHAR(256), bio VARCHAR(4000), price_per_hour INTEGER, emails VARCHAR, telephone_numbers VARCHAR, tags VARCHAR, appointments VARCHAR)");
            this.exec("CREATE TABLE IF NOT EXISTS tags (uuid VARCHAR(36), name VARCHAR(48))");
            this.exec("CREATE TABLE IF NOT EXISTS appointments (uuid VARCHAR(36), start NUMBER, end NUMBER, firstName VARCHAR(32), lastName VARCHAR(32), location VARCHAR(128), email VARCHAR(254), phoneNumber VARCHAR(15), message VARCHAR(500))");
            this.exec("CREATE TABLE IF NOT EXISTS activities (uuid VARCHAR(36), public BOOLEAN DEFAULT 0, activityName VARCHAR(255), description TEXT, objectives TEXT, classStructure VARCHAR(50), lengthMin INTEGER, lengthMax INTEGER, edLevel TEXT, tools TEXT, homePreparation TEXT, instructions TEXT, agenda TEXT, links TEXT, gallery TEXT)");
        } catch (error) {
            return Logger.error(Logger.Type.Database, "An unknown error occured while creating tables:", error);
        }
    }
}

module.exports = Database;