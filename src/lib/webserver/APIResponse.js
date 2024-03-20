module.exports = class APIResponse {
    constructor(data) {
        this.statusCode = data.statusCode;
        this.code = data.code;
        this.message = data.message;
        this.error = data.error;
        this.data = data.data;
    }

    static fromAPIError = (error) => APIResponse[error.type];

    send = (res, data) => res.status(this.statusCode).json({
        code: this.code,
        message: this.message,
        error: this.error,
        ...this.data,
        ...data
    })

    static Ok = new APIResponse({ statusCode: 200, code: 200, message: "OK" });
    static RouteNotFound = new APIResponse({ statusCode: 404, code: 404, error: { type: "RouteNotFound" } });
    static InternalServerError = new APIResponse({ statusCode: 500, code: 500, error: { type: "InternalServerError" } });
    static InvalidRequestBody = new APIResponse({ statusCode: 400, code: 400, error: { type: "InvalidRequestBody" } });
    static Unauthorized = new APIResponse({ statusCode: 401, code: 401, error: { type: "Unauthorized" } });
    static InvalidCredentials = new APIResponse({ statusCode: 400, code: 400, error: { type: "InvalidCredentials" } });
    
    static KeyAlreadyExists = (key) => new APIResponse({ statusCode: 400, code: 400, error: { type: "KeyAlreadyExists", key } });
    static KeyNotFound = (key) => new APIResponse({ statusCode: 404, code: 404, error: { type: "KeyNotFound", key } });
    static KeyNotDeleted = (key) => new APIResponse({ statusCode: 500, code: 500, error: { type: "KeyNotDeleted", key } });

    static InvalidValueType = (value) => new APIResponse({ statusCode: 400, code: 400, error: { type: "InvalidValueType", value } });
    static InvalidValueLength = (value) => new APIResponse({ statusCode: 400, code: 400, error: { type: "InvalidValueLength", value } });
    static DuplicateValue = (value) => new APIResponse({ statusCode: 400, code: 400, error: { type: "DuplicateValue", value } });
}