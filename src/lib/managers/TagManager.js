const Logger = require("../Logger");
const Tag = require("../types/Tag");
const Utils = require("../Utils");
const APIError = require("../types/APIError");

module.exports = class TagManager {
    /**
     * @param {import("../Core")} core 
     */
    constructor(core) {
        this.core = core;

        /**
         * @private
         * @type {import("../types/Tag")[]}
         */
        this._cache = [];
    }

    /**
     * @private
     * @param {import("../types/Tag")} tag
     */
    _addToCache(tag) {
        if (!(tag instanceof Tag)) {
            throw APIError.InvalidValueType("tag", "Tag");
        }

        if (this._getFromCache(tag)) {
            Logger.debug(Logger.Type.TagManager, `&c${tag.uuid}&r already exists in cache, updating...`);
            this._cache = this._cache.map(data => data.uuid == tag.uuid ? tag : data);
        } else {
            Logger.debug(Logger.Type.TagManager, `Caching tag &c${tag.uuid}&r...`);
            this._cache.push(tag);
        }
    }

    /**
     * @private
     * @param {import("../types/DocTypes").TagData} options
     */
    _removeFromCache(options) {
        this._cache = this._cache.filter(data => data.uuid != options.uuid && data.name != options.name);
    }

    /**
     * @private
     * @param {import("../types/DocTypes").TagData} options 
     * @returns {import("../types/Tag") | null}
     */
    _getFromCache = (options) => this._cache.find(data => data.uuid == options.uuid || data.name == options.name)

    /**
     * @private
     * @param {import("../types/DocTypes").TagData} data
     * @returns {Promise<import("../types/DocTypes").TagData>}
     */
    async _processTag(data) {
        const json = {};

        if (data.name) {
            json.name = data.name;
        }

        if (!Utils.validateUUID(data.uuid)) {
            json.uuid = Utils.newUUID();
            while (await this.getTag({ uuid: json.uuid })) { json.uuid = Utils.newUUID() };
        }

        return json;
    }

    /**
     * @returns {Promise<import("../types/Tag")[]>}
     */
    async getTags() {
        const tags = await this.core.getDatabase().query("SELECT * FROM `tags`");
        Logger.debug(Logger.Type.TagManager, `Loaded &c${tags.length}&r tags from database`);

        return tags.map(data => new Tag(data));
    }

    /**
     * @param {import("../types/DocTypes").Tag} options
     * @returns {Promise<import("../types/Tag") | null>}
     */
    async getTag(options = {}) {
        let tag = this._getFromCache(options);

        if (!tag) {
            const tagData = await this.core.getDatabase().query("SELECT * FROM `tags` WHERE `uuid` = ? OR `name` = ?", [ options.uuid, options.name ]);

            if (!Array.isArray(tagData) || tagData.length == 0) {
                Logger.debug(Logger.Type.TagManager, `Tag &c${options.uuid || options.name}&r not found`);
                return null;
            }

            tag = new Tag(tagData[0]);
            this._addToCache(tag);
            Logger.debug(Logger.Type.TagManager, `Loaded tag &c${tag.uuid}&r from database, caching...`);
        } else {
            Logger.debug(Logger.Type.TagManager, `Found tag &c${tag.uuid || tag.name}&r in cache`);
        }

        return tag;
    }

    /**
     * @param {import("../types/DocTypes").Tag} data
     * @returns {Promise<import("../types/Tag")>}
     */
    async createTag(data) {
        let tag = await this.getTag(data);

        if (!tag) {
            tag = new Tag(await this._processTag(data));

            this.core.getDatabase().exec("INSERT INTO `tags` (`uuid`, `name`) VALUES (?, ?)", [ tag.uuid, tag.name ]);
            this._addToCache(tag);
            Logger.debug(Logger.Type.TagManager, `Created new tag &c${tag.uuid}&r, caching...`);
        } else {
            Logger.debug(Logger.Type.TagManager, `Tag &c${tag.name}&r (&c${tag.uuid}&r) already exists, skipping...`);
        }

        return tag;
    }

    createTags = async (data) => Promise.all(data.map(tag => this.createTag(tag)));
}