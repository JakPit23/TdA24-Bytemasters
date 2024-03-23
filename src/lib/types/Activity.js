const Utils = require("../Utils");
const APIError = require("./APIError");

module.exports = class Activity {
    /**
     * @param {import("./DocTypes").ActivityData} data 
     */
    constructor(data) {
        if (!Utils.validateUUID(data.uuid)) {
            throw APIError.InvalidValueType("uuid", "UUIDv4");
        }

        if (!Utils.validateBoolean(data.public)) {
            throw APIError.InvalidValueType("public", "boolean");
        }

        if (!Utils.validateString(data.activityName)) {
            throw APIError.InvalidValueType("activityName", "string");
        }

        if (!Utils.validateString(data.description)) {
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

        if (!Utils.validateArray(data.edLevel, "string")) {
            throw APIError.InvalidValueType("edLevel", "string[]");
        }

        if (!Utils.validateArray(data.tools, "string")) {
            throw APIError.InvalidValueType("tools", "string[]");
        }

        if (!Utils.validateArray(data.homePreparation, "object")) {
            throw APIError.InvalidValueType("homePreparation", "object[]");
        } else {
            data.homePreparation.some((item, index) => {
                if (!Utils.validateString(item.title)) {
                    throw APIError.InvalidValueType(`homePreparation[${index}].title`, "string");
                }

                if (!Utils.validateString(item.warn)) {
                    throw APIError.InvalidValueType(`homePreparation[${index}].warn`, "string");
                }

                if (!Utils.validateString(item.note)) {
                    throw APIError.InvalidValueType(`homePreparation[${index}].note`, "string");
                }
            });
        }

        if (!Utils.validateArray(data.instructions, "object")) {
            throw APIError.InvalidValueType("instructions", "object[]");
        } else {
            data.instructions.some((item, index) => {
                if (!Utils.validateString(item.title)) {
                    throw APIError.InvalidValueType(`instructions[${index}].title`, "string");
                }

                if (!Utils.validateString(item.warn)) {
                    throw APIError.InvalidValueType(`instructions[${index}].warn`, "string");
                }

                if (!Utils.validateString(item.note)) {
                    throw APIError.InvalidValueType(`instructions[${index}].note`, "string");
                }
            });
        }

        if (!Utils.validateArray(data.agenda, "object")) {
            throw APIError.InvalidValueType("agenda", "object[]");
        } else {
            data.agenda.some((item, index) => {
                if (!Utils.validateNumber(item.duration)) {
                    throw APIError.InvalidValueType(`agenda[${index}].duration`, "number");
                }

                if (!Utils.validateString(item.title)) {
                    throw APIError.InvalidValueType(`agenda[${index}].title`, "string");
                }

                if (!Utils.validateString(item.description)) {
                    throw APIError.InvalidValueType(`agenda[${index}].description`, "string");
                }
            });
        }

        if (!Utils.validateArray(data.links, "object")) {
            throw APIError.InvalidValueType("links", "object[]");
        } else {
            data.links.some((item, index) => {
                if (!Utils.validateString(item.title)) {
                    throw APIError.InvalidValueType(`links[${index}].title`, "string");
                }

                if (!Utils.validateString(item.url)) {
                    throw APIError.InvalidValueType(`links[${index}].url`, "string");
                }
            });
        }

        if (!Utils.validateArray(data.gallery, "object")) {
            throw APIError.InvalidValueType("gallery", "object[]");
        } else {
            data.gallery.some((item, index) => {
                if (!Utils.validateString(item.title)) {
                    throw APIError.InvalidValueType(`gallery[${index}].title`, "string");
                }

                if (!Utils.validateArray(item.images, "object")) {
                    throw APIError.InvalidValueType(`gallery[${index}].images`, "object[]");
                }

                item.images.some((image, imageIndex) => {
                    if (!Utils.validateString(image.lowRes)) {
                        throw APIError.InvalidValueType(`gallery[${index}].images[${imageIndex}].lowRes`, "string");
                    }

                    if (!Utils.validateString(image.highRes)) {
                        throw APIError.InvalidValueType(`gallery[${index}].images[${imageIndex}].highRes`, "string");
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
}