const Utils = require("./Utils");

class Config {
    static _secretKey = process.argv.includes("--dev") ? "dev" : process.env.SECRET_KEY || Utils.newUUID();

    /**
     * @returns {number}
     */
    static getWebserverPort = () => process.env.WEBSERVER_PORT || 3000;

    /**
     * @returns {string}
     */
    static getLogLevel = () => process.argv.includes("--dev") ? "debug" : (process.env.LOG_LEVEL || "info");

    /**
     * @returns {string}
     */
    static getSecretKey = () => this._secretKey;

    /**
     * @returns {string}
     */
    static getAPIUsername = () => process.env.API_USERNAME || "TdA";

    /**
     * @returns {string}
     */
    static getAPIPassword = () => process.env.API_PASSWORD || "d8Ef6!dGG_pv";

    /**
     * @returns {boolean}
     */
    static logRequestBody = process.argv.includes("--logRequestBody");

    /**
     * @returns {boolean}
    */
    static logResponseBody = process.argv.includes("--logResponseBody");
}

module.exports = Config;