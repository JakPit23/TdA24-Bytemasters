const Configuration = require("./Configuration");
const Logger = require("./Logger");
const Tools = require("./utils/Tools");
const Webserver = require("./webserver/Webserver");

/**
 * The Core class is responsible for managing and initializing the application core components.
 * @class
 */
class Core {
    constructor() {
        this.config = new Configuration();

        // Log application startup information.
        Logger.info(Logger.Type.Core, `Starting application v${Tools.GetApplicationVersion()}`);

        // Initialize the Webserver component with configuration.
        this.webserver = new Webserver({
            config: this.config,
        });
    }

    /**
     * Asynchronously initiates the application shutdown process.
     * @public
     * @async
     */
    async shutdown() {
        // Log the start of the shutdown process.
        Logger.info(Logger.Type.Core, "Shutdown in progress...");

        // Set a timeout for a forced shutdown in case the graceful shutdown takes too long.
        const forceShutdownTimeout = setTimeout(() => {
            Logger.warn(Logger.Type.Core, "Failed to shutdown in-time. Exiting using force");
            process.exit(1);
        }, 15000);

        // Perform the shutdown of the Webserver component.
        await this.webserver.shutdown();

        // Clear the force shutdown timeout as the shutdown was successful.
        clearTimeout(forceShutdownTimeout);
    }
}

// Export the Core class for use in other modules.
module.exports = Core;
