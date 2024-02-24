const fs = require("fs");
const express = require("express");
const Logger = require("../../Logger");
const APIResponse = require("../APIResponse");

module.exports = class WebRoute {
    /**
     * 
     * @param {import("../Webserver")} webserver 
     */
    constructor(webserver) {
        this.webserver = webserver;
        this.router = express.Router();

        this.loadRoutes();
    }

    loadRoutes = () => {
        this.router.get("/", (req, res) => APIResponse.OK.send(res, { secret: "The cake is a lie" }));

        this.router.get("/log", (req, res, next) => {
            try {
                const logPath = Logger.logFile?.path;
                if (!logPath) {
                    return res.status(404).send("No log file found");
                }
    
                const logContent = fs.readFileSync(logPath, "utf-8");
                return res.send(logContent);
            } catch (error) {
                return next(error);
            }
        });
    }
};