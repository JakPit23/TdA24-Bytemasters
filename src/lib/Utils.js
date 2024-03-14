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
    static validatePhoneNumber = (phoneNumber) => /^\+?([0-9 \-]{9,})$/.test(phoneNumber);

    /**
     * @param {string} email
     * @returns {boolean}
     */
    static validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    /**
     * @param {Date} date 
     * @returns {string} Returns date in format DD.MM.YYYY
     */
    static formatDate = (date) => `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`

    /**
     * @param {Date} date 
     * @returns {string} Returns time in format HH:MM 
     */
    static formatTime = (date) => `${date.getHours()}:${date.getMinutes()}`
}

module.exports = Utils;