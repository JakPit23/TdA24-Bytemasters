const { APIError } = require("../../Errors");
const Logger = require("../../Logger");
const Reservation = require("./Reservation");

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
         * @type {Array<import("./Reservation")>}
         * @description The events of the lecturer.
         */
        this.reservations = data.reservations || [];
    }

    toJSON() {
        const { username, password, ...data } = this;
        return data;
    }

    addReservation(data) {
        const reservation = new Reservation(data);

        this.reservations.find(reservation => {
            if (data.start >= reservation.start && data.start <= reservation.end) {
                Logger.debug(Logger.Type.LecturerManager, "Reservation conflicts with existing reservation");
                
                throw APIError.TIME_CONFLICT;
            }
        });

        let index = (this.reservations ??= []).push(reservation);
     
        Logger.debug(Logger.Type.LecturerManager, `Added reservation to lecturer ${this.uuid}`);
        return this.reservations[index-1];
    }

    addReservations = (data) => data.forEach(reservation => this.addReservation(reservation));

    createAppointment(data) {
        const reservation = this.reservations.find(reservation => data.start >= reservation.start && data.end <= reservation.end);
        if (!reservation) {
            throw APIError.RESERVATION_NOT_FOUND;
        }

        const appointment = reservation.createAppointment(data);
        return appointment;
    }
}

module.exports = Lecturer;
