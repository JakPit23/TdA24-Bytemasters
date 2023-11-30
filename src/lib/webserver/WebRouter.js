const express = require("express");
const path = require("path");

class WebRouter {
    constructor() {
        this.router = express.Router({ mergeParams: true });

        this.initRoutes();
    }

    /**
     * Get the Express router
     * @returns {express.Router} An Express router
     */
    getRouter = () => this.router;

    initRoutes() {
        this.router.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "../../views/index.html"));
        });

        this.router.get("/lecturer", (req, res) => {
            res.sendFile(path.join(__dirname, "../../views/lecturer.html"));
        });

        this.router.use("*", (req, res, next) => {
            res.status(404).send("404 - Page not found");
        });
    }
}

module.exports = WebRouter;
