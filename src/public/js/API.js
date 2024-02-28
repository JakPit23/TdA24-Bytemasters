class APIError {
    constructor(message, displayMessage) {
        this.message = message;
        this.displayMessage = displayMessage;
    }

    static INTERNAL_SERVER_ERROR = new APIError("INTERNAL_SERVER_ERROR", "Interní chyba serveru");
    static MISSING_REQUIRED_VALUES = new APIError("MISSING_REQUIRED_VALUES", "Chybějící povinné hodnoty");
    static TIME_SLOT_NOT_AVAILABLE = new APIError("TIME_SLOT_NOT_AVAILABLE", "Časový slot není dostupný");
    static TIME_CONFLICT = new APIError("TIME_CONFLICT", "Konflikt časového slotu");
    static INVALID_CREDENTIALS = new APIError("INVALID_CREDENTIALS", "Neplatné přihlašovací údaje");
}

class API {
    getUUID = () => window.location.pathname.match(/[0-9a-f]{8}-[0-9a-f]{4}-[14][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i)

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

            const data = await fetch(requestOptions.url, requestOptions)
                .then(response => {
                    if (requestOptions.responseType == "text") {
                        return response.text();
                    }

                    if (requestOptions.responseType == "blob") {
                        return response.blob();
                    }

                    return response.json();
                })
                .then(data => {
                    if (requestOptions.responseType == "json" && data.error) {
                        if (APIError[data.error]) {
                            throw APIError[data.error];
                        }

                        throw new APIError(data.error);
                    }

                    return data;
                });

            return data;
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
    createReservation = (uuid, data) => this._call({
        url: `/api/lecturers/${uuid}/reservation`,
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
}