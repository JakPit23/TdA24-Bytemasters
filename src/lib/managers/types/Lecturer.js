const { APIError } = require("../../Errors");
const Appointment = require("./Appointment");

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
         * @type {Object} 
         * @description The contact information of the lecturer.
         */
        this.contact = data.contact;

        /** 
         * @type {Array<import("./Appointment")>}
         * @description The events of the lecturer.
         */
        this.appointments = data.appointments || [];
    }

    toJSON() {
        const { username, password, ...data } = this;
        return data;
    }

    /**
     * @private
     * @param {Appointment} appointment 
     * @returns {boolean}
     */
    _isAppointmentConflict = (appointment) => this.appointments
        .find(existingAppointment => appointment.startDate < existingAppointment.endDate && appointment.endDate > existingAppointment.startDate)

    /**
     * @param {Object} data
     * @returns {Appointment}
     */
    createAppointment(data) {
        const appointment = new Appointment(data);
        if (this._isAppointmentConflict(appointment)) {
            throw APIError.TIME_SLOT_NOT_AVAILABLE;
        }

        this.appointments.push(appointment);
        return appointment;
    }
    
    /**
     * @param {Appointment} appointment 
     */
    deleteAppointment = (appointment) => this.appointments = this.appointments.filter(existingAppointment => existingAppointment.start != appointment.start && existingAppointment.end != appointment.end)

    /**
     * @param {Array<Appointment>} appointments 
     */
    deleteAppointments = (appointments) => appointments.forEach(this.deleteAppointment);
}

module.exports = Lecturer;
