const express = require("express");

module.exports = class WebRoute {
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
        this.router.get("/", (req, res) => res.json({
            secret: "The cake is a lie"
        }));
    }
};