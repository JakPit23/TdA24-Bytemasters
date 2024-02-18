/**
 * @typedef {object} LecturerRawData
 * @property {string} title_before
 * @property {string} first_name
 * @property {string} middle_name
 * @property {string} last_name
 * @property {string} title_after
 * @property {string} picture_url
 * @property {string} location
 * @property {string} claim
 * @property {string} bio
 * @property {string} price_per_hour
 * @property {string} tags
 * @property {string} emails
 * @property {string} telephone_numbers
*/

const sanitizeHtml = require("sanitize-html");
const Lecturer = require("./types/Lecturer");
const UUIDProcessor = require("../utils/UUIDProcessor");
const Logger = require("../Logger");
const { APIError } = require("../Errors");

class LecturerManager {
    /**
     * @param {import("../Core")} core 
     */
    constructor(core) {
        this.core = core;

        /**
         * @private
         * @type {import("./types/Lecturer")[]}
         */
        this._cache = [];
    }

    /**
     * @private
     * @param {import("./types/Lecturer")} lecturer 
     * @param {boolean} edit
     */
    _saveLecturer = async (lecturer, edit = false) => {
        let emails = null;
        let telephoneNumbers = null;
        if (lecturer.contact) {
            if (lecturer.contact.emails && Array.isArray(lecturer.contact.emails)) {
                emails = lecturer.contact.emails.join(",");
            }

            if (lecturer.contact.telephone_numbers && Array.isArray(lecturer.contact.telephone_numbers)) {
                telephoneNumbers = lecturer.contact.telephone_numbers.join(",");
            }
        }
        
        let tags = null;
        if (lecturer.tags && Array.isArray(lecturer.tags)) {
            tags = lecturer.tags.map(tag => tag.uuid).join(",");
        }

        if (await this.getLecturer({ uuid: lecturer.uuid, username: lecturer.username }) && !edit) {
            Logger.debug(Logger.Type.LecturerManager, `Not saving lecturer ${lecturer.uuid} because it already exists in database and it's not an edit operation...`);
            throw APIError.LECTURER_ALREADY_EXISTS;
        }

        if (edit) {
            Logger.debug(Logger.Type.LecturerManager, `Updating lecturer ${lecturer.uuid} in database...`);

            this.core.getDatabase().exec("UPDATE lecturers SET password = ?, title_before = ?, first_name = ?, middle_name = ?, last_name = ?, title_after = ?, picture_url = ?, location = ?, claim = ?, bio = ?, tags = ?, price_per_hour = ?, emails = ?, telephone_numbers = ? WHERE uuid = ?", [
                lecturer.password,
                lecturer.title_before,
                lecturer.first_name,
                lecturer.middle_name,
                lecturer.last_name,
                lecturer.title_after,
                lecturer.picture_url,
                lecturer.location,
                lecturer.claim,
                lecturer.bio,
                tags,
                lecturer.price_per_hour,
                emails,
                telephoneNumbers,
                lecturer.uuid,
            ]);
        } else {
            Logger.debug(Logger.Type.LecturerManager, `Creating lecturer ${lecturer.uuid} in database...`);

            this.core.getDatabase().exec("INSERT INTO lecturers (uuid, username, password, title_before, first_name, middle_name, last_name, title_after, picture_url, location, claim, bio, tags, price_per_hour, emails, telephone_numbers) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                lecturer.uuid,
                lecturer.username,
                lecturer.password,
                lecturer.title_before,
                lecturer.first_name,
                lecturer.middle_name,
                lecturer.last_name,
                lecturer.title_after,
                lecturer.picture_url,
                lecturer.location,
                lecturer.claim,
                lecturer.bio,
                tags,
                lecturer.price_per_hour,
                emails,
                telephoneNumbers,
            ]);
        }

