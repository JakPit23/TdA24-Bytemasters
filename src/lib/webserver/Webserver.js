const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");
const expressSession = require("express-session");
const Logger = require("../Logger");
const Core = require("../Core");
const Config = require("../Config");

class Webserver {
    /**
     * 
     * @param {Core} core
     */
    constructor(core) {
        this.core = core;
        this.routers = {};
        this.middlewares = {};
        this.port = Config.getWebserverPort();

        this.app = express();

        this.app.set("view engine", "ejs");
        this.app.set("views", path.join(__dirname, "../../views"));

        this.app.disable("x-powered-by");
        this.app.use(expressSession({
            secret: Config.getSecretKey(),
            resave: false,
            saveUninitialized: false
        }));

        this.loadMiddlewares();
        this.loadRouters();
        
        this.app.use((req, res, next) => this.middlewares["RequestLog"].run(req, res, next));

        this.app.use("/public", express.static(path.join(__dirname, "../../public")));
        this.app.use("/", this.routers["WebRoute"].getRouter());

        this.app.use("/api", express.json());
        this.app.use("/api", this.routers["APIRoute"].getRouter());
        this.app.use("/api/lecturers", this.routers["LecturersAPIRoute"].getRouter());
        this.app.use("/api/auth", this.routers["APIAuthRoute"].getRouter());
        
        this.app.use((req, res, next) => this.middlewares["RouteNotFound"].run(req, res, next));
        this.app.use((error, req, res, next) => this.middlewares["ServerError"].run(error, req, res, next));

        this.webserver = http.createServer(this.app);
        this.webserver.listen(this.port, () => {
            Logger.info(Logger.Type.Webserver, `Webserver running on port ${this.port}`);
        });
    }

    async loadRouters() {
        Logger.info(Logger.Type.Webserver, "Loading routers...");

        for (const filePath of fs.readdirSync(path.resolve(__dirname, "./routers")).filter(file => file.endsWith(".js"))) {
            try {
                const router = new (require(`./routers/${filePath}`))(this.core);
                const fileName = path.parse(filePath).name;

                this.routers[fileName] = router;
                Logger.debug(Logger.Type.Webserver, `Loaded router ${Logger.Colors.Fg.Magenta}${fileName}${Logger.Colors.Reset}`);
            } catch (error) {
                Logger.error(Logger.Type.Webserver, `An unknown error occured while loading router "${filePath}":`, error);
            }
        }

        if (Object.keys(this.routers).length === 0) {
            Logger.warn(Logger.Type.Webserver, 'No routers loaded');
            return;
        }
        
        Logger.info(Logger.Type.Webserver, `${Logger.Colors.Fg.Magenta}${Object.keys(this.routers).length}${Logger.Colors.Reset} routers loaded`);
    }

    async loadMiddlewares() {
        Logger.info(Logger.Type.Webserver, "Loading middlewares...");

        for (const filePath of fs.readdirSync(path.resolve(__dirname, "./middlewares")).filter(file => file.endsWith(".js"))) {
            try {
                const middleware = new (require(`./middlewares/${filePath}`))(this.core);
                const fileName = path.parse(filePath).name;

                this.middlewares[fileName] = middleware;
                Logger.debug(Logger.Type.Webserver, `Loaded middleware ${Logger.Colors.Fg.Magenta}${fileName}${Logger.Colors.Reset}`);
            } catch (error) {
                Logger.error(Logger.Type.Webserver, `An unknown error occured while loading middleware "${filePath}":`, error);
            }
        }

        if (Object.keys(this.middlewares).length === 0) {
            Logger.warn(Logger.Type.Webserver, 'No middlewares loaded');
            return;
        }
        
        Logger.info(Logger.Type.Webserver, `${Logger.Colors.Fg.Magenta}${Object.keys(this.middlewares).length}${Logger.Colors.Reset} middlewares loaded`);
    }

    /**
     * @returns {Promise<void>}
     */
    shutdown = () => new Promise((resolve, reject) => {
        Logger.info(Logger.Type.Webserver, "Webserver shutting down...");

        this.webserver.close(() => {
            Logger.debug(Logger.Type.Webserver, "Webserver shutdown completed");
            resolve();
        });
    });
}

module.exports = Webserver;
