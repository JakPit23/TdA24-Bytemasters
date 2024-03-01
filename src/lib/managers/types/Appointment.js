const { APIError } = require("../../Errors");
const Logger = require("../../Logger");
const Utils = require("../../Utils");

module.exports = class Appointment {
    constructor(data) {
        if (typeof data.start !== "number") {
            Logger.debug(Logger.Type.LecturerManager, "Variable \"start\" is not a number, cannot create an appointment.");
            throw APIError.INVALID_VALUE_TYPE;
        }
        
        if (typeof data.end !== "number") {
            Logger.debug(Logger.Type.LecturerManager, "Variable \"end\" is not a number, cannot create an appointment.");
            throw APIError.INVALID_VALUE_TYPE;
        }

        if (data.start > data.end || data.start == data.end) {
            Logger.debug(Logger.Type.LecturerManager, "Variable \"start\" is greater than \"end\", cannot create an appointment.");
            throw APIError.INVALID_DATES;
        }

        if (typeof data.firstName !== "string") {
            Logger.debug(Logger.Type.LecturerManager, "Variable \"firstName\" is not a string, cannot create an appointment.");
            throw APIError.INVALID_VALUE_TYPE;
        }

        if (typeof data.lastName !== "string") {
            Logger.debug(Logger.Type.LecturerManager, "Variable \"lastName\" is not a string, cannot create an appointment.");
            throw APIError.INVALID_VALUE_TYPE;
        }

        if (typeof data.location !== "string") {
            Logger.debug(Logger.Type.LecturerManager, "Variable \"location\" is not a string, cannot create an appointment.");
            throw APIError.INVALID_VALUE_TYPE;
        }

        if (!Utils.validateEmail(data.email)) {
            Logger.debug(Logger.Type.LecturerManager, "Variable \"email\" is not a valid email, cannot create an appointment.");
            throw APIError.INVALID_VALUE_TYPE;
        }

        if (!Utils.validatePhoneNumber(data.phoneNumber)) {
            Logger.debug(Logger.Type.LecturerManager, "Variable \"phoneNumber\" is not a valid phone number, cannot create an appointment.");
            throw APIError.INVALID_VALUE_TYPE;
        }

        if (typeof data.message !== "string") {
            Logger.debug(Logger.Type.LecturerManager, "Variable \"message\" is not a string, cannot create an appointment.");
            throw APIError.INVALID_VALUE_TYPE;
        }

        if (data.message.length > 500) {
            throw APIError.INVALID_VALUE_LENGTH;
        }

        /**
         * @type {number}
         * @description The unix start of the appointment.
         */
        this.start = data.start;

        /**
         * @type {number}
         * @description The unix end of the appointment.
         */
        this.end = data.end;
        
        /**
         * @type {string}
         * @description The first name of the person.
         */
        this.firstName = data.firstName;

        /**
         * @type {string}
         * @description The last name of the person.
         */
        this.lastName = data.lastName;

        /**
         * @type {string}
         * @description The location of the appointment.
         */
        this.location = data.location;

        /**
         * @type {string}
         * @description The email of the person.
         */
        this.email = data.email;

        /**
         * @type {string}
         * @description The phone number of the person.
         */
        this.phoneNumber = data.phoneNumber;

        /**
         * @type {string}
         * @description The message from the person for lecturer.
         */
        this.message = data.message;

        /**
         * @type {Date}
         * @description The start date of the appointment.
         */
        this.startDate = new Date(this.start * 1000);
        // If the appointment is not in the working hours of the lecturer, throw an error.
        if (this.startDate.getHours() > 19 || this.startDate.getHours() < 8) {
            Logger.error(Logger.Type.LecturerManager, "Appointment is not in the working hours of the lecturer.");
            throw APIError.TIME_SLOT_NOT_AVAILABLE;
        }

        /**
         * @type {Date}
         * @description The end date of the appointment.
         */
        this.endDate = new Date(this.end * 1000);
    }

    toICS = () => ({
        start: this.start * 1000,
        end: this.end * 1000,
        title: `Výuka: ${this.firstName} ${this.lastName}`,
        description: this.message,
        location: this.location,
    });
}