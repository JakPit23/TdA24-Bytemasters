/**
 * The Configuration class provides methods for retrieving configuration settings for the application.
 * @class
 */
class Configuration {
    /**
     * Get the port number for the Webserver from the environment variable or use a default value of 3000.
     * @static
     * @returns {number} The Webserver port number.
     */
    GetWebserverPort = () => process.env.WEBSERVER_PORT || 3000;
}

// Export the Configuration class for use in other modules.
module.exports = Configuration;
