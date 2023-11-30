class Configuration {
    /**
     * Get the port number for the Webserver
     * @returns {number} The Webserver port number.
     */
    getWebserverPort = () => process.env.WEBSERVER_PORT || 3000;

    /**
     * Get the log level for the application.
     * @returns {string} The log level.
     */
    getLogLevel = () => process.env.LOG_LEVEL || "info";
}

module.exports = Configuration;
