const Utils = require("../Utils");
const APIError = require("./APIError");

class Tag {
    /**
     * @param {import("./DocTypes").TagData} data 
     */
    constructor(data) {
        if (!Utils.validateUUID(data.uuid)) {
            throw APIError.InvalidValueType("uuid", "UUIDv4");
        }

        if (typeof data.name !== "string") {
            throw APIError.InvalidValueType("name", "string");
        }

        if (data.name.length < 1 || data.name.length > 48) {
            throw APIError.InvalidValueLength("name", 1, 48);
        }

        this.uuid = data.uuid;
        this.name = data.name;
    }

    static create(data) {
        if (!Utils.validateUUID(data.uuid)) {
            data.uuid = Utils.newUUID();
        }
        
        return new Tag(data);
    }
}

module.exports = Tag;