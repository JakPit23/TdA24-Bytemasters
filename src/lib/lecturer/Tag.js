class Tag {
    constructor(uuid, name) {
        this.uuid = uuid;
        this.name = name;
    }

    getUUID = () => this.uuid;

    getName = () => this.name;
}

module.exports = Tag;