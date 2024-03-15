class Tag {
    constructor(data) {
        /**
         * @type {string}
         * @description The UUID of the tag.
         * @example "f7b3e3e0-3e3e-4e3e-8e3e-3e3e3e3e3e3e"
         */
        this.uuid = data.uuid;

        /**
         * @type {string}
         * @description The name of the tag.
         */
        this.name = data.name;
    }
}

module.exports = Tag;