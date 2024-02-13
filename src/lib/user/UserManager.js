const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UUIDProcessor = require("../utils/UUIDProcessor");
const User = require("./types/User");
const { UserAuthError } = require("../Errors");
const Config = require("../Config");

module.exports = class UserManager {
    EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    /**
     * @param {import("../Core")} core 
     */
    constructor(core) {
        this.core = core;
        this._cache = [];
    }

    /**
     * @private
     * @param {string} password
     * @returns {Promise<string>}
     */
    _hashPassword = async (password) => {
        const salt = await bcryptjs.genSalt(10);
        return await bcryptjs.hash(password, salt);
    }

    /**
     * @private
     * @param {string} hashedPassword
     * @param {string} clearPassword
     * @returns {Promise<boolean>}
     */
    _comparePassword = async (hashedPassword, clearPassword) => await bcryptjs.compare(clearPassword, hashedPassword);

    /**
     * @param {User} user
     * @returns {string}
     */
    generateToken = (user) => jwt.sign({ uuid: user.uuid }, Config.getSecretKey(), { expiresIn: "24h"});

    /**
     * @param {string} token
     * @returns {User}
     */
    verifyToken = (token) => {
        try {
            return jwt.verify(token, Config.getSecretKey());
        } catch (error) {
            return null;
        }
    }

    /**
     * @returns {Promise<User[]>}
     */
    getUsers = async () => {
        const users = await this.core.getDatabase().query("SELECT * FROM `users`");
        Logger.debug(Logger.Type.UserManager, `Loaded ${users.length} users from database`);

        return users.map(userData => new User(userData));
    }

    /**
     * @param {object} options 
     * @param {string} options.uuid 
     * @param {string} options.email 
     * @param {string} options.username 
     * @returns {Promise<User | null>}
     */
    getUser = async (options = {}) => {
        const { uuid, email, username } = options;
        let user = this._cache.find(user => user.uuid == uuid || user.email == email || user.username == username);
        Logger.debug(Logger.Type.UserManager, `Cache hit for user ${user ? user.uuid : "null"}`);

        if (!user) {
            const userData = await this.core.getDatabase().query("SELECT * FROM `users` WHERE `uuid` = ? OR `email` = ? OR `username` = ?", [ uuid, email, username ]);

            if (!Array.isArray(userData) || userData.length == 0) {
                Logger.debug(Logger.Type.UserManager, `No user found for ${uuid || email || username}`);
                return null;
            }

            user = new User(userData[0]);
            this._cache.push(user);
            Logger.debug(Logger.Type.UserManager, `Loaded user ${userData[0].uuid} from database, caching...`);
        }

        return user;
    }

    /**
     * @param {string} uuid 
     * @param {string} email 
     * @param {string} password 
     * @param {string} username 
     * @returns {Promise<User>}
     */
    createUser = (uuid, email, password, username) => new Promise(async (resolve, reject) => {
        if (!UUIDProcessor.validateUUID(uuid)) {
            Logger.debug(Logger.Type.UserManager, `Invalid UUID provided, generating new one...`);
            uuid = UUIDProcessor.newUUID();

            while (this.getUser({ uuid })) { uuid = UUIDProcessor.newUUID(); }
            Logger.debug(Logger.Type.UserManager, `Generated new UUID: ${uuid}`);
        }

        if (!(email && password && username)) {
            return reject(UserAuthError.MISSING_REQUIRED_PARAMETERS);
        }

        if (username.length < 2) {
            return reject(UserAuthError.USERNAME_DOESNT_MEET_MINIMAL_REQUIREMENTS);
        }
        
        if (username.length > 32) {
            return reject(UserAuthError.USERNAME_DOESNT_MEET_MAXIMAL_REQUIREMENTS);
        }

        if (!this.EMAIL_REGEX.test(email)) {
            return reject(UserAuthError.INVALID_EMAIL);
        }

        const userExists = await this.getUser({ email, username })
        if (userExists) {
            return reject(UserAuthError.USER_ALREADY_EXISTS);
        }
      
        const user = new User({ uuid, email, password: await this._hashPassword(password), username, createdAt: Math.floor(Date.now() / 1000) });
        this.core.getDatabase().exec("INSERT INTO `users` (`uuid`, `username`, `email`, `password`, `createdAt`) VALUES (?, ?, ?, ?, ?)", [
            user.uuid, user.username, user.email, user.password, user.createdAt
        ]);
        this._cache.push(user);
        
        Logger.debug(Logger.Type.UserManager, "Created new user", {
            uuid: user.uuid,
            email: user.email,
            username: user.username
        });

        return resolve(user);
    })
}