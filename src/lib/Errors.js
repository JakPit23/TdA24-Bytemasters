class APIError extends Error {
    constructor(message) {
        super(message);
        this.name = "APIError";
    }

    static MISSING_REQUIRED_VALUES = new APIError("MISSING_REQUIRED_VALUES");
    static LECTURER_ALREADY_EXISTS = new APIError("LECTURER_ALREADY_EXISTS");
    static USERNAME_DOESNT_MEET_MINIMAL_REQUIREMENTS = new APIError("USERNAME_DOESNT_MEET_MINIMAL_REQUIREMENTS");
    static USERNAME_DOESNT_MEET_MAXIMAL_REQUIREMENTS = new APIError("USERNAME_DOESNT_MEET_MAXIMAL_REQUIREMENTS");
    static INVALID_CREDENTIALS = new APIError("INVALID_CREDENTIALS");
    static INVALID_EVENT_NAME = new APIError("INVALID_EVENT_NAME");
    static INVALID_EVENT_START_DATE = new APIError("INVALID_EVENT_START_DATE");
    static INVALID_EVENT_END_DATE = new APIError("INVALID_EVENT_END_DATE");
    static INVALID_EVENT_DATES = new APIError("INVALID_EVENT_DATES");
    static INVALID_EMAIL = new APIError("INVALID_EMAIL");
    static INVALID_PHONE_NUMBER = new APIError("INVALID_PHONE_NUMBER");
    static EVENT_CONFLICTS_WITH_EXISTING_EVENT = new APIError("EVENT_CONFLICTS_WITH_EXISTING_EVENT");
}

module.exports = {
    APIError
}