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

    generateId() {
        return crypto.randomUUID();
    }

    getTags() {
        const tags = this.core.getDatabase().query("SELECT * FROM tags");
        return tags.map((tag) => new Tag(tag.id, tag.name));
    }

    getTagById(id) {
        const tags = this.getTags();
        return tags.find(tag => tag.getId() == id);
    }

    getTagByName(name) {
        const tags = this.getTags();
        return tags.find(tag => tag.getName() == name);
    }

    createTag(id, name) {
        if (!id) {
            id = this.generateId();
        }

        if (!name) {
            throw Error("MISSING_NAME");
        }

        if (this.getTagById(id)) {
            throw Error("TAG_ALREADY_EXISTS");
        }

        if (this.getTagByName(name)) {
            throw Error("TAG_ALREADY_EXISTS");
        }

        try {
            const tag = new Tag(id, name);

            this.core.getDatabase().exec("INSERT INTO tags (id, name) VALUES (?, ?)", [
                tag.getId(),
                tag.getName()
            ]);

            return tag;
        } catch(error) {
            Logger.error(Logger.Type.TagManager, `Failed to create tag: ${error.message}`);
            throw error;
        }
    }
}

module.exports = TagManager;