const { APIError } = require("../../Errors");
const Logger = require("../../Logger");
const Utils = require("../../Utils");

class Event {
    constructor(data) {
        if (typeof data.firstName !== "string") {
            Logger.debug(Logger.Type.LecturerManager, "Invalid first name for adding event to lecturer");
            throw APIError.INVALID_FIRST_NAME;
        }

        if (typeof data.lastName !== "string") {
            Logger.debug(Logger.Type.LecturerManager, "Invalid last name for adding event to lecturer");
            throw APIError.INVALID_LAST_NAME;
        }

        if (!Utils.validateEmail(data.email)) {
            Logger.debug(Logger.Type.LecturerManager, "Invalid email for adding event to lecturer");
            throw APIError.INVALID_EMAIL;
        }

        if (!Utils.validatePhoneNumber(data.phoneNumber)) {
            Logger.debug(Logger.Type.LecturerManager, "Invalid phone number for adding event to lecturer");
            throw APIError.INVALID_PHONE_NUMBER;
        }

        if (typeof data.event.name !== "string") {
            Logger.debug(Logger.Type.LecturerManager, "Invalid event name for adding event to lecturer");
            throw APIError.INVALID_EVENT_NAME;
        }

        if (typeof data.event.location !== "string") {
            Logger.debug(Logger.Type.LecturerManager, "Invalid event location for adding event to lecturer");
            throw APIError.INVALID_EVENT_LOCATION;
        }

        if (typeof data.event.start !== "number") {
            Logger.debug(Logger.Type.LecturerManager, "Invalid event start date for adding event to lecturer");
            throw APIError.INVALID_EVENT_START_DATE;
        }
        
        if (typeof data.event.end !== "number") {
            Logger.debug(Logger.Type.LecturerManager, "Invalid event end date for adding event to lecturer");
            throw APIError.INVALID_EVENT_END_DATE;
        }
        
        if (data.event.start > data.event.end || data.event.start == data.event.end) {
            Logger.debug(Logger.Type.LecturerManager, "Invalid event dates for adding event to lecturer");
            throw APIError.INVALID_EVENT_DATES;
        }
        
        /**
         * @type {string}
         * @description The first name of the person who created the event.
         */
        this.firstName = data.firstName;

        /**
         * @type {string}
         * @description The last name of the person who created the event.
         */
        this.lastName = data.lastName;

        /**
         * @type {string}
         * @description The email of the person who created the event.
         */
        this.email = data.email;

        /**
         * @type {string}
         * @description The phone number of the person who created the event.
         */
        this.phoneNumber = data.phoneNumber;

        /**
         * @type {string}
         * @description The name of the event.
         */
        this.name = data.event.name;

        /**
         * @type {string}
         * @description The location of the event.
         */
        this.location = data.event.location;

        /**
         * @type {number}
         * @description The start date of the event.
         */
        this.start = data.event.start;

        /**
         * @type {number}
         * @description The end date of the event.
         */
        this.end = data.event.end;
        
        this.startDate = new Date(this.start);
        this.endDate = new Date(this.end);
    }

    toJSON = () => ({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phoneNumber: this.phoneNumber,
        event: {
            name: this.name,
            location: this.location,
            start: this.start,
            end: this.end
        }
    })

    /**
     * @returns {import("ics").EventAttributes}
     */
    toICSFormat = () => ({
        duration: { hours: this.endDate.getHours() - this.startDate.getHours(), minutes: this.endDate.getMinutes() - this.startDate.getMinutes() },
        attendees: [ { name: `${this.firstName} ${this.lastName}`, email: this.email } ], 
        location: this.location,
        title: this.name,
        start: [ this.startDate.getFullYear(), this.startDate.getMonth() + 1, this.startDate.getDate(), this.startDate.getHours(), this.startDate.getMinutes() ],
        end: [ this.endDate.getFullYear(), this.endDate.getMonth() + 1, this.endDate.getDate(), this.endDate.getHours(), this.endDate.getMinutes() ]
    })
}

module.exports = Event;