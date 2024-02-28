const { APIError } = require("../../Errors");
const Logger = require("../../Logger");
const Appointment = require("./Appointment");

module.exports = class Reservation {
    constructor(data) {
        if (!data) {
            throw APIError.MISSING_REQUIRED_VALUES;
        }

        if (typeof data.start !== "number") {
            Logger.debug(Logger.Type.LecturerManager, "Variable \"start\" is not a number, cannot create a reservation.");
            throw APIError.INVALID_VALUE_TYPE;
        }
        
        if (typeof data.end !== "number") {
            Logger.debug(Logger.Type.LecturerManager, "Variable \"end\" is not a number, cannot create a reservation.");
            throw APIError.INVALID_VALUE_TYPE;
        }
        
        if (data.start > data.end || data.start == data.end) {
            Logger.debug(Logger.Type.LecturerManager, "Variable \"start\" is greater than \"end\", cannot create a reservation.");
            throw APIError.INVALID_DATES;
        }

        // Appointments
        if (data.appointments && Array.isArray(data.appointments)) {
            this.appointments = data.appointments.map(appointment => new Appointment(appointment));
        } else {
            this.appointments = [];
        }

        /**
         * @type {number}
         * @description The start date of the reservation.
         */
        this.start = data.start;
        this.startDate = new Date(this.start * 1000);

        /**
         * @type {number}
         * @description The end date of the reservation.
         */
        this.end = data.end;
        this.endDate = new Date(this.end * 1000);
    }

    toJSON = () => ({
        start: this.start,
        end: this.end,
        appointments: this.appointments
    })

    isAppointmentConflict = (appointment) => this.appointments.find(existingAppointment => appointment.start >= existingAppointment.start && appointment.start <= existingAppointment.end)

    createAppointment(data) {
        const appointment = new Appointment(data);
        if (this.isAppointmentConflict(appointment)) {
            throw APIError.TIME_SLOT_NOT_AVAILABLE;
        }
        
        this.appointments.push(appointment);
        return appointment;
    }
}