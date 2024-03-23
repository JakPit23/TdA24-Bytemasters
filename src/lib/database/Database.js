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
            this.exec("CREATE TABLE IF NOT EXISTS activities (uuid VARCHAR(36), public INTEGER(1) DEFAULT 0, activityName VARCHAR(255), description TEXT, objectives TEXT, classStructure VARCHAR(50), lengthMin INTEGER, lengthMax INTEGER, edLevel TEXT, tools TEXT, homePreparation TEXT, instructions TEXT, agenda TEXT, links TEXT, gallery TEXT, shortDescription TEXT)");
        } catch (error) {
            return Logger.error(Logger.Type.Database, "An unknown error occured while creating tables:", error);
        }
    }
}

module.exports = Database;