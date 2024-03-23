const Utils = require("../Utils");
const APIError = require("./APIError");

module.exports = class Activity {
    /**
     * @param {import("./DocTypes").ActivityData} data 
     */
    constructor(data) {
        this.parseData(data);
    }
    
    /**
     * @param {import("./DocTypes").ActivityData} data 
     */
    parseData(data) {
        if (!Utils.validateUUID(data.uuid)) {
            throw APIError.InvalidValueType("uuid", "UUIDv4");
        }

        if (!Utils.validateBoolean(data.public)) {
            throw APIError.InvalidValueType("public", "boolean");
        }

        if (!Utils.validateString(data.activityName)) {
            throw APIError.InvalidValueType("activityName", "string");
        }

        if (data.description && !Utils.validateString(data.description)) {
            throw APIError.InvalidValueType("description", "string");
        }

        if (!Utils.validateArray(data.objectives, "string")) {
            throw APIError.InvalidValueType("objectives", "string[]");
        }

        if (!Utils.validateString(data.classStructure)) {
            throw APIError.InvalidValueType("classStructure", "string");
        }

        if (!Utils.validateNumber(data.lengthMin)) {
            throw APIError.InvalidValueType("lengthMin", "number");
        }

        if (!Utils.validateNumber(data.lengthMax)) {
            throw APIError.InvalidValueType("lengthMax", "number");
        }

        if (data.edLevel && !Utils.validateArray(data.edLevel, "string")) {
            throw APIError.InvalidValueType("edLevel", "string[]");
        }

        if (data.tools && !Utils.validateArray(data.tools, "string")) {
            throw APIError.InvalidValueType("tools", "string[]");
        }

        if (data.homePreparation) {
            if (!Utils.validateArray(data.homePreparation, "object")) {
                throw APIError.InvalidValueType("homePreparation", "object[]");
            }
            
            data.homePreparation.some((item, index) => {
                if (!Utils.validateString(item.title)) {
                    throw APIError.InvalidValueType(`homePreparation[${index}].title`, "string");
                }

                if (item.warn && !Utils.validateString(item.warn)) {
                    throw APIError.InvalidValueType(`homePreparation[${index}].warn`, "string");
                }

                if (item.note && !Utils.validateString(item.note)) {
                    throw APIError.InvalidValueType(`homePreparation[${index}].note`, "string");
                }
            });
        }

        if (data.instructions) {
            if (!Utils.validateArray(data.instructions, "object")) {
                throw APIError.InvalidValueType("instructions", "object[]");
            }

            data.instructions.some((item, index) => {
                if (!Utils.validateString(item.title)) {
                    throw APIError.InvalidValueType(`instructions[${index}].title`, "string");
                }

                if (item.warn && !Utils.validateString(item.warn)) {
                    throw APIError.InvalidValueType(`instructions[${index}].warn`, "string");
                }

                if (item.note && !Utils.validateString(item.note)) {
                    throw APIError.InvalidValueType(`instructions[${index}].note`, "string");
                }
            });
        }

        if (data.agenda) {
            if (!Utils.validateArray(data.agenda, "object")) {
                throw APIError.InvalidValueType("agenda", "object[]");
            }

            data.agenda.some((item, index) => {
                if (!Utils.validateNumber(item.duration)) {
                    throw APIError.InvalidValueType(`agenda[${index}].duration`, "number");
                }

                if (!Utils.validateString(item.title)) {
                    throw APIError.InvalidValueType(`agenda[${index}].title`, "string");
                }

                if (item.description && !Utils.validateString(item.description)) {
                    throw APIError.InvalidValueType(`agenda[${index}].description`, "string");
                }
            });
        }

        if (data.links) {
            if (!Utils.validateArray(data.links, "object")) {
                throw APIError.InvalidValueType("links", "object[]");
            }
    
            data.links.some((item, index) => {
                if (!Utils.validateString(item.title)) {
                    throw APIError.InvalidValueType(`links[${index}].title`, "string");
                }

                if (item.url && !Utils.validateString(item.url)) {
                    throw APIError.InvalidValueType(`links[${index}].url`, "string");
                }
            });
        }

        if (data.gallery) {
            if (!Utils.validateArray(data.gallery, "object")) {
                throw APIError.InvalidValueType("gallery", "object[]");
            }

            data.gallery.some((item, index) => {
                if (!Utils.validateString(item.title)) {
                    throw APIError.InvalidValueType(`gallery[${index}].title`, "string");
                }

                if (!Utils.validateArray(item.images, "object")) {
                    throw APIError.InvalidValueType(`gallery[${index}].images`, "object[]");
                }

                item.images.some((image, imageIndex) => {
                    if (image.lowRes && !Utils.validateString(image.lowRes)) {
                        throw APIError.InvalidValueType(`gallery[${index}].images[${imageIndex}].lowRes`, "string");
                    }

                    if (image.highRes && !Utils.validateString(image.highRes)) {
                        throw APIError.InvalidValueType(`gallery[${index}].images[${imageIndex}].highRes`, "string");
                    }

                    if (!(image.lowRes || image.highRes)) {
                        throw APIError.InvalidValueType(`gallery[${index}].images[${imageIndex}]["lowRes" or "highRes"]`, "string");
                    }
                });
            });
        }

        this.uuid = data.uuid;
        this.public = data.public;
        this.activityName = data.activityName;
        this.description = data.description;
        this.objectives = data.objectives;
        this.classStructure = data.classStructure;
        this.lengthMin = data.lengthMin;
        this.lengthMax = data.lengthMax;
        this.edLevel = data.edLevel;
        this.tools = data.tools;
        this.homePreparation = data.homePreparation;
        this.instructions = data.instructions;
        this.agenda = data.agenda;
        this.links = data.links;
        this.gallery = data.gallery;
    }

    edit(data) {
        this.parseData({ ...this, ...data });
    }
}