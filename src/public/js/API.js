class APIError {
    constructor({ type = APIError.Types.Unknown, data }) {
        this.type = type;
        this.data = data;
        
        this.displayMessage = this.getDisplayMessage();
    }

    getDisplayMessage() {
        switch (this.type) {
            case APIError.Types.Unknown: return "Nastala neznámá chyba";
            case APIError.Types.InvalidCredentials: return "Nesprávné přihlašovací údaje";
            case APIError.Types.KeyAlreadyExists: return `Klíč již existuje`;
            case APIError.Types.KeyNotFound: return `Klíč nebyl nalezen`;
            case APIError.Types.KeyNotDeleted: return `Klíč nebyl smazán`;
            case APIError.Types.InvalidValueType: return `Neplatný typ hodnoty`;
            case APIError.Types.InvalidValueLength: return `Neplatná délka hodnoty ${this.data.valueName} (min: ${this.data.minLength}, max: ${this.data.maxLength})`;
            // etc..
            default: return "Nastala neznámá chyba";
        }
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

    static InternalServerError = new APIError({ type: APIError.Types.Unknown });

    static InvalidValueType = (data) => new APIError({ type: APIError.Types.InvalidValueType, data });
    static InvalidValueLength = (data) => new APIError({ type: APIError.Types.InvalidValueLength, data });
    static DuplicateValue = (data) => new APIError({ type: APIError.Types.DuplicateValue, data });

    static KeyAlreadyExists = (data) => new APIError({ type: APIError.Types.KeyAlreadyExists, data });
    static KeyNotFound = (data) => new APIError({ type: APIError.Types.KeyNotFound, data });
    static KeyNotDeleted = (data) => new APIError({ type: APIError.Types.KeyNotDeleted, data });

    static InvalidCredentials = new APIError({ type: APIError.Types.InvalidCredentials });
}

class API {
    /**
     * @param {object} options 
     * @param {string} options.url 
     * @param {string} options.method 
     * @param {string} options.type
     * @param {object} options.body
     * @param {object} options.headers
     * 
     * @returns {Promise<object>} 
     */
    async _call(options = {}) {
        try {
            const requestOptions = {
                url: options.url,
                method: options.method || "GET",
                type: options.type || "json",
                body: options.body,
                headers: options.headers || {},
                responseType: options.responseType || "json"
            };

            if (requestOptions.type == "json") {
                requestOptions.headers["Content-Type"] = "application/json";
                requestOptions.body = JSON.stringify(options.body);
            }

            return fetch(requestOptions.url, requestOptions)
                .then(response => response.blob())
                .then(async (blob) => {
                    try {
                        return JSON.parse(await blob.text());
                    } catch (error) {
                        return blob;
                    }
                })
                .then(blob => {
                    if (blob.error && blob.error.type && APIError[blob.error.type]) {
                        if (typeof APIError[blob.error.type] == "function") {
                            throw APIError[blob.error.type](blob.error.value);
                        }
                     
                        throw APIError[blob.error.type];
                    }

                    if (requestOptions.responseType == "text") {
                        return blob.text();
                    }

                    if (requestOptions.responseType == "blob") {
                        return blob;
                    }

                    return blob;
                });
        } catch (error) {
            console.log("An error occurred while calling the API:", error);
            throw error;
        }
    }

    /**
     * @param {object} options 
     * @param {number} options.limit
     * @param {string} options.before
     * @param {string} options.after
     * @returns {Promise<object>}
     */
    getLecturers = (options = {}) => this._call({
        url: `/api/lecturers?${new URLSearchParams(options).toString()}`,
        responseType: "json"
    })

    /**
     * @param {string} uuid 
     * @returns {Promise<object>}
     */
    getLecturer = (uuid) => this._call({
        url: `/api/lecturers/${uuid}`,
        responseType: "json"
    })

    /**
     * @param {string} uuid 
     * @param {object} data 
     * @param {number} data.start
     * @param {number} data.end
     * @param {string} data.firstName
     * @param {string} data.lastName
     * @param {string} data.email
     * @param {string} data.phoneNumber
     * @param {string} data.location
     * @returns {Promise<object>}
     */
    createAppointment = (uuid, data) => this._call({
        url: `/api/lecturers/${uuid}/appointment`,
        method: "POST",
        type: "json",
        body: data
    })

    /**
     * @param {object} data
     * @param {string} data.username
     * @param {string} data.password
     * @returns {Promise<object>}
     */
    authLogin = (data) => this._call({
        url: `/api/auth/login`,
        method: "POST",
        type: "json",
        body: data
    })

    /**
     * @returns {Promise<object>}
     */
    authLogout = () => this._call({
        url: `/api/auth/logout`,
        method: "POST",
        type: "json",
    })

    /**
     * @returns {Promise<object>}
     */
    getUser = () => this._call({
        url: `/api/user/@me`,
        method: "GET",
        type: "json"
    })

    /**
     * @returns {Promise<object>}
     */
    addUserSettings = (data) => this._call({
        url: `/api/user/@me`,
        method: "PATCH",
        type: "json",
        body: data
    })

    /**
     * @returns {Promise<object>}
     */
    getUserAppointmentsICS = () => this._call({
        url: `/api/user/@me/appointments`,
        method: "GET",
        responseType: "blob"
    })

    /**
     * @param {string} uuid 
     * @returns {Promise<object>}
     */
    deleteAppointment = (uuid) => this._call({
        url: `/api/user/appointment/${uuid}`,
        method: "DELETE",
        type: "json"
    })
}