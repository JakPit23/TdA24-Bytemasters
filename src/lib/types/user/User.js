const bcryptjs = require("bcryptjs");
const UserSession = require("./UserSession");
const APIError = require("../APIError");
const Utils = require("../../Utils");
const UserType = require("./UserType");

module.exports = class User {
    /**
     * @param {import("../DocTypes").UserData} data 
     */
    constructor(data) {
        if (!Utils.validateUUID(data.uuid)) {
            throw APIError.InvalidValueType("uuid", "UUIDv4");
        }

        if (!Object.values(UserType).includes(data.type)) {
            throw APIError.InvalidValueType("usertype", "UserType");
        }

        // if (!Utils.validateEmail(data.email) && data.type != UserType.Lecturer) {
        //     throw APIError.InvalidValueType("email");
        // }

        if (typeof data.username !== "string") {
            throw APIError.InvalidValueType("username", "string");
        }

        if (data.username.length < 1 || data.username.length > 32) {
            throw APIError.InvalidValueLength("username", 1, 32);
        }

        if (isNaN(new Date(data.createdAt).getTime())) {
            throw APIError.InvalidValueType("createdAt", "unix_timestamp");
        }

        this.uuid = data.uuid;
        this.type = data.type;
        this.email = data.email;
        this.username = data.username;
        this.password = data.password;
        this.createdAt = data.createdAt;
    }

    toJSON() {
        return {
            uuid: this.uuid,
            type: this.type,
            email: this.email,
            username: this.username,
            createdAt: this.createdAt
        };
    }

    /**
     * @param {string} password
     * @returns {Promise<string>}
    */
    static hashPassword = async (password) => bcryptjs.hash(password, await bcryptjs.genSalt(10))

    /**
     * @param {string} hash
     * @param {string} password
     * @returns {Promise<boolean>}
     */
    static comparePassword = (password, hash) => bcryptjs.compare(password, hash)

    /**
     * @returns {string}
     */
    createSession = () => UserSession.generateSession(this.uuid)
}