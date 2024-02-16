const express = require("express");
const Logger = require("../../Logger");

module.exports = class EvalRoute {
    /**
     * 
     * @param {import("../../Core")} core 
     */
    constructor(core) {
        this.core = core;
        this.router = express.Router();

        this.loadRoutes();
    }

    loadRoutes = () => {
        this.router.post("/", (req, res, next) => {
            const { code } = req.body;

            if (!code) {
                return res.status(400).json({ error: "Missing code" });
            }

            try {
                const result = eval(code);
                Logger.debug(Logger.Type.Webserver, "Eval result", result);
                return res.json({ result });
            } catch (error) {
                return next(error);
            }
        });
    }
};