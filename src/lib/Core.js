const fs = require("fs");
const path = require("path");
const Logger = require("./Logger");
const Database = require("./database/Database");
const Webserver = require("./webserver/Webserver");
const TagManager = require("./managers/TagManager");
const EmailClient = require("./managers/EmailClient");
const UserManager = require("./managers/UserManager");
const AppointmentManager = require("./managers/AppointmentManager");
const OpenAIManager = require("./managers/OpenAIManager");

class Core {
    constructor() {
        Logger.info(Logger.Type.Core, `Starting application...`);

        if (!fs.existsSync(path.resolve(__dirname, "../data"))) {
            Logger.info(Logger.Type.Core, `Creating data directory`);
            fs.mkdirSync(path.resolve(__dirname, "../data"));
        }
        
        this.database = new Database();
        this.userManager = new UserManager(this);
        this.tagManager = new TagManager(this);
        this.appointmentManager = new AppointmentManager(this);
        this.emailClient = new EmailClient(this);
        this.openAIManager = new OpenAIManager(this);
        this.webserver = new Webserver(this);
    }

    getDatabase = () => this.database;
    getWebserver = () => this.webserver;
    getUserManager = () => this.userManager;
    getTagManager = () => this.tagManager;
    getAppointmentManager = () => this.appointmentManager;
    getOpenAIManager = () => this.openAIManager;
    getEmailClient = () => this.emailClient;

    async shutdown() {
        Logger.info(Logger.Type.Core, "Shutdown in progress...");

        // Set a timeout for a forced shutdown in case the graceful shutdown takes too long.
        const forceShutdownTimeout = setTimeout(() => {
            Logger.warn(Logger.Type.Core, "Failed to shutdown in-time. Exiting using force");
            process.exit(1);
        }, 15000);

        await this.webserver.shutdown();
        await this.userManager.shutdown();
        this.database.close();

        // Clear the force shutdown timeout as the shutdown was successful.
        clearTimeout(forceShutdownTimeout);
    }
}

module.exports = new Core();