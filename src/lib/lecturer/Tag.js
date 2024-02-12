// TODO: cely todle predelat na zpusob User
class Tag {
    /**
     * 
     * @param {Object} data
     * @param {string} data.uuid
     * @param {string} data.name
     */
    constructor(data) {
        this.data = data;
    }

    toJSON = () => ({
        uuid: this.getUUID(),
        name: this.getName()
    });
    
    /**
     * 
     * @returns {string}
     */
    getUUID = () => this.data?.uuid;

    /**
     * 
     * @returns {string}
     */
    getName = () => this.data?.name;
}

module.exports = Tag;