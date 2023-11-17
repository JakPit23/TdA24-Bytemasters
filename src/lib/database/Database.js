const BetterSQLite = require("better-sqlite3");
const path = require("path");

class Database extends BetterSQLite {
    constructor() {
        super(path.join(__dirname, "../../data/database.sqlite"));
    }
}

module.exports = Database;