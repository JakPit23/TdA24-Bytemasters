class Configuration {
    /**
     * Get the port number for the Webserver
     * @static
     * @returns {number} The Webserver port number.
     */
    getWebserverPort = () => process.env.WEBSERVER_PORT || 3000;

    getLogLevel = () => process.env.LOG_LEVEL || "info";
}

module.exports = Configuration;
