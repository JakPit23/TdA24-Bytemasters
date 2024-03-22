const Logger = require("../Logger");
const Utils = require("../Utils");
const APIError = require("../types/APIError");
const Lecturer = require("../types/user/Lecturer");
const User = require("../types/user/User");
const UserType = require("../types/user/UserType");

module.exports = class UserManager {
    /**
     * @param {import("../Core")} core
     */
    constructor(core) {
        this.core = core;

        /**
         * @private
         * @type {import("../types/user/User")[]}
         */
        this._cache = [];
    }

    /**
     * @private
     * @param {import("../types/user/User") | import("../types/user/Lecturer")} user
     */
    _addToCache(user) {
        if (!(user instanceof User)) {
            throw APIError.InvalidValueType("user", "User");
        }

        if (this._getFromCache({ uuid: user.uuid, username: user.username })) {
            Logger.debug(Logger.Type.UserManager, `&c${user.uuid}&r already exists in cache, updating...`);
            this._cache = this._cache.map(data => data.uuid == user.uuid ? user : data);
        } else {
            Logger.debug(Logger.Type.UserManager, `Caching user &c${user.uuid}&r...`);
            this._cache.push(user);
        }
    }

    /**
     * @private
     * @param {import("../types/DocTypes").UserIdentification} options
     */
    _removeFromCache(options) {
        this._cache = this._cache.filter(data => data.uuid != options.uuid && data.username != options.username);
    }

    /**
     * @private
     * @param {import("../types/DocTypes").UserIdentification} options 
     * @returns {import("../types/user/User") | import("../types/user/Lecturer") | null}
     */
    _getFromCache = (options) => this._cache.find(data => data.uuid == options.uuid || data.username == options.username)

    async getUsers() {
        const users = await this.core.getDatabase().query("SELECT * FROM `users`");
        Logger.debug(Logger.Type.UserManager, `Loaded &c${users.length}&r users from database`);

        return Promise.all(users.map(data => {
            if (data.type == UserType.Lecturer) {
                return this.getLecturer({ uuid: data.uuid });
            }

            return this.getUser({ uuid: data.uuid });
        }));
    }

    /**
     * @param {import("../types/DocTypes").UserIdentification} options 
     * @returns {Promise<import("../types/user/User") | null>}
     */
    async getUser(options = {}) {
        const { uuid, username, email } = options;
        let user = this._getFromCache(options);

        if (!user) {
            const data = await this.core.getDatabase().query("SELECT * FROM `users` WHERE `uuid` = ? OR `username` = ? OR `email` = ?", [ uuid, username, email ]);
            if (!Array.isArray(data) || data.length == 0) {
                Logger.debug(Logger.Type.UserManager, `User &c${uuid || username || email}&r not found`);
                return null;
            }

            user = new User(data[0]);
            this._addToCache(user);
            Logger.debug(Logger.Type.UserManager, `Loaded user &c${user.uuid}&r from database, caching...`);
        } else {
            Logger.debug(Logger.Type.UserManager, `Found user &c${user.uuid}&r in cache`);
        }

        return user;
    }

    /**
     * @param {import("../types/DocTypes").UserIdentification} options
     * @returns {Promise<import("../types/user/Lecturer") | null>}
     */
    async getLecturer(options = {}) {
        let user = this._getFromCache(options);

        if (!(user instanceof Lecturer)) {
            user = await this.getUser(options);
            if (!user) {
                return null;
            }

            if (user.type != UserType.Lecturer) {
                return null;
            }

            const data = await this.core.getDatabase().query("SELECT * FROM `lecturers` WHERE `uuid` = ?", [ user.uuid ]);
            if (!Array.isArray(data) || data.length == 0) {
                Logger.debug(Logger.Type.UserManager, `Lecturer data for user &c${user.uuid}&r not found`);
                return null;
            }
    
            const userData = {
                ...user,
                ...data[0],
                contact: {
                    emails: data[0].emails.split(","),
                    telephone_numbers: data[0].telephone_numbers.split(",")
                }
            };

            if (data[0].tags) {
                userData.tags = await Promise.all(
                    data[0].tags
                        .split(",")
                        .map(uuid => this.core.getTagManager().getTag({ uuid }))
                    );
            }

            if (data[0].appointments) {
                userData.appointments = await Promise.all(
                    data[0].appointments
                        .split(",")
                        .map(async uuid => await this.core.getAppointmentManager().getAppointment({ uuid }))
                    );
            }
            
            user = new Lecturer(userData);
            this._addToCache(user);
            Logger.debug(Logger.Type.UserManager, `Loaded lecturer data for user &c${user.uuid}&r from database`);
        } else {
            Logger.debug(Logger.Type.UserManager, `Found lecturer &c${user.uuid}&r in cache`);
        }

        return user;
    }

    /**
     * @private
     * @param {import("../types/user/User")} user 
     * @param {boolean} edit
     */
    async _saveUser(user, edit = false) {
        if (!(user instanceof User)) {
            throw APIError.InvalidValueType("user", "User");
        }

        if (await this.getUser({ uuid: user.uuid, username: user.username, email: user.email }) && !edit) {
            Logger.debug(Logger.Type.UserManager, `Not saving user &c${user.uuid}&r because it &calready exists&r in database and it's not an &cedit operation&r...`);
            throw APIError.KeyAlreadyExists("user");
        }

        if (edit) {
            Logger.debug(Logger.Type.UserManager, `Updating user &c${user.uuid}&r in database...`);

            this.core.getDatabase().exec("UPDATE `users` SET `type` = ?, `email` = ?, `password` = ?, `username` = ?, `createdAt` = ? WHERE `uuid` = ?", [
                user.type,
                user.email,
                user.password,
                user.username,
                user.createdAt,
                user.uuid
            ]);
        } else {
            Logger.debug(Logger.Type.UserManager, `Creating user &c${user.uuid}&r in database...`);

            this.core.getDatabase().exec("INSERT INTO `users` (`uuid`, `type`, `email`, `password`, `username`, `createdAt`) VALUES (?, ?, ?, ?, ?, ?)", [
                user.uuid,
                user.type,
                user.email,
                user.password,
                user.username,
                user.createdAt
            ]);
        }

        this._addToCache(user);
    }
   
    /**
     * @private
     * @param {import("../types/user/Lecturer")} user 
     * @param {boolean} edit
     */
    async _saveLecturer(user, edit = false) {
        if (!(user instanceof Lecturer)) {
            throw APIError.InvalidValueType("user", "Lecturer");
        }
        
        if (await this.getUser({ uuid: user.uuid, username: user.username, email: user.email }) && !edit) {
            Logger.debug(Logger.Type.UserManager, `Not saving lecturer &c${user.uuid}&r because it &cexists&r in database and it's not an &cedit operation&r...`);
            throw APIError.KeyNotFound("user");
        }

        let tags = [];
        if (user.tags) {
            tags = await this.core.getTagManager().createTags(user.tags);
        }
        
        await this.core.getAppointmentManager().saveAppointments(user.appointments);

        if (edit) {
            Logger.debug(Logger.Type.UserManager, `Updating lecturer data for &c${user.uuid}&r in database...`);
            this.core.getDatabase().exec("UPDATE `lecturers` SET `title_before` = ?, `first_name` = ?, `middle_name` = ?, `last_name` = ?, `title_after` = ?, `picture_url` = ?, `location` = ?, `claim` = ?, `bio` = ?, `price_per_hour` = ?, `tags` = ?, `emails` = ?, `telephone_numbers` = ?, `appointments` = ? WHERE `uuid` = ?", [
                user.title_before,
                user.first_name,
                user.middle_name,
                user.last_name,
                user.title_after,
                user.picture_url,
                user.location,
                user.claim,
                user.bio,
                user.price_per_hour,
                tags.map(tag => tag.uuid).join(","),
                user.contact.emails.join(","),
                user.contact.telephone_numbers.join(","),
                user.appointments.map(appointment => appointment.uuid).join(","),
                user.uuid
            ]);

            await this._saveUser(user, true);
        } else {
            Logger.debug(Logger.Type.UserManager, `Creating lecturer data for &c${user.uuid}&r in database...`);
            this.core.getDatabase().exec("INSERT INTO `lecturers` (`uuid`, `title_before`, `first_name`, `middle_name`, `last_name`, `title_after`, `picture_url`, `location`, `claim`, `bio`, `price_per_hour`, `tags`, `emails`, `telephone_numbers`, `appointments`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                user.uuid,
                user.title_before,
                user.first_name,
                user.middle_name,
                user.last_name,
                user.title_after,
                user.picture_url,
                user.location,
                user.claim,
                user.bio,
                user.price_per_hour,
                tags.map(tag => tag.uuid).join(","),
                user.contact.emails.join(","),
                user.contact.telephone_numbers.join(","),
                user.appointments.map(appointment => appointment.uuid).join(",")
            ]);

            await this._saveUser(user);
        }

        this._addToCache(user);
    }

    /**
     * @param {import("../types/DocTypes").UserData} data 
     */
    async createUser(data) {
        if (!Utils.validateUUID(data.uuid)) {
            data.uuid = Utils.newUUID();
            while (await this.getUser({ uuid: data.uuid })) { data.uuid = Utils.newUUID() }
        }

        if (typeof data.password !== "string") {
            throw APIError.InvalidValueType("password", "string");
        }

        if (data.password.length < 8 || data.password.length > 128) {
            throw APIError.InvalidValueLength("password", 8, 128);
        }

        data.createdAt = new Date().getTime();
        data.password = await User.hashPassword(data.password);

        const user = data.type == UserType.Lecturer ? new Lecturer(data) : new User(data);

        if (user instanceof Lecturer) {
            await this._saveLecturer(user);
            return user;
        }

        await this._saveUser(user);
        return user;
    }

    /**
     * @param {import("../types/DocTypes").UserIdentification} options 
     * @returns {Promise<boolean>}
     */
    async deleteUser(options = {}) {
        if (!(await this.getUser(options))) {
            throw APIError.KeyNotFound("user");
        }
        
        const result = this.core.getDatabase().exec("DELETE FROM `users` WHERE `uuid` = ? OR `username` = ?", [ options.uuid, options.username ]);
        if (result.changes != 1) {
            throw APIError.KeyNotDeleted("user");
        }

        this._removeFromCache(options);
        return true;
    }

    /**
     * @param {import("../types/user/User")} user
     * @param {import("../types/DocTypes").UserData} data 
     * @returns {Promise<import("../types/user/User")>}
     */
    async editUser(user, data) {
        if (!(user instanceof User)) {
            throw APIError.InvalidValueType("user", "User");
        }

        await this._saveUser(user, true);
        
        if (user instanceof Lecturer) {
            user.edit(data);
            await this._saveLecturer(user, true);
        }

        return user;
    }
    
    async shutdown() {
        Logger.debug(Logger.Type.UserManager, "Shutting down user manager...");

        for (const user of this._cache) {
            Logger.debug(Logger.Type.UserManager, `Saving user &c${user.uuid}&r from cache to database...`);
            await this._saveUser(user, true);
        }
    }
}