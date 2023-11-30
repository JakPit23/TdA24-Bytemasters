const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");
const Logger = require("../Logger");
const Core = require("../Core");
const Router = require("./Router");

class Webserver {
    /**
     * Create a new Webserver instance
     * @constructor
     * @param {Core} core - The application core.
     */
    constructor(core) {
        this.core = core;
        this.routes = {};
        this.middlewares = {};
        this.port = this.core.getConfig().getWebserverPort();

        this.app = express();
        this.app.use(express.json());

        this.app.disable("x-powered-by");

        this.loadRoutes();
        this.loadMiddlewares();
        
        // Serve static files from the "/public" directory.
        this.app.use("/public", express.static(path.join(__dirname, "../../public")));

        this.app.all("/api/lecturers/*", (req, res, next) => Router(this.routes["LecturersAPIRoute"], req, res, next));
        this.app.all("/api/*", (req, res, next) => Router(this.routes["APIRoute"], req, res, next));
        this.app.all("/*", (req, res, next) => Router(this.routes["WebRoute"], req, res, next));
        
        this.app.use((req, res, next) => this.middlewares["RouteNotFound"].run(req, res, next));
        this.app.use((error, req, res, next) => this.middlewares["ServerError"].run(error, req, res, next));

        this.webserver = http.createServer(this.app);
        this.webserver.listen(this.port, () => {
            this.core.getLogger().info(Logger.Type.Webserver, `Webserver running on port ${this.port}`);
        });
    }

    async loadRoutes() {
        this.core.getLogger().debug(Logger.Type.Webserver, "Registering routes..");

        for (const filePath of fs.readdirSync(path.resolve(__dirname, "./routes")).filter(file => file.endsWith(".js"))) {
            const route = require(`./routes/${filePath}`);
            try {
                const Route = new route(this.core);

                const name = filePath.replace(".js", "");
                this.routes[name] = new Map();

                for (const route of Route.getRoutes()) {
                    route.path = filePath;
                    this.routes[name].set(`${route.route}_${route.method}`, route);
                }
            } catch (error) {
                this.core.getLogger().error(Logger.Type.Webserver, `Failed to register route. Error:`, error);
            }
        }

        this.core.getLogger().info(Logger.Type.Webserver, "Routes registered successfully.");
    }

    reloadRoutes() {
        try {
            this.core.getLogger().info(Logger.Type.Webserver, "Reloading routes...");

            for (const route in this.routes) {
                try {
                    delete require.cache[require.resolve(`./routes/${route}.js`)];
                    delete this.routes[route];
                    this.core.getLogger().debug(Logger.Type.Webserver, `Route "${route}" cleared`);
                } catch (error){
                    this.core.getLogger().error(Logger.Type.Webserver, `Failed to clear route "${route}"`, error);
                }
            }
        } catch (error) {
            this.core.getLogger().error(Logger.Type.Webserver, "Failed to reload routes", error);
        } finally {
            this.loadRoutes();
        }
    }

    async loadMiddlewares() {
        this.core.getLogger().info(Logger.Type.Webserver, "Registering middlewares..");

        for (const filePath of fs.readdirSync(path.resolve(__dirname, "./middlewares")).filter(file => file.endsWith(".js"))) {
            const middleware = require(`./middlewares/${filePath}`);
            try {
                const Middleware = new middleware(this.core);

                const name = filePath.replace(".js", "");
                this.middlewares[name] = Middleware;
            } catch (error) {
                this.core.getLogger().error(Logger.Type.Webserver, `Failed to register middleware "${middleware.name}". Error: ${error.message}`);
            }
        }

        this.core.getLogger().info(Logger.Type.Webserver, "Middlewares registered successfully.");
    }

    /**
     * Shutdown the web server gracefully.
     * @returns {Promise<void>}
     */
    shutdown = () => new Promise((resolve, reject) => {
        this.core.getLogger().debug(Logger.Type.Webserver, "Webserver shutdown in progress...");

        // Close the server to stop accepting new connections.
        this.webserver.close(() => {
            this.core.getLogger().debug(Logger.Type.Webserver, "Webserver shutdown completed.");
            resolve();
        });
    });
}

module.exports = Webserver;
