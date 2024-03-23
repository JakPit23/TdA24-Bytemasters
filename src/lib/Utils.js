const { v4, validate, version } = require("uuid");

class Utils {
    static isDev = process.argv.includes("--dev");
    
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
    static validatePhoneNumber = (phoneNumber) => /^(?:(?:\+?420\s?)?(?:\d{9}|\d{3}\s?\d{3}\s?\d{3}))$/.test(phoneNumber);

    /**
     * @param {string} email
     * @returns {boolean}
     */
    static validateEmail = (email) => /^(?=.{1,254}$)[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    /**
     * @param {string} string 
     * @returns {boolean}
     */
    static validateString = (string) => typeof string === "string" && string.length > 0;

    /**
     * @param {number} number
     * @returns {boolean}
     */
    static validateNumber = (number) => typeof number === "number";
    
    /**
     * @param {boolean} bool
     * @returns {boolean}
     */
    static validateBoolean = (bool) => typeof bool === "boolean";
    
    /**
     * @param {any[]} array
     * @param {string} type
     */
    static validateArray = (array, type) => Array.isArray(array) && array.length > 0 && array.every(item => typeof item === type);
    
    /**
     * @param {Date} date 
     * @returns {string} Returns date in format DD.MM.YYYY
     */
    static formatDate = (date) => `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`

    /**
     * @param {Date} date 
     * @returns {string} Returns time in format HH:MM 
     */
    static formatTime = (date) => `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
}

module.exports = Utils;