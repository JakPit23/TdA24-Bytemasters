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
     * @param {object} options 
     * @param {number} options.limit
     * @param {string} options.before
     * @param {string} options.after
     * @returns {Promise<object>}
     */
    getActivities = (options = {}) => this._call({
        url: `/api/activity?${new URLSearchParams(options).toString()}`,
        method: "GET",
        type: "json"
    })

    /**
     * @param {string} query 
     * @returns {Promise<object>}
     */
    searchActivities = (query) => this._call({
        url: `/api/activity/search`,
        method: "POST",
        type: "json",
        body: { query }
    })

    approveActivity = (id) => this._call({
        url: `/api/activity/${id}`,
        method: "POST",
        type: "json",
        body: {
            public: true
        }
    })
}