/**
 * @typedef {Object} UserData
 * @property {string} uuid - The UUID of the user.
 * @property {string} email - The email of the user.
 * @property {string} password - The password of the user.
 * @property {string} username - The username of the user.
 * @property {Date} createdAt - The date the user was created.
 */
module.exports = class User {
    /**
     * @param {UserData} userData 
     */
    constructor(userData) {
        this.uuid = userData.uuid;
        this.email = userData.email;
        this.password = userData.password;
        this.username = userData.username;
        this.createdAt = userData.createdAt;
    }
}