const sanitizeHtml = require("sanitize-html");
const Logger = require("../Logger");
const UUIDProcessor = require("../utils/UUIDProcessor");
const Tag = require("./types/Tag");

class TagManager {
    /**
     * @param {import("../Core")} core 
     */
    constructor(core) {
        this.core = core;

        /**
         * @private
         * @type {import("./types/Tag")[]}
         */
        this._cache = [];
    }

    /**
     * @private
     * @param {string} data
     * @returns {string}
     */
    _sanitize = (data) => sanitizeHtml(data, { allowedTags: [] });


    /**
     * @private
     * @param {object} data
     * @returns {object}
     */
    _processTag = async (data) => {
        const json = {};

        if (data.name) {
            json.name = this._sanitize(data.name);
        }

        if (!UUIDProcessor.validateUUID(data.uuid)) {
            json.uuid = UUIDProcessor.newUUID();
            while (await this.getTag({ uuid: json.uuid })) { json.uuid = UUIDProcessor.newUUID() };

            Logger.debug(Logger.Type.TagManager, `Generated new UUID: ${json.uuid}`);
        }

        return json;
    }

    /**
     * @returns {Promise<import("./types/Tag")[]>}
     */
    getTags = async () => {
        // TODO: (asi) pridat cteni z cache
        const tags = await this.core.getDatabase().query("SELECT * FROM `tags`");
        Logger.debug(Logger.Type.TagManager, `Loaded ${tags.length} tags from database`);

        return tags.map(tagData => new Tag(tagData));
    }

    /**
     * @param {import("./types/Tag")} options
     * @returns {Promise<import("./types/Tag") | null>}
     */
    getTag = async (options = {}) => {
        const { uuid, name } = options;
        let tag = this._cache.find(tag => tag.uuid == uuid || tag.name == name);

        if (!tag) {
            const tagData = await this.core.getDatabase().query("SELECT * FROM `tags` WHERE `uuid` = ? OR `name` = ?", [ uuid, name ]);

            if (!Array.isArray(tagData) || tagData.length == 0) {
                Logger.debug(Logger.Type.TagManager, `Tag "${uuid || name}" not found`);
                return null;
            }

            tag = new Tag(tagData[0]);
            this._cache.push(tag);
            Logger.debug(Logger.Type.TagManager, `Loaded tag ${tag.uuid} from database, caching...`);
        } else {
            Logger.debug(Logger.Type.TagManager, `Found tag ${tag?.name || tag?.uuid} in cache`);
        }

        return tag;
    }

    /**
     * @param {import("./types/Tag")} data
     * @returns {Promise<Tag>}
     */
    createTag = async (data) => {
        // TODO: udelat custom error classu
        if (!data) {
            throw Error("MISSING_DATA");
        }

        if (!data.name) {
            throw Error("MISSING_NAME");
        }
        
        try {
            const processedData = await this._processTag(data);
            let tag = await this.getTag({ uuid: processedData.uuid, name: processedData.name });

            if (!tag) {
                tag = new Tag(processedData);
    
                this.core.getDatabase().exec("INSERT INTO tags (uuid, name) VALUES (?, ?)", [ tag.uuid, tag.name ]);
                this._cache.push(tag);
                Logger.debug(Logger.Type.TagManager, `Created new tag "${tag.uuid}" with name "${tag.name}", caching...`);
            } else {
                Logger.debug(Logger.Type.TagManager, `Tag "${tag.uuid}" already exists`);
            }

            return tag;
        } catch (error) {
            Logger.error(Logger.Type.TagManager, "An unknown error occured while creating tag:", error);
            throw error;
        }
    }
}

module.exports = TagManager;