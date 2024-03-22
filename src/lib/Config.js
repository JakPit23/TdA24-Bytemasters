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

    /**
     * @returns {string}
     */
    static smtpService = process.env.SMTP_SERVICE || "outlook365";

    /**
     * @returns {string}
     */
    static smtpHost = process.env.SMTP_HOST || "smtp-mail.outlook.com";

    /**
     * @returns {number}
     */
    static smtpPort = process.env.SMTP_PORT || 587;

    /**
     * @returns {string}
     */
    static smtpUsername = process.env.SMTP_USERNAME || "tda-bytemasters@outlook.com"

    /**
     * @returns {string}
     */
    static smtpPassword = process.env.SMTP_PASSWORD || "cpamg9i2AufVSXr6sAhixsqSq8NwqyKDiW8gTgiztqnYwRQRPp4nG83ubph5ZGP5";

    /**
     * @returns {string}
     */
    static smtpUseSSL = process.env.SMTP_USE_SSL || true;

    /**
     * @returns {string}
     */
    static smtpFrom = process.env.SMTP_FROM || "Teacher Digital Agency <tda-bytemasters@outlook.com>"

    /**
     * @returns {string}
     */
    static openAIKey = process.env.OPENAI_KEY || "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"
}

module.exports = Config;