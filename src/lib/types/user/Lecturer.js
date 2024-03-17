const Utils = require("../../Utils");
const APIError = require("../APIError");
const Appointment = require("../Appointment");
const Tag = require("../Tag");
const User = require("./User");

class Lecturer extends User {
    /**
     * @param {import("../DocTypes").UserData & import("../DocTypes").LecturerData} data 
     */
    constructor(data) {
        super(data);

        this.parseData(data);
    }

    toJSON = () => {
        const { uuid, title_before, first_name, middle_name, last_name, title_after, picture_url, location, claim, bio, price_per_hour, contact, tags, appointments } = this;
        return { ...super.toJSON(), uuid, title_before, first_name, middle_name, last_name, title_after, picture_url, location, claim, bio, price_per_hour, contact, tags, appointments };
    }

    /**
     * @param {import("../DocTypes").UserData & import("../DocTypes").LecturerData} data 
     */
    parseData(data) {
        if (data.title_before) {
            if (typeof data.title_before !== "string") {
                throw APIError.InvalidValueType("title_before", "string");
            }

            if (data.title_before.length < 1 || data.title_before.length > 32) {
                throw APIError.InvalidValueLength("title_before", 1, 32);
            }
        }

        if (typeof data.first_name !== "string") {
            throw APIError.InvalidValueType("first_name", "string");
        }

        if (data.first_name.length < 1 || data.first_name.length > 32) {
            throw APIError.InvalidValueLength("first_name", 1, 32);
        }

        if (data.middle_name) {
            if (typeof data.middle_name !== "string") {
                throw APIError.InvalidValueType("middle_name", "string");
            }
    
            if (data.middle_name.length < 1 || data.middle_name.length > 32) {
                throw APIError.InvalidValueLength("middle_name", 1, 32);
            }
        }

        if (typeof data.last_name !== "string") {
            throw APIError.InvalidValueType("last_name", "string");
        }

        if (data.last_name.length < 1 || data.last_name.length > 32) {
            throw APIError.InvalidValueLength("last_name", 1, 32);
        }

        if (data.title_after) {
            if (typeof data.title_after !== "string") {
                throw APIError.InvalidValueType("title_after", "string");
            }

            if (data.title_after.length < 1 || data.title_after.length > 32) {
                throw APIError.InvalidValueLength("title_after", 1, 32);
            }
        }

        if (data.picture_url) {
            if (typeof data.picture_url !== "string") {
                throw APIError.InvalidValueType("picture_url", "string");
            }
    
            if (data.picture_url.length > 256) {
                throw APIError.InvalidValueLength("picture_url", 0, 256);
            }
        }

        if (data.location) {
            if (typeof data.location !== "string") {
                throw APIError.InvalidValueType("location", "string");
            }
            
            if (data.location.length < 1 || data.location.length > 128) {
                throw APIError.InvalidValueLength("location", 1, 128);
            }
        }

        if (data.claim) {
            if (typeof data.claim !== "string") {
                throw APIError.InvalidValueType("claim", "string");
            }

            if (data.claim.length > 256) {
                throw APIError.InvalidValueLength("claim", 0, 256);
            }
        }

        if (data.bio) {
            if (typeof data.bio !== "string") {
                throw APIError.InvalidValueType("bio", "string");
            }

            if (data.bio.length > 4000) {
                throw APIError.InvalidValueLength("bio", 0, 4000);
            }
        }

        if (data.price_per_hour && typeof data.price_per_hour !== "number") {
            throw APIError.InvalidValueType("price_per_hour", "number");
        }

        if (typeof data.contact !== "object") {
            throw APIError.InvalidValueType("contact", "object<emails: string[], telephone_numbers: string[]>");
        }

        if (Array.isArray(data.contact.emails) || Array.isArray(data.contact.telephone_numbers)) {
            if (Array.isArray(data.contact.emails)) {
                if (data.contact.emails.length == 0) {
                    throw APIError.InvalidValueLength("contact.emails", 1);
                }
    
                data.contact.emails.some((email, index, array) => {
                    if (!Utils.validateEmail(email)) {
                        throw APIError.InvalidValueType(`contact.emails[${index}]`, "email_format");
                    }

                    if (array.includes(email, index+1)) {
                        throw APIError.DuplicateValue("contact.emails");
                    }
                });
            }

            if (Array.isArray(data.contact.telephone_numbers)) {
                if (data.contact.telephone_numbers.length == 0) {
                    throw APIError.InvalidValueLength("contact.telephone_numbers", 1);
                }

                data.contact.telephone_numbers.some((phoneNumber, index, array) => {
                    if (!Utils.validatePhoneNumber(phoneNumber)) {
                        throw APIError.InvalidValueType(`contact.telephone_numbers[${index}]`, "phoneNumber_format");
                    }

                    if (array.includes(phoneNumber, index+1)) {
                        throw APIError.DuplicateValue("contact.telephone_numbers");
                    }
                });
            }
        } else {
            throw APIError.InvalidValueType("contact", "object<emails: string[], telephone_numbers: string[]>");
        }

        if (Array.isArray(data.tags)) {
            data.tags = data.tags.map((_data, index, array) => {
                data.tags.reduce((acc, tag, index) => {
                    if (acc[tag.name]) {
                        throw APIError.DuplicateValue(`tags[${index}]`);
                    }

                    acc[tag.name] = tag;
                    return acc;
                }, {});

                return _data;
            });
        }

        if (data.appointments) {
            if (Array.isArray(data.appointments)) {
                data.appointments.some((appointment, index, array) => {
                    if (!(appointment instanceof Appointment)) {
                        throw APIError.InvalidValueType(`appointments[${index}]`, "Appointment");
                    }
                });
            } else {
                throw APIError.InvalidValueType("appointments", "array<Appointment>");
            }
        }

        this.title_before = data.title_before;
        this.first_name = data.first_name;
        this.middle_name = data.middle_name;
        this.last_name = data.last_name;
        this.title_after = data.title_after;
        this.picture_url = data.picture_url;
        this.location = data.location;
        this.claim = data.claim;
        this.bio = data.bio;
        this.price_per_hour = data.price_per_hour;
        this.contact = data.contact;
        
        /** @type {import("../Tag")[]} */
        this.tags = data.tags;

        /** @type {import("../Appointment")[]} */
        this.appointments = data.appointments || [];
    }

    edit(data) {
        this.parseData({ ...this, ...data });
    }

    /**
     * @private
     * @param {import("../Appointment")} appointment
     * @returns {boolean}
     */
    _isAppointmentConflict = (appointment) => this.appointments
        .find(existingAppointment => appointment.startDate < existingAppointment.endDate && appointment.endDate > existingAppointment.startDate)

    /**
     * @param {import("../DocTypes").AppointmentData} data
     * @returns {import("../Appointment")}
     */
    createAppointment(data) {
        if (!Utils.validateUUID(data.uuid)) {
            data.uuid = Utils.newUUID();
        }

        const appointment = new Appointment(data);
        if (this._isAppointmentConflict(appointment)) {
            throw APIError.TimeSlotNotAvailable;
        }
        
        this.appointments.push(appointment);
        return appointment;
    }

    getAppointment = (uuid) => this.appointments.find(appointment => appointment.uuid == uuid);

    /**
     * @param {string} uuid 
     */
    deleteAppointment(uuid) {
        const appointment = this.getAppointment(uuid);
        if (!appointment) {
            throw APIError.AppointmentNotFound;
        }

        this.appointments = this.appointments.filter(appointment => appointment.uuid != uuid);
        return appointment;
    }
}

module.exports = Lecturer;
