const http = require("http");
const express = require("express");
const ApiRouter = require("./ApiRouter");
const Logger = require("../Logger");
const path = require("path");
const WebRouter = require("./WebRouter");

/**
 * The Webserver class is responsible for setting up and managing the application's web server.
 * @class
 */
class Webserver {
    /**
     * Create a new Webserver instance with the provided configuration options.
     * @constructor
     * @param {object} options - Configuration options for the Webserver.
     * @param {import("../Configuration")} options.config - The application's configuration.
     */
    constructor(options) {
        this.port = options.config.GetWebserverPort();

        this.app = express();
        this.app.use(express.json());

        // Disable "x-powered-by" header for security.
        this.app.disable("x-powered-by");

        this.apiRouter = new ApiRouter();
        this.app.use("/api", this.apiRouter.getRouter());

        // Serve static files from the "/public" directory.
        this.app.use("/public", express.static(path.join(__dirname, "../../public")));

        this.webRouter = new WebRouter();
        this.app.use("/", this.webRouter.getRouter());

        // Create an HTTP server based on the Express app.
        this.webserver = http.createServer(this.app);

        // Start the webserver and log the port it's listening on.
        this.webserver.listen(this.port, () => {
            Logger.info(Logger.Type.Webserver, `Webserver running on port ${this.port}`);
        });
    }

    /**
     * Shutdown the web server gracefully.
     * @public
     * @returns {Promise<void>}
     */
    shutdown() {
        return new Promise((resolve, reject) => {
            Logger.debug("Webserver shutdown in progress...");

            // Close the server to stop accepting new connections.
            this.webserver.close(() => {
                Logger.debug("Webserver shutdown completed.");
                resolve();
            });
        });
    }
}

// Export the Webserver class for use in other modules.
module.exports = Webserver;
