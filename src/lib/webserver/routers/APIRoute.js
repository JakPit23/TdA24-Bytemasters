const fs = require("fs");
const express = require("express");
const Logger = require("../../Logger");
const APIResponse = require("../APIResponse");
const User = require("../../types/user/User");

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
        this.router.get("/", (req, res) => APIResponse.Ok.send(res, { secret: "The cake is a lie" }));

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

        this.router.get("/test", async (req, res, next) => {
            try {
                return APIResponse.Ok.send(res, { message: "Test successful" });
            } catch (error) {
                return next(error);
            }
        })
    }
};