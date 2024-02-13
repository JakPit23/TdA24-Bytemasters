/**
 * @typedef {Object} TagData
 * @property {string} uuid - The UUID of the tag.
 * @property {string} name - The name of the tag.
 */

class Tag {
    /**
     * @param {TagData} data
     */
    constructor(data) {
        this.uuid = data.uuid;
        this.name = data.name;
    }
}

module.exports = Tag;