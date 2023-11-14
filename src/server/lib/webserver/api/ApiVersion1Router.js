const express = require("express");

/**
 * The ApiVersion1Router class is responsible for defining routes related to API version 1.
 * @class
 */
class ApiVersion1Router {
    /**
     * Create a new ApiVersion1Router instance.
     * @constructor
     */
    constructor() {
        // Initialize an Express router for API version 1 routes.
        this.router = express.Router({ mergeParams: true });

        // Initialize the routes defined in the class.
        this.initRoutes();
    }

    /**
     * Get the Express router configured with the defined API version 1 routes.
     * @returns {express.Router} An Express router for API version 1 routes.
     */
    getRouter() {
        return this.router;
    }

    /**
     * Initialize the API version 1 routes.
     */
    initRoutes() {
        // Define a simple GET route that responds with JSON data.
        this.router.get("/", (req, res) => {
            res.json({
                secret: "The cake is a lie"
            });
        });
    }
}

// Export the ApiVersion1Router class for use in other modules.
module.exports = ApiVersion1Router;
