const http = require("http");
const express = require("express");
const ApiRouter = require("./ApiRouter");
const Logger = require("../Logger");
const path = require("path");
const WebRouter = require("./WebRouter");
const Core = require("../Core");

class Webserver {
    /**
     * Create a new Webserver instance
     * @constructor
     * @param {Core} core - The application core.
     */
    constructor(core) {
        this.core = core;
        this.port = this.core.getConfig().GetWebserverPort();

        this.app = express();
        this.app.use(express.json());

        this.app.disable("x-powered-by");

        this.apiRouter = new ApiRouter(this.core);
        this.app.use("/api", this.apiRouter.getRouter());

        // Serve static files from the "/public" directory.
        this.app.use("/public", express.static(path.join(__dirname, "../../public")));

        this.webRouter = new WebRouter();
        this.app.use("/", this.webRouter.getRouter());

        // Error handler
        this.app.use((error, req, res, next) => {
            if (req.path.startsWith("/api")) {
                if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
                    res.status(400).send({ code: 400, message: "Invalid request body" });
                    return;
                }

                Logger.error(Logger.Type.Webserver, error.stack);
                res.status(500).json({ code: 500, error: "Server error" });
                return;
            }
            
            Logger.error(Logger.Type.Webserver, error.stack);
            // TODO: Make a 505 error page
            res.status(500).send('Server error');
        })

        this.webserver = http.createServer(this.app);

        this.webserver.listen(this.port, () => {
            Logger.info(Logger.Type.Webserver, `Webserver running on port ${this.port}`);
        });
    }

    /**
     * Shutdown the web server gracefully.
     * @returns {Promise<void>}
     */
    shutdown = () => new Promise((resolve, reject) => {
        Logger.debug("Webserver shutdown in progress...");

        // Close the server to stop accepting new connections.
        this.webserver.close(() => {
            Logger.debug("Webserver shutdown completed.");
            resolve();
        });
    });
}

module.exports = Webserver;
