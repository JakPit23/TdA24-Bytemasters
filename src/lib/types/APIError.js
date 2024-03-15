module.exports = class APIError extends Error {
    constructor({ message = "APIError", type = APIError.Types.Unknown, data }) {
        super(message);

        this.name = "APIError";
        this.type = type;
        this.data = data;
    }

    static Types = {
        Unknown: "UNKNOWN",
        MissingRequiredValues: "MISSING_REQUIRED_VALUES",
        LecturerAlreadyExists: "LECTURER_ALREADY_EXISTS",
        LecturerNotFound: "LECTURER_NOT_FOUND",
        UsernameDoesntMeetMinimalRequirements: "USERNAME_DOESNT_MEET_MINIMAL_REQUIREMENTS",
        UsernameDoesntMeetMaximalRequirements: "USERNAME_DOESNT_MEET_MAXIMAL_REQUIREMENTS",
        InvalidCredentials: "INVALID_CREDENTIALS",
        InvalidValueType: "INVALID_VALUE_TYPE",
        InvalidValueLength: "INVALID_VALUE_LENGTH",
        InvalidDates: "INVALID_DATES",
        InvalidEmail: "INVALID_EMAIL",
        InvalidPhoneNumber: "INVALID_PHONE_NUMBER",
        ReservationNotFound: "RESERVATION_NOT_FOUND",
        TimeSlotNotAvailable: "TIME_SLOT_NOT_AVAILABLE",
        TimeConflict: "TIME_CONFLICT",
        InvalidDate: "INVALID_DATE"
    }

    static Unknown = new APIError({ message: "UNKNOWN", type: APIError.Types.Unknown });
    static MissingRequiredValues = new APIError({ message: "MISSING_REQUIRED_VALUES", type: APIError.Types.MissingRequiredValues });

    static LecturerAlreadyExists = new APIError({ message: "LECTURER_ALREADY_EXISTS", type: APIError.Types.LecturerAlreadyExists });
    static LecturerNotFound = new APIError({ message: "LECTURER_NOT_FOUND", type: APIError.Types.LecturerNotFound });
    
    static UsernameDoesntMeetMinimalRequirements = new APIError({ message: "USERNAME_DOESNT_MEET_MINIMAL_REQUIREMENTS", type: APIError.Types.UsernameDoesntMeetMinimalRequirements });
    static UsernameDoesntMeetMaximalRequirements = new APIError({ message: "USERNAME_DOESNT_MEET_MAXIMAL_REQUIREMENTS", type: APIError.Types.UsernameDoesntMeetMaximalRequirements });
    static InvalidCredentials = new APIError({ message: "INVALID_CREDENTIALS", type: APIError.Types.InvalidCredentials });
    static InvalidValueType = new APIError({ message: "INVALID_VALUE_TYPE", type: APIError.Types.InvalidValueType });
    static InvalidValueLength = new APIError({ message: "INVALID_VALUE_LENGTH", type: APIError.Types.InvalidValueLength });
    static InvalidDates = new APIError({ message: "INVALID_DATES", type: APIError.Types.InvalidDates });
    static InvalidEmail = new APIError({ message: "INVALID_EMAIL", type: APIError.Types.InvalidEmail });
    static InvalidPhoneNumber = new APIError({ message: "INVALID_PHONE_NUMBER", type: APIError.Types.InvalidPhoneNumber });

    static ReservationNotFound = new APIError({ message: "RESERVATION_NOT_FOUND", type: APIError.Types.ReservationNotFound });
    static TimeSlotNotAvailable = new APIError({ message: "TIME_SLOT_NOT_AVAILABLE", type: APIError.Types.TimeSlotNotAvailable });
    static TimeConflict = new APIError({ message: "TIME_CONFLICT", type: APIError.Types.TimeConflict });
    static InvalidDate = new APIError({ message: "INVALID_DATE", type: APIError.Types.InvalidDate });
}