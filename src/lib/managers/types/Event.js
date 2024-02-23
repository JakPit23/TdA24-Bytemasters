const { APIError } = require("../../Errors");

class Event {
    constructor(data) {
        if (!(data.name && data.startDate && data.endDate)) throw APIError.MISSING_REQUIRED_VALUES;
        if (typeof data.name !== "string") throw APIError.INVALID_EVENT_NAME;
        if (typeof data.startDate !== "number") throw APIError.INVALID_EVENT_START_DATE;
        if (typeof data.endDate !== "number") throw APIError.INVALID_EVENT_END_DATE;
        if (data.startDate > data.endDate) throw APIError.INVALID_EVENT_DATES;

        /**
         * @type {string}
         * @description The name of the event.
         */
        this.name = data.name;

        /**
         * @type {number}
         * @description The start date of the event.
         */
        this.startDate = data.startDate;

        /**
         * @type {number}
         * @description The end date of the event.
         */
        this.endDate = data.endDate;
    }

    toICSFormat = () => {
        const startDate = new Date(this.startDate * 1000);
        const endDate = new Date(this.endDate * 1000);

        return {
            title: this.name,
            start: [ startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes() ],
            end: [ endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), endDate.getHours(), endDate.getMinutes() ],
        };
    }
}

module.exports = Event;