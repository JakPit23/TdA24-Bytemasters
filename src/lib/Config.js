const UUIDProcessor = require("./utils/UUIDProcessor");

class Config {
    /**
     * @returns {number}
     */
    getWebserverPort = () => process.env.WEBSERVER_PORT || 3000;

    /**
     * @returns {string}
     */
    getLogLevel = () => process.argv.includes("--dev") ? "debug" : (process.env.LOG_LEVEL || "info");

    /**
     * @returns {string}
     */
    getSecretKey = () => process.env.SECRET_KEY || UUIDProcessor.newUUID();
}

module.exports = new Config();