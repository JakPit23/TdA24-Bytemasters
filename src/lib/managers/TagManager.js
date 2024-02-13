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
         * @type {Tag[]}
         */
        this._cache = [];
    }


    /**
     * @returns {Promise<Tag[]>}
     */
    getTags = async () => {
        const tags = await this.core.getDatabase().query("SELECT * FROM `tags`");
        Logger.debug(Logger.Type.TagManager, `Loaded ${tags.length} tags from database`);

        return tags.map(tagData => new Tag(tagData));
    }

    /**
     * @param {import("./types/Tag").TagData} options
     * @returns {Promise<Tag | null>}
     */
    getTag = async (options = {}) => {
        const { uuid, name } = options;
        let tag = this._cache.find(tag => tag.uuid == uuid || tag.name == name);
        Logger.debug(Logger.Type.TagManager, `Cache hit for tag ${tag ? tag.uuid : "null"}`);

        if (!tag) {
            const tagData = await this.core.getDatabase().query("SELECT * FROM `tags` WHERE `uuid` = ? OR `name` = ?", [ uuid, name ]);

            if (!Array.isArray(tagData) || tagData.length == 0) {
                Logger.debug(Logger.Type.TagManager, `No tag found for ${uuid || name}`);
                return null;
            }

            tag = new Tag(tagData[0]);
            this._cache.push(tag);
            Logger.debug(Logger.Type.TagManager, `Loaded tag ${tagData[0].uuid} from database, caching...`);
        }

        return tag;
    }

    /**
     * @private
     * @param {object} data
     * @returns {object}
     */
    _processTag = (data) => {
        const json = {};
        const allowedKeys = [ "name" ];

        for (const key of allowedKeys) {
            if (!data[key]) {
                continue;
            }

            json[key] = this._sanitize(data[key]);
        }

        if (!UUIDProcessor.validateUUID(json.uuid)) {
            Logger.debug(Logger.Type.TagManager, `Invalid UUID provided, generating new one...`);

            json.uuid = UUIDProcessor.newUUID();
            while (this.getTag({ uuid })) { json.uuid = UUIDProcessor.newUUID() };

            Logger.debug(Logger.Type.TagManager, `Generated new UUID: ${json.uuid}`);
        }

        return json;
    }

    /**
     * @private
     * @param {string} dirty
     * @param {string[]} allowedTags
     * @returns {string}
     */
    _sanitize = (dirty, allowedTags) => sanitizeHtml(dirty, { allowedTags });

    /**
     * @param {object} data
     * @returns {Tag}
     */
    createTag = (data) => {
        // TODO: udelat custom error classu
        if (!data) {
            throw Error("MISSING_DATA");
        }

        if (!data.name) {
            throw Error("MISSING_NAME");
        }

        if (this.getTag({ uuid: data.uuid, name: data.name })) {
            throw Error("TAG_ALREADY_EXISTS");
        }

        try {
            const tag = new Tag(this._processTag(data));

            this.core.getDatabase().exec("INSERT INTO tags (uuid, name) VALUES (?, ?)", [ tag.uuid, tag.name ]);
            Logger.debug(Logger.Type.UserManager, "Created new tag", { uuid: tag.uuid, name: tag.name });

            return tag;
        } catch (error) {
            Logger.error(Logger.Type.TagManager, "An unknown error occured while creating tag:", error);
            throw error;
        }
    }
}

module.exports = TagManager;