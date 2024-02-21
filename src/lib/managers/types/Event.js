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
}

module.exports = Event;