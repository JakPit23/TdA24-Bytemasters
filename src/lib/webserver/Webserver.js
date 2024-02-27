const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");
const expressSession = require("express-session");
const betterSqlite = require("better-sqlite3");
const sessionSqliteStore = require("better-sqlite3-session-store")(expressSession);
const Logger = require("../Logger");
const Config = require("../Config");

class Webserver {
    /**
     * @param {import("../Core")} core
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
            saveUninitialized: false,
            store: new sessionSqliteStore({
                client: new betterSqlite(path.join(__dirname, "../../data/sessions.db")),
                expired: {
                    clear: true,
                    intervalMs: 900000 //ms = 15min
                }
            }),
        }));

        this.loadMiddlewares();
        this.loadRouters();

        this.app.use("/api", express.json());
        this.app.use((req, res, next) => this.middlewares["RequestLog"].run(req, res, next));

        this.app.use("/public", express.static(path.join(__dirname, "../../public")));
        this.app.use("/", this.routers["WebRoute"].router);

        this.app.use("/api", this.routers["APIRoute"].router);
        this.app.use("/api/lecturers", this.routers["APILecturersRoute"].router);
        this.app.use("/api/auth", this.routers["APIAuthRoute"].router);

        this.app.use((req, res, next) => this.middlewares["RouteNotFound"].run(req, res, next));
        this.app.use((error, req, res, next) => this.middlewares["ServerError"].run(error, req, res, next));

        this.webserver = http.createServer(this.app);
        this.webserver.listen(this.port, () => Logger.info(Logger.Type.Webserver, `Webserver running on port ${this.port}`));
    }

    /**
     * @returns {import("../Core")}
     */
    getCore = () => this.core;

    async loadRouters() {
        Logger.info(Logger.Type.Webserver, "Loading routers...");

        for (const filePath of fs.readdirSync(path.resolve(__dirname, "./routers")).filter(file => file.endsWith(".js"))) {
            try {
                const router = new(require(`./routers/${filePath}`))(this);
                const fileName = path.parse(filePath).name;

                this.routers[fileName] = router;
                Logger.debug(Logger.Type.Webserver, `Loaded router ${Logger.Colors.Fg.Magenta}${fileName}${Logger.Colors.Reset}`);
            } catch (error) {
                Logger.error(Logger.Type.Webserver, `An unknown error occured while loading router "${filePath}":`, error);
            }
        }

        if (Object.keys(this.routers).length === 0) {
            return Logger.warn(Logger.Type.Webserver, "No routers loaded");
        }

        Logger.info(Logger.Type.Webserver, `${Logger.Colors.Fg.Magenta}${Object.keys(this.routers).length}${Logger.Colors.Reset} routers loaded`);
    }

    async loadMiddlewares() {
        Logger.info(Logger.Type.Webserver, "Loading middlewares...");

        for (const filePath of fs.readdirSync(path.resolve(__dirname, "./middlewares")).filter(file => file.endsWith(".js"))) {
            try {
                const middleware = new(require(`./middlewares/${filePath}`))(this);
                const fileName = path.parse(filePath).name;

                this.middlewares[fileName] = middleware;
                Logger.debug(Logger.Type.Webserver, `Loaded middleware ${Logger.Colors.Fg.Magenta}${fileName}${Logger.Colors.Reset}`);
            } catch (error) {
                Logger.error(Logger.Type.Webserver, `An unknown error occured while loading middleware "${filePath}":`, error);
            }
        }

        if (Object.keys(this.middlewares).length === 0) {
            return Logger.warn(Logger.Type.Webserver, "No middlewares loaded");
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