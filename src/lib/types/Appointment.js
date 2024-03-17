const Logger = require("../Logger");
const Utils = require("../Utils");
const APIError = require("./APIError");

module.exports = class Appointment {
    /**
     * @param {import("./DocTypes").AppointmentData} data 
     */
    constructor(data) {
        if (!Utils.validateUUID(data.uuid)) {
            throw APIError.InvalidValueType("uuid", "UUIDv4");
        }

        if (typeof data.start !== "number") {
            throw APIError.InvalidValueType("start", "number");
        }
        
        if (typeof data.end !== "number") {
            throw APIError.InvalidValueType("end", "number");
        }

        if (typeof data.firstName !== "string") {
            throw APIError.InvalidValueType("firstName", "string");
        }

        if (data.firstName.length < 1 || data.firstName.length > 50) {
            throw APIError.InvalidValueLength("firstName", 1, 50);
        }
        
        if (typeof data.lastName !== "string") {
            throw APIError.InvalidValueType("lastName", "string");
        }
        
        if (data.lastName.length < 1 || data.lastName.length > 50) {
            throw APIError.InvalidValueLength("lastName", 1, 50);
        }

        if (typeof data.location !== "string") {
            throw APIError.InvalidValueType("location", "string");
        }
        
        if (data.location.length < 1 || data.location.length > 100) {
            throw APIError.InvalidValueLength("location", 1, 100);
        }

        if (!Utils.validateEmail(data.email)) {
            throw APIError.InvalidValueType("email", "email_format");
        }

        if (!Utils.validatePhoneNumber(data.phoneNumber)) {
            throw APIError.InvalidValueType("phoneNumber", "phoneNumber_format");
        }

        if (typeof data.message !== "string") {
            throw APIError.InvalidValueType("message", "string");
        }

        if (data.message.length < 25 || data.message.length > 500) {
            throw APIError.InvalidValueLength("message", 25, 500);
        }

        this.uuid = data.uuid;
        this.start = data.start;
        this.end = data.end;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.location = data.location;
        this.email = data.email;
        this.phoneNumber = data.phoneNumber;
        this.message = data.message;

        /**
         * @type {Date}
         */
        this.startDate = new Date(this.start * 1000);
        this.startDate.setSeconds(0, 0);

        /**
         * @type {Date}
         */
        this.endDate = new Date(this.end * 1000);
        this.endDate.setSeconds(0, 0);

        if (this.startDate.getDate() != this.endDate.getDate() || this.startDate.getMonth() != this.endDate.getMonth() || this.startDate.getFullYear() != this.endDate.getFullYear()) {
            Logger.error(Logger.Type.AppointmentManager, "Appointment start and end are not on the same day.");
            throw APIError.InvalidValueType("start,end", "same_day");
        }

        if (this.startDate.getHours() < 8 || this.startDate.getHours() > 20) {
            Logger.error(Logger.Type.AppointmentManager, "Appointment start is not in the working hours of the lecturer.");
            throw APIError.InvalidValueType("start", "working_hours");
        }   

        if (this.endDate.getHours() > 20) {
            Logger.error(Logger.Type.AppointmentManager, "Appointment end is not in the working hours of the lecturer.");
            throw APIError.InvalidValueType("end", "working_hours");
        }

        if (this.startDate.getMinutes() > 0 || this.endDate.getMinutes() > 0) {
            Logger.error(Logger.Type.AppointmentManager, "Appointment cannot have minutes set.");
            throw APIError.InvalidValueType("start,end", "minutes");
        }

        if (this.startDate.getTime() >= this.endDate.getTime()) {
            Logger.error(Logger.Type.AppointmentManager, "Appointment start is after the end.");
            throw APIError.InvalidValueType("start,end", "start_after_end");
        }
    }

    /**
     * @returns {import("ics").EventAttributes}
     */
    toICS = () => ({
        start: this.start * 1000,
        end: this.end * 1000,
        title: `Výuka: ${this.firstName} ${this.lastName}`,
        description: this.message,
        location: this.location,
        organizer: { name: `${this.firstName} ${this.lastName}`, email: this.email }
    });
}