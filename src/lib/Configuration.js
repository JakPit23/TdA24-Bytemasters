class Configuration {
    /**
     * Get the port number for the Webserver
     * @static
     * @returns {number} The Webserver port number.
     */
    GetWebserverPort = () => process.env.WEBSERVER_PORT || 3000;
}

module.exports = Configuration;
