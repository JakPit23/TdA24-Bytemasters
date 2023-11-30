const fs = require("fs");
const path = require("path");
const Configuration = require("./Configuration");
const Logger = require("./Logger");
const Database = require("./database/Database");
const LecturerManager = require("./lecturer/LecturerManager");
const Tools = require("./utils/Tools");
const Webserver = require("./webserver/Webserver");
const TagManager = require("./lecturer/TagManager");

class Core {
    constructor() {
        Logger.info(Logger.Type.Core, `Starting application v${Tools.GetApplicationVersion()}`);
        if (!fs.existsSync(path.resolve(__dirname, "../data"))) {
            Logger.info(Logger.Type.Core, `Creating data directory`);
            fs.mkdirSync(path.resolve(__dirname, "../data"));
        }
        
        this.config = new Configuration();
        this.database = new Database();
        this.lecturerManager = new LecturerManager(this);
        this.tagManager = new TagManager(this);
        this.webserver = new Webserver(this);
    }

    /**
     * Gets the configuration object.
     * @returns {Configuration} The configuration object.
     */
    getConfig = () => this.config;

    /**
     * Gets the database object.
     * @returns {Database} The database object.
     */
    getDatabase = () => this.database;

    /**
     * Gets the webserver object.
     * @returns {Webserver} The webserver object.
     */
    getWebserver = () => this.webserver;

    /**
     * Gets the lecturer manager object.
     * @returns {LecturerManager} The lecturer manager object.
     */
    getLecturerManager = () => this.lecturerManager;

    /**
     * Gets the tag manager object.
     * @returns {TagManager} The tag manager object.
     */
    getTagManager = () => this.tagManager;

    /**
     * Asynchronously initiates the application shutdown process.
     * @async
     */
    async shutdown() {
        Logger.info(Logger.Type.Core, "Shutdown in progress...");

        // Set a timeout for a forced shutdown in case the graceful shutdown takes too long.
        const forceShutdownTimeout = setTimeout(() => {
            Logger.warn(Logger.Type.Core, "Failed to shutdown in-time. Exiting using force");
            process.exit(1);
        }, 15000);

        this.database.close();
        
        await this.webserver.shutdown();

        // Clear the force shutdown timeout as the shutdown was successful.
        clearTimeout(forceShutdownTimeout);
    }
}

module.exports = Core;