const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");
const Logger = require("../Logger");
const Core = require("../Core");

class Webserver {
    /**
     * 
     * @param {Core} core
     */
    constructor(core) {
        this.core = core;
        this.routers = {};
        this.middlewares = {};
        this.port = this.core.getConfig().getWebserverPort();

        this.app = express();
        this.app.use(express.json());

        this.app.disable("x-powered-by");

        this.loadRouters();
        this.loadMiddlewares();
        
        this.app.use("/public", express.static(path.join(__dirname, "../../public")));

        this.app.use("/api/lecturers", this.routers["LecturersAPIRoute"].getRouter());
        this.app.use("/api", this.routers["APIRoute"].getRouter());
        this.app.use("/", this.routers["WebRoute"].getRouter());
        
        this.app.use((req, res, next) => this.middlewares["RouteNotFound"].run(req, res, next));
        this.app.use((error, req, res, next) => this.middlewares["ServerError"].run(error, req, res, next));

        this.webserver = http.createServer(this.app);
        this.webserver.listen(this.port, () => {
            this.core.getLogger().info(Logger.Type.Webserver, `Webserver running on port ${this.port}`);
        });
    }

    async loadRouters() {
        this.core.getLogger().debug(Logger.Type.Webserver, "Registering routers..");

        for (const filePath of fs.readdirSync(path.resolve(__dirname, "./routers")).filter(file => file.endsWith(".js"))) {
            const router = require(`./routers/${filePath}`);

            try {
                const Router = new router(this.core);

                const name = filePath.replace(".js", "");
                this.routers[name] = Router;
                this.core.getLogger().debug(Logger.Type.Webserver, `Router "${name}" registered successfully.`);
            } catch (error) {
                this.core.getLogger().error(Logger.Type.Webserver, `Failed to register router. Error:`, error);
            }
        }

        this.core.getLogger().info(Logger.Type.Webserver, "Routers registered successfully.");
    }

    async loadMiddlewares() {
        this.core.getLogger().info(Logger.Type.Webserver, "Registering middlewares..");

        for (const filePath of fs.readdirSync(path.resolve(__dirname, "./middlewares")).filter(file => file.endsWith(".js"))) {
            const middleware = require(`./middlewares/${filePath}`);

            try {
                const Middleware = new middleware(this.core);

                const name = filePath.replace(".js", "");
                this.middlewares[name] = Middleware;
                this.core.getLogger().debug(Logger.Type.Webserver, `Middleware "${name}" registered successfully.`);
            } catch (error) {
                this.core.getLogger().error(Logger.Type.Webserver, `Failed to register middleware "${middleware.name}". Error: ${error.message}`);
            }
        }

        this.core.getLogger().info(Logger.Type.Webserver, "Middlewares registered successfully.");
    }

    /**
     * 
     * @returns {Promise<void>}
     */
    shutdown = () => new Promise((resolve, reject) => {
        this.core.getLogger().debug(Logger.Type.Webserver, "Webserver shutdown in progress...");

        this.webserver.close(() => {
            this.core.getLogger().debug(Logger.Type.Webserver, "Webserver shutdown completed.");
            resolve();
        });
    });
}

module.exports = Webserver;
