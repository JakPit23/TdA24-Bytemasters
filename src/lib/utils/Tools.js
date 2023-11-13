const fs = require("fs");
const path = require("path");

/**
 * The Tools class provides utility functions for the application.
 * @class
 */
class Tools {
    /**
     * Retrieve the application version from the package.json file.
     * @static
     * @returns {string} The application version or "unknown" if not found.
     */
    static GetApplicationVersion() {
        try {
            // Read the package.json file to get the application version.
            const packageContent = fs.readFileSync(path.join(__dirname, "../../package.json"), { encoding: "utf-8" });

            // If package.json content is not found, return "unknown" version.
            if (!packageContent) {
                return "unknown";
            }

            // Parse the package.json content and extract the version field.
            return JSON.parse(packageContent.toString()).version;
        } catch (error) {
            // If an error occurs (e.g., file not found), return "unknown" version.
            // This is intentional, and the error is ignored.
        }
    }
}

// Export the Tools class for use in other modules.
module.exports = Tools;
