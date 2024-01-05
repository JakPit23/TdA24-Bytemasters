const { v4, validate, version } = require("uuid");

class UUIDProcessor {
    /**
     * @param {string} uuid 
     */
    validateUUID(uuid) {
        return validate(uuid) && version(uuid) === 4;
    }

    newUUID() {
        return v4();
    }
}

module.exports = new UUIDProcessor();