const UUIDProcessor = require("./utils/UUIDProcessor");

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

    /**
     * @returns {string}
     */
    // atleast the jwt is not empty or stuff like that :D
    getSecretKey = () => process.env.SECRET_KEY || UUIDProcessor.newUUID();
}

module.exports = Configuration;
