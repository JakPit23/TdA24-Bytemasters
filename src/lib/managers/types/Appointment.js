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

        if (typeof data.firstName !== "string") {
            Logger.debug(Logger.Type.LecturerManager, "Variable \"firstName\" is not a string, cannot create an appointment.");
            throw APIError.INVALID_VALUE_TYPE;
        }

        if (data.firstName.length > 50) {
            throw APIError.INVALID_VALUE_LENGTH;
        }
        
        if (typeof data.lastName !== "string") {
            Logger.debug(Logger.Type.LecturerManager, "Variable \"lastName\" is not a string, cannot create an appointment.");
            throw APIError.INVALID_VALUE_TYPE;
        }
        
        if (data.lastName.length > 50) {
            throw APIError.INVALID_VALUE_LENGTH;
        }
        
        if (typeof data.location !== "string") {
            Logger.debug(Logger.Type.LecturerManager, "Variable \"location\" is not a string, cannot create an appointment.");
            throw APIError.INVALID_VALUE_TYPE;
        }
        
        if (data.lastName.length > 100) {
            throw APIError.INVALID_VALUE_LENGTH;
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
        this.startDate.setSeconds(0, 0);

        /**
         * @type {Date}
         * @description The end date of the appointment.
         */
        this.endDate = new Date(this.end * 1000);
        this.endDate.setSeconds(0, 0);

        if (this.startDate.getDate() != this.endDate.getDate() || this.startDate.getMonth() != this.endDate.getMonth() || this.startDate.getFullYear() != this.endDate.getFullYear()) {
            Logger.error(Logger.Type.LecturerManager, "Appointment start and end are not on the same day.");
            throw APIError.INVALID_DATES;
        }

        if (this.startDate.getHours() < 8 || this.startDate.getHours() > 20) {
            Logger.error(Logger.Type.LecturerManager, "Appointment start is not in the working hours of the lecturer.");
            throw APIError.TIME_SLOT_NOT_AVAILABLE;
        }   

        if (this.endDate.getHours() > 20) {
            Logger.error(Logger.Type.LecturerManager, "Appointment end is not in the working hours of the lecturer.");
            throw APIError.TIME_SLOT_NOT_AVAILABLE;
        }

        if (this.startDate.getMinutes() > 0 || this.endDate.getMinutes() > 0) {
            Logger.error(Logger.Type.LecturerManager, "Appointment cannot have minutes set.");
            throw APIError.INVALID_DATES;
        }

        if (this.startDate.getTime() >= this.endDate.getTime()) {
            Logger.error(Logger.Type.LecturerManager, "Appointment start is after the end.");
            throw APIError.INVALID_DATES;
        }
    }

    toICS = () => ({
        start: this.start * 1000,
        end: this.end * 1000,
        title: `Výuka: ${this.firstName} ${this.lastName}`,
        description: this.message,
        location: this.location,
    });
}