const { APIError } = require("../../Errors");
const Logger = require("../../Logger");
const Event = require("./Event");

class Lecturer {
    constructor(data) {
        /** 
         * @type {string} 
         * @description The UUID of the lecturer.
         */
        this.uuid = data.uuid;

        /**
         * @type {string}
         * @description The username of the lecturer.
         */
        this.username = data.username;

        /**
         * @type {string}
         * @description The password of the lecturer.
         */
        this.password = data.password;

        /** 
         * @type {string} 
         * @description The title before the lecturer's name.
         */
        this.title_before = data.title_before;

        /** 
         * @type {string} 
         * @description The first name of the lecturer.
         */
        this.first_name = data.first_name;

        /** 
         * @type {string} 
         * @description The middle name of the lecturer.
         */
        this.middle_name = data.middle_name;

        /** 
         * @type {string} 
         * @description The last name of the lecturer.
         */
        this.last_name = data.last_name;

        /** 
         * @type {string} 
         * @description The title after the lecturer's name.
         */
        this.title_after = data.title_after;

        /** 
         * @type {string} 
         * @description The URL of the lecturer's picture.
         */
        this.picture_url = data.picture_url;

        /** 
         * @type {string} 
         * @description The location of the lecturer.
         */
        this.location = data.location;

        /** 
         * @type {string} 
         * @description The claim of the lecturer.
         */
        this.claim = data.claim;

        /** 
         * @type {string} 
         * @description The biography of the lecturer.
         */
        this.bio = data.bio;

        /** 
         * @type {number} 
         * @description The price per hour of the lecturer.
         */
        this.price_per_hour = data.price_per_hour;

        /** 
         * @type {Array<import("./Tag")>} 
         * @description The tags of the lecturer.
         */
        this.tags = data.tags;

        /** 
         * @type {Array<import("./Event")>}
         * @description The events of the lecturer.
         */
        this.events = data.events || [];

        /** 
         * @type {Object} 
         * @description The contact information of the lecturer.
         */
        this.contact = data.contact;
    }

    toJSON() {
        const { username, password, ...data } = this;
        return data;
    }

    /**
     * @param {object} data 
     * @param {string} data.firstName
     * @param {string} data.lastName
     * @param {string} data.email
     * @param {string} data.phoneNumber
     * @param {object} data.event
     * @param {string} data.event.name
     * @param {string} data.event.location
     * @param {number} data.event.start
     * @param {number} data.event.end
     */
    addEvent(data) {
        this.events.find(event => {
            if (data.event.start >= event.start && data.event.start <= event.end) {
                Logger.debug(Logger.Type.LecturerManager, "Event conflicts with existing event");
                throw APIError.EVENT_CONFLICTS_WITH_EXISTING_EVENT;
            }
        });

        const event = new Event(data);
        let index = (this.events ??= []).push(event);
     
        Logger.debug(Logger.Type.LecturerManager, `Added event to lecturer ${this.uuid}`);
        return this.events[index-1];
    }
}

module.exports = Lecturer;
