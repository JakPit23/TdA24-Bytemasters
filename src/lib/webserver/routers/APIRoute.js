const express = require("express");
const Core = require("../../Core");

module.exports = class WebRoute {
    /**
     * 
     * @param {Core} core 
     */
    constructor(core) {
        this.core = core;
        this.router = express.Router();

        this.loadRoutes();
    }

    getRouter = () => this.router;

    loadRoutes = () => {
        this.router.get("/", (req, res) => res.json({
            secret: "The cake is a lie"
        }));
    }
};