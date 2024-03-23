const Logger = require("../Logger");
const Utils = require("../Utils");
const APIError = require("../types/APIError");
const Appointment = require("../types/Appointment");

module.exports = class AppointmentManager {
    /**
     * @param {import("../Core")} core 
     */
    constructor(core) {
        this.core = core;

        /**
         * @private
         * @type {import("../types/Appointment")[]}
         */
        this._cache = [];
    }

    /**
     * @private
     * @param {import("../types/Appointment")} appointment
     */
    _addToCache(appointment) {
        if (!(appointment instanceof Appointment)) {
            throw APIError.InvalidValueType("appointment", "Appointment");
        }

        if (this._getFromCache(appointment)) {
            Logger.debug(Logger.Type.AppointmentManager, `&c${appointment.uuid}&r already exists in cache, updating...`);
            this._cache = this._cache.map(data => data.uuid == appointment.uuid ? appointment : data);
        } else {
            Logger.debug(Logger.Type.AppointmentManager, `Caching appointment &c${appointment.uuid}&r...`);
            this._cache.push(appointment);
        }
    }

    /**
     * @private
     * @param {import("../types/DocTypes").AppointmentData} options
     */
    _removeFromCache(options) {
        this._cache = this._cache.filter(data => data.uuid != options.uuid);
    }

    /**
     * @private
     * @param {import("../types/DocTypes").AppointmentData} options 
     * @returns {import("../types/Appointment") | null}
     */
    _getFromCache = (options) => this._cache.find(data => data.uuid == options.uuid)

    /**
     * @private
     * @param {import("../types/Appointment")} appointment
     * @param {boolean} edit
     */
    async _saveAppointment(appointment, edit = false) {
        if (!(appointment instanceof Appointment)) {
            throw APIError.InvalidValueType("appointment", "Appointment");
        }
        
        if (await this.getAppointment({ uuid: appointment.uuid }) && !edit) {
            Logger.debug(Logger.Type.AppointmentManager, `Not saving appointment &c${appointment.uuid}&r because it &cexists&r in database and it's not an &cedit&r...`);
            return null;
        }

        if (edit) {
            Logger.debug(Logger.Type.AppointmentManager, `Updating appointment data for &c${appointment.uuid}&r in database...`);
            this.core.getDatabase().exec("UPDATE `appointments` SET `start` = ?, `end` = ?, `firstName` = ?, `lastName` = ?, `location` = ?, `email` = ?, `phoneNumber` = ?, `message` = ? WHERE `uuid` = ?", [
                appointment.start,
                appointment.end,
                appointment.firstName,
                appointment.lastName,
                appointment.location,
                appointment.email,
                appointment.phoneNumber,
                appointment.message,
                appointment.uuid
            ]);
        } else {
            Logger.debug(Logger.Type.AppointmentManager, `Creating appointment data for &c${appointment.uuid}&r in database...`);
            this.core.getDatabase().exec("INSERT INTO `appointments` (`uuid`, `start`, `end`, `firstName`, `lastName`, `location`, `email`, `phoneNumber`, `message`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                appointment.uuid,
                appointment.start,
                appointment.end,
                appointment.firstName,
                appointment.lastName,
                appointment.location,
                appointment.email,
                appointment.phoneNumber,
                appointment.message
            ]);
        }

        this._addToCache(appointment);
    }

    saveAppointments = (appointments) => Promise.all(appointments.map(appointment => this._saveAppointment(appointment)))

    /**
     * @returns {Promise<import("../types/Appointment")[]>}
     */
    async getAppointments() {
        const appointments = await this.core.getDatabase().query("SELECT * FROM `appointments`");
        Logger.debug(Logger.Type.AppointmentManager, `Loaded &c${appointments.length}&r appointments from database`);

        return appointments.map(data => new Appointment(data));
    }

    /**
     * @param {import("../types/DocTypes").AppointmentData} options
     * @returns {Promise<import("../types/Appointment") | null>}
     */
    async getAppointment(options = {}) {
        let appointment = this._getFromCache(options);

        if (!appointment) {
            const data = await this.core.getDatabase().query("SELECT * FROM `appointments` WHERE `uuid` = ?", [ options.uuid ]);

            if (!Array.isArray(data) || data.length == 0) {
                Logger.debug(Logger.Type.AppointmentManager, `Appointment &c${options.uuid}&r not found`);
                return null;
            }

            appointment = new Appointment(data[0]);
            this._addToCache(appointment);
            Logger.debug(Logger.Type.AppointmentManager, `Loaded appointment &c${appointment.uuid}&r from database, caching...`);
        } else {
            Logger.debug(Logger.Type.AppointmentManager, `Found appointment &c${appointment.uuid}&r in cache`);
        }

        return appointment;
    }

    /**
     * @param {import("../types/DocTypes").AppointmentData} data
     * @returns {Promise<import("../types/Appointment")>}
     */
    async createAppointment(data) {
        if (!Utils.validateUUID(data.uuid)) {
            data.uuid = Utils.newUUID();
            while (await this.getAppointment({ uuid: data.uuid })) { data.uuid = Utils.newUUID() }
        }

        const appointment = new Appointment(data);
        await this._saveAppointment(appointment);
        Logger.debug(Logger.Type.AppointmentManager, `Created new appointment &c${appointment.uuid}&r, caching...`);

        return appointment;
    }

    createAppointments = (data) => Promise.all(data.map(appointment => this.createAppointment(appointment)))
    
    /**
     * @param {import("../types/DocTypes").AppointmentData} options 
     * @returns {Promise<boolean>}
     */
    async deleteAppointment(options = {}) {
        if (!(await this.getAppointment(options))) {
            throw APIError.KeyNotFound("appointment");
        }
        
        const result = this.core.getDatabase().exec("DELETE FROM `appointments` WHERE `uuid` = ?", [ options.uuid ]);
        if (result.changes != 1) {
            throw APIError.KeyNotDeleted("appointment");
        }

        this._removeFromCache(options);
        return true;
    }

    /**
     * @param {import("../types/Appointment")} appointment
     * @param {import("../types/DocTypes").AppointmentData} data 
     * @returns {Promise<import("../types/Appointment")>}
     */
    async editAppointment(appointment, data) {
        if (!(appointment instanceof Appointment)) {
            throw APIError.InvalidValueType("appointment", "Appointment");
        }

        appointment.edit(data);
        await this._saveAppointment(appointment, true);

        return appointment;
    }
}