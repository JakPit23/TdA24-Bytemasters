class Tag {
    constructor(uuid, name) {
        this.uuid = uuid;
        this.name = name;
    }

    getUUID() {
        return this.uuid;
    }

    getName() {
        return this.name;
    }
}

module.exports = Tag;