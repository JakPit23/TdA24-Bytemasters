class Configuration {
    /**
     * 
     * @returns {number}
     */
    getWebserverPort = () => process.env.WEBSERVER_PORT || 3000;

    /**
     * 
     * @returns {string}
     */
    getLogLevel = () => process.env.LOG_LEVEL || "info";
}

module.exports = Configuration;
