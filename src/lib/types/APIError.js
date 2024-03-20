module.exports = class APIError extends Error {
    constructor({ message = "An unknown error occurred", type = APIError.Types.Unknown, data }) {
        super(message);

        this.name = "APIError";
        this.type = type;
        this.data = data;
    }

    static Types = {
        Unknown: "Unknown",
        InvalidCredentials: "InvalidCredentials",

        KeyAlreadyExists: "KeyNotFound",
        KeyNotFound: "KeyAlreadyExists",
        KeyNotDeleted: "KeyNotDeleted",

        InvalidValueType: "InvalidValueType",
        InvalidValueLength: "InvalidValueLength",
        DuplicateValue: "DuplicateValue"
    }
    static Unknown = new APIError({ message: "An unknown error occurred", type: APIError.Types.Unknown });
    static InvalidCredentials = new APIError({ message: "InvalidCredentials", type: APIError.Types.InvalidCredentials });

    static KeyAlreadyExists = (key) => new APIError({ message: "A key already exists", type: APIError.Types.KeyAlreadyExists, data: { key } });
    static KeyNotFound = (key) => new APIError({ message: "A key was not found", type: APIError.Types.KeyNotFound, data: { key } });
    static KeyNotDeleted = (key) => new APIError({ message: "A key was not deleted", type: APIError.Types.KeyNotDeleted, data: { key } });

    static InvalidValueType = (valueName, requiredType) => new APIError({ message: "An invalid value type was provided", type: APIError.Types.InvalidValueType, data: { valueName, requiredType } });
    static InvalidValueLength = (valueName, minLength, maxLength) => new APIError({ message: "An invalid value length was provided", type: APIError.Types.InvalidValueLength, data: { valueName, minLength, maxLength } });
    static DuplicateValue = (valueType) => new APIError({ message: "A duplicate value was provided", type: APIError.Types.DuplicateValue, data: { valueType } });
}