        if (this._cache.find(data => data.uuid == lecturer.uuid)) {
            Logger.debug(Logger.Type.LecturerManager, `Updating lecturer ${lecturer.uuid} in cache...`);
            this._cache = this._cache.map(data => data.uuid == lecturer.uuid ? lecturer : data);
        } else {
            Logger.debug(Logger.Type.LecturerManager, `Caching lecturer ${lecturer.uuid}...`);
            this._cache.push(lecturer);
        }
    }

    /**
     * @private
     * @param {LecturerRawData} _data 
     * @returns {Promise<Lecturer>}
     */
    _readLecturer = async (_data) => {
        const { tags, emails, telephone_numbers, ...data } = _data;
        const json = { ...data };

        const contact = {};
        if (emails) {
            contact.emails = emails.split(",");
        }

        if (telephone_numbers) {
            contact.telephone_numbers = telephone_numbers.split(",");
        }

        if (Object.keys(contact).length > 0) {
            json.contact = contact;
        }

        if (tags) {
            for (const tagUUID of tags.split(",")) {
                const tag = await this.core.getTagManager().getTag({ uuid: tagUUID });
                (json.tags ??= []).push(tag);
            }
        }

        return new Lecturer(json);
    }

        
    /**
     * @private
     * @param {import("./types/Lecturer")} data 
     * @param {import("./types/Lecturer")} combination 
     * @returns {Promise<object>}
     */
    async _processLecturer(data, combination) {
        const json = {};
        const allowedKeys = [
            { key: "username", required: true },
            { key: "password", required: true, dontSanitize: true },
            { key: "title_before" },
            { key: "first_name", required: true },
            { key: "middle_name" },
            { key: "last_name", required: true },
            { key: "title_after" },
            { key: "picture_url" },
            { key: "location" },
            { key: "claim" },
            { key: "price_per_hour" },
            { key: "contact", required: true }
        ];

        for (const { key, required, dontSanitize } of allowedKeys) {
            if (!data[key] && required && !combination) {
                Logger.debug(Logger.Type.LecturerManager, `Missing required value "${key}"`);
                throw APIError.MISSING_REQUIRED_VALUES;
            }

            if (typeof data[key] == "object") {
                Logger.debug(Logger.Type.LecturerManager, `Key "${key}" is an object, skipping from sanitization...`);
                continue;
            }

            if (!data[key]) {
                Logger.debug(Logger.Type.LecturerManager, `Key "${key}" is empty, skipping from sanitization...`);
                continue;
            }

            if (dontSanitize) {
                Logger.debug(Logger.Type.LecturerManager, `Key "${key}" has dontSanitize flag, skipping from sanitization...`);
                json[key] = data[key];
                continue;
            }
            
            Logger.debug(Logger.Type.LecturerManager, `Sanitizing key "${key}"...`);
            json[key] = sanitizeHtml(data[key]);
        }
        
        if (data.bio) {
            Logger.debug(Logger.Type.LecturerManager, `Sanitizing key "bio"...`);
            json.bio = sanitizeHtml(data.bio);
        }

        let filteredTags = [];
        let filteredNumbers = [];
        let filteredEmails = [];

        if (data.tags && Array.isArray(data.tags)) {
            for (const _data of data.tags) {
                if (typeof _data.name !== "string") {
                    Logger.debug(Logger.Type.LecturerManager, `Invalid tag name "${_data.name}"`);
                    continue;
                }

                let tag = await this.core.getTagManager().getTag({ name: _data.name });

                if (tag) {
                    if (filteredTags.find(filteredTag => filteredTag.name === tag.name)) {
                        Logger.debug(Logger.Type.LecturerManager, `Tag "${tag.name}" already exists in filtered tags`);
                        continue;
                    }

                    filteredTags.push({ uuid: tag.uuid, name: tag.name });
                    continue;
                }
    
                tag = await this.core.getTagManager().createTag({ name: _data.name });
                filteredTags.push({ uuid: tag.uuid, name: tag.name });
            }
        }

        if (data.contact) {
            if (data.contact.telephone_numbers && Array.isArray(data.contact.telephone_numbers)) {
                filteredNumbers = [...new Set(data.contact.telephone_numbers.filter(number => this._isValidPhoneNumber(number)))];
            }
        
            if (data.contact.emails && Array.isArray(data.contact.emails)) {
                filteredEmails = [...new Set(data.contact.emails.filter(email => this._isValidEmail(email)))];
            }
        }

        if (filteredTags.length > 0) {
            Logger.debug(Logger.Type.LecturerManager, `Lecturer tags: ${filteredTags.map(tag => tag.uuid).join(", ")}`);
            json.tags = filteredTags;
        }

        let contact = {};
        if (filteredNumbers.length > 0) {
            Logger.debug(Logger.Type.LecturerManager, `Contact telephone numbers: ${filteredNumbers.join(", ")}`);
            contact.telephone_numbers = filteredNumbers;
        }
        
        if (filteredEmails.length > 0) {
            Logger.debug(Logger.Type.LecturerManager, `Contact emails: ${filteredEmails.join(", ")}`);
            contact.emails = filteredEmails;
        }

        if (Object.keys(contact).length > 0) {
            json.contact = contact;
        } else if (!combination) {
            throw APIError.MISSING_REQUIRED_VALUES;
        }

        if (combination) {
            Object.entries(json).forEach(([key, value]) => {
                if (key == "username") {
                    Logger.debug(Logger.Type.LecturerManager, `Skipping username update...`);
                    return;
                }

                (combination[key]) = value;
            });
            return combination;
        }

        json.uuid = UUIDProcessor.newUUID();
        while (await this.getLecturer({ uuid: json.uuid })) { json.uuid = UUIDProcessor.newUUID() }

        return json;
    }


    /**
     * @returns {Promise<import("./types/Lecturer")[]>}
     */
    getLecturers = async () => {
        // TODO: (asi) pridat cteni z cache
        const lecturers = await this.core.getDatabase().query("SELECT * FROM `lecturers`");
        Logger.debug(Logger.Type.LecturerManager, `Loaded ${lecturers.length} lecturers from database`);

        return Promise.all(lecturers.map(lecturer => this._readLecturer(lecturer)));
    }

    /**
     * @param {object} options
     * @param {object} options.uuid
     * @param {object} options.username
     * @returns {Promise<Lecturer | null>}
     */
    getLecturer = async (options = {}) => {
        const { uuid, username } = options;
        let lecturer = this._cache.find(data => data.uuid == uuid || data.username == username);

        if (!lecturer) {
            const data = await this.core.getDatabase().query("SELECT * FROM `lecturers` WHERE `uuid` = ? OR `username` = ?", [ uuid, username ]);

            if (!Array.isArray(data) || data.length == 0) {
                Logger.debug(Logger.Type.LecturerManager, `Lecturer "${uuid || username}" not found`);
                return null;
            }

            lecturer = new Lecturer(await this._readLecturer(data[0]));
            this._cache.push(lecturer);
            Logger.debug(Logger.Type.LecturerManager, `Loaded lecturer "${lecturer.uuid}" from database, caching...`);
        } else {
            Logger.debug(Logger.Type.LecturerManager, `Found lecturer "${lecturer.uuid}" in cache`);
        }

        return lecturer;
    }

    /**
     * @param {object} data 
     * @returns {Promise<Lecturer>}
     */
    async createLecturer(data) {
        const lecturer = new Lecturer(await this._processLecturer(data));
        await this._saveLecturer(lecturer);
        return lecturer;
    }

    /**
     * @param {string} uuid 
     * @returns {Promise<boolean>}
     */
    async deleteLecturer(uuid) {
        if (!(await this.getLecturer({ uuid }))) {
            throw Error("LECTURER_NOT_FOUND");
        }

        const result = this.core.getDatabase().exec("DELETE FROM lecturers WHERE uuid = ?", [uuid]);
        if (result.changes != 1) {
            throw Error("LECTURER_NOT_DELETED");
        }

        if (this._cache.find(lecturer => lecturer.uuid == uuid)) {
            this._cache = this._cache.filter(lecturer => lecturer.uuid != uuid);
        }

        return true;
    }

    /**
     * @param {string} uuid 
     * @param {object} data 
     * @returns {Promise<Lecturer>}
     */
    async editLecturer(uuid, data) {
        const originalData = await this.getLecturer({ uuid });
        if (!originalData) {
            throw Error("LECTURER_NOT_FOUND");
        }

        const result = await this._processLecturer(data, originalData);
        await this._saveLecturer(result, true);
        return result;
    }

    /**
     * @private
     * @param {string} phoneNumber
     * @returns {boolean}
     */
    _isValidPhoneNumber(phoneNumber) {
        Logger.debug(Logger.Type.LecturerManager, `Validating phone number ${phoneNumber}`);
        return /^\+?(\d+\s?)+$/.test(phoneNumber);
    }

    /**
     * @private
     * @param {string} email
     * @returns {boolean}
     */
    _isValidEmail(email) {
        Logger.debug(Logger.Type.LecturerManager, `Validating email ${email}`);
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

module.exports = LecturerManager;