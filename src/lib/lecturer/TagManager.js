const crypto = require("crypto");
const Core = require("../Core");
const Logger = require("../Logger");
const Tag = require("./Tag");

class TagManager {
    /**
     * 
     * @param {Core} core 
     */
    constructor(core) {
        this.core = core;
    }

    generateId = () => crypto.randomUUID();

    getTags() {
        const tags = this.core.getDatabase().query("SELECT * FROM tags");
        return tags.map((tag) => new Tag(tag.uuid, tag.name));
    }

    getTagByUUID = (uuid) => this.getTags().find(tag => tag.getUUID() == uuid);

    getTagByName = (name) => this.getTags().find(tag => tag.getName() == name);

    createTag(uuid, name) {
        if (!uuid) {
            uuid = this.generateId();
        }

        if (!name) {
            throw Error("MISSING_NAME");
        }

        if (this.getTagByUUID(uuid)) {
            throw Error("TAG_ALREADY_EXISTS");
        }

        if (this.getTagByName(name)) {
            throw Error("TAG_ALREADY_EXISTS");
        }

        try {
            const tag = new Tag(uuid, name);

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