const { v4, validate, version } = require("uuid");

class UUIDProcessor {
    /**
     * @param {string} uuid 
     * @returns {boolean}
     */
    validateUUID = (uuid) => validate(uuid) && version(uuid) === 4;

    newUUID = () => v4();
}

module.exports = new UUIDProcessor();