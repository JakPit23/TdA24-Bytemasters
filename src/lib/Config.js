const Utils = require("./Utils");

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
    getSecretKey = () => process.env.SECRET_KEY || Utils.newUUID();

    /**
     * @returns {string}
     */
    getAPIUsername = () => process.env.API_USERNAME || "TdA";

    /**
     * @returns {string}
     */
    getAPIPassword = () => process.env.API_PASSWORD || "d8Ef6!dGG_pv";
}

module.exports = new Config();