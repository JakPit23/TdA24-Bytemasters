const sanitizeHtml = require("sanitize-html");
const Core = require("../Core");
const Logger = require("../Logger");
const UUIDProcessor = require("../utils/UUIDProcessor");
const Tag = require("./Tag");

class TagManager {
    /**
     * 
     * @param {Core} core 
     */
    constructor(core) {
        this.core = core;
    }

    /**
     * @returns {Tag[]}
     */
    getTags = () => this.core.getDatabase().query("SELECT * FROM tags").map(data => new Tag(data));

    /**
     * @param {*} uuid
     * @returns {Tag}
     */
    getTagByUUID = (uuid) => this.getTags().find(tag => tag.getUUID() == uuid);

    /**
     * @param {*} name
     * @returns {Tag}
     */
    getTagByName = (name) => this.getTags().find(tag => tag.getName() == name);

    /**
     * @private
     * @param {object} data
     * @returns {object}
     */
    processTag(data) {
        const json = {};

        const allowedKeys = [
            "name"
        ];

        for (const key of allowedKeys) {
            if (!data[key]) {
                continue;
            }

            json[key] = this.sanitize(data[key]);
        }

        if (!UUIDProcessor.validateUUID(json.uuid)) {
            json.uuid = UUIDProcessor.newUUID();
            while (this.getTagByUUID(json.uuid)) json.uuid = UUIDProcessor.newUUID();
        }

        return json;
    }

    /**
     * @private
     * @param {*} dirty
     * @param {*} allowedTags
     * @returns {string}
     */
    sanitize = (dirty, allowedTags) => sanitizeHtml(dirty, { allowedTags });

    /**
     * @param {object} data
     * @returns {Tag}
     */
    createTag(data) {
        if (data == undefined) {
            throw Error("MISSING_DATA");
        }

        if (data.name == undefined) {
            throw Error("MISSING_NAME");
        }

        if (this.getTagByUUID(data.uuid)) {
            throw Error("TAG_ALREADY_EXISTS");
        }

        if (this.getTagByName(data.name)) {
            throw Error("TAG_ALREADY_EXISTS");
        }

        try {
            const processedData = this.processTag(data);
            const tag = new Tag(processedData);

            this.core.getDatabase().exec("INSERT INTO tags (uuid, name) VALUES (?, ?)", [
                tag.getUUID(),
                tag.getName()
            ]);

            return tag;
        } catch(error) {
            this.core.getLogger().error(Logger.Type.TagManager, `Failed to create tag: ${error.message}`);
            throw error;
        }
    }
}

module.exports = TagManager;