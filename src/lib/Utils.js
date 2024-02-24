const { v4, validate, version } = require("uuid");

class Utils {
    /**
     * @param {string} uuid 
     * @returns {boolean}
     */
    static validateUUID = (uuid) => validate(uuid) && version(uuid) === 4;

    static newUUID = () => v4();

    /**
     * @param {string} phoneNumber
     * @returns {boolean}
     */
    static validatePhoneNumber = (phoneNumber) => /^\+?(\d+\s?)+$/.test(phoneNumber);

    /**
     * @param {string} email
     * @returns {boolean}
     */
    static validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = Utils;