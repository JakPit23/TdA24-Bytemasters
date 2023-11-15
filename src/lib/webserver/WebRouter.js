const express = require("express");
const path = require("path");

/**
 * The WebRouter class is responsible for defining routes related to serving web pages and static files.
 * @class
 */
class WebRouter {
    /**
     * Create a new WebRouter instance.
     * @constructor
     */
    constructor() {
        // Initialize an Express router for web routes.
        this.router = express.Router({ mergeParams: true });

        // Initialize the routes defined in the class.
        this.initRoutes();
    }

    /**
     * Get the Express router configured with the defined web routes.
     * @returns {express.Router} An Express router for web routes.
     */
    getRouter() {
        return this.router;
    }

    /**
     * Initialize the web routes.
     */
    initRoutes() {
        this.router.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "../../views/index.html"));
        });

        this.router.get("/lecturer", (req, res) => {
            res.sendFile(path.join(__dirname, "../../views/lecturer.html"));
        });

        // Handle 404 errors.
        this.router.use("*", (req, res, next) => {
            res.status(404).send("404 - Page not found");
        });
    }
}

// Export the WebRouter class for use in other modules.
module.exports = WebRouter;
