const Utils = require("./Utils");

class Config {
    /**
     * @returns {string}
     */
    static logLevel = process.argv.includes("--dev") ? "debug" : (process.env.LOG_LEVEL || "info");

    /**
     * @returns {number}
     */
    static webserverPort = process.env.WEBSERVER_PORT || 3000;

    /**
     * @returns {string}
     */
    static secretKey = process.argv.includes("--dev") ? "dev" : process.env.SECRET_KEY || Utils.newUUID();

    /**
     * @returns {string}
     */
    static apiUsername = process.env.API_USERNAME || "TdA";

    /**
     * @returns {string}
     */
    static apiPassword = process.env.API_PASSWORD || "d8Ef6!dGG_pv";

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