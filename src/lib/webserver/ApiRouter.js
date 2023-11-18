const express = require("express");
const ApiVersion1Router = require("./ApiVersion1Router");

/**
 * The ApiRouter class is responsible for defining routes related to API endpoints and versions.
 * @class
 */
class ApiRouter {
    /**
     * Create a new ApiRouter instance.
     * @constructor
     * @param {Core} core - The application core.
     */
    constructor(core) {
        this.core = core;
        // Initialize an Express router for API routes.
        this.router = express.Router({ mergeParams: true });

        // Create an instance of the API version 1 router.
        this.apiVersion1Router = new ApiVersion1Router(this.core);

        // Initialize the routes defined in the class.
        this.initRoutes();
    }

    /**
     * Get the Express router configured with the defined API routes.
     * @returns {express.Router} An Express router for API routes.
     */
    getRouter() {
        return this.router;
    }

    /**
     * Initialize the API routes.
     */
    initRoutes() {
        // Use the version 1 API router for routes under "/v1".
        this.router.use("/v1", this.apiVersion1Router.getRouter());

        // For all other routes, also use the version 1 API router (fallback).
        this.router.use("/", this.apiVersion1Router.getRouter());
    }
}

// Export the ApiRouter class for use in other modules.
module.exports = ApiRouter;
