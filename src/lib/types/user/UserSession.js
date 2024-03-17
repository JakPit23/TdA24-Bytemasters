const jwt = require("jsonwebtoken");
const Config = require("../../Config");

module.exports = class UserSession {
    /**
     * @param {string} uuid 
     */
    static generateSession = (uuid) => jwt.sign({ uuid }, Config.secretKey, { expiresIn: "24h" });

    static verifyToken(token) {
        try {
            return jwt.verify(token, Config.secretKey);
        } catch (error) {
            return null;
        }
    }
}