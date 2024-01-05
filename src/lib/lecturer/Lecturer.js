class Lecturer {
    /**
     * 
     * @param {Object} data
     * @param {string} data.uuid
     * @param {string} data.title_before
     * @param {string} data.first_name
     * @param {string} data.middle_name
     * @param {string} data.last_name
     * @param {string} data.title_after
     * @param {string} data.picture_url
     * @param {string} data.location
     * @param {string} data.claim
     * @param {string} data.bio
     * @param {Array} data.tags
     * @param {string} data.tags.name
     * @param {string} data.tags.uuid
     * @param {number} data.price_per_hour
     * @param {Array} data.contact
     * @param {string[]} data.contact.emails
     * @param {string[]} data.contact.telephone_numbers
     */
    constructor(data) {
        this.data = data;
    }

    /**
     * 
     * @param {Object} data
     */
    setData = (data) => this.data = data;

    /**
     * 
     * @returns {Object}
     */
    getData = () => this.data;

    /**
     * 
     * @returns {Object}
     */
    toJSON = () => ({
        uuid: this.data.uuid,
        title_before: this.data.title_before,
        first_name: this.data.first_name,
        middle_name: this.data.middle_name,
        last_name: this.data.last_name,
        title_after: this.data.title_after,
        picture_url: this.data.picture_url,
        location: this.data.location,
        claim: this.data.claim,
        bio: this.data.bio,
        tags: this.data.tags,
        price_per_hour: this.data.price_per_hour,
        contact: this.data.contact,
    });

    /**
     * 
     * @param {string} uuid
     */
    setUUID = (uuid) => this.data.uuid = uuid;

    /**
     * 
     * @returns {string} 
     */
    getUUID = () => this.data.uuid;
    
    /**
     * 
     * @param {string} title_before
     */
    setTitleBefore = (title_before) => this.data.title_before = title_before;

    /**
     * 
     * @returns {string}
     */
    getTitleBefore = () => this.data.title_before;

    /**
     * 
     * @param {string} first_name
     */
    setFirstName = (first_name) => this.data.first_name = first_name;

    /**
     * 
     * @returns {string}
     */
    getFirstName = () => this.data.first_name;

    /**
     * 
     * @param {string} middle_name
     */
    setMiddleName = (middle_name) => this.data.middle_name = middle_name;

    /**
     *
     * @returns {string}
     */
    getMiddleName = () => this.data.middle_name;

    /**
     *
     * @param {string} last_name
     */
    setLastName = (last_name) => this.data.last_name = last_name;

    /**
     *
     * @returns {string}
     */
    getLastName = () => this.data.last_name;

    /**
     * 
     * @param {string} title_after
     */
    setTitleAfter = (title_after) => this.data.title_after = title_after;

    /**
     * 
     * @returns {string}
     */
    getTitleAfter = () => this.data.title_after;

    /**
     * 
     * @param {string} picture_url
     */
    setPictureUrl = (picture_url) => this.data.picture_url = picture_url;

    /**
     * 
     * @returns {string}
     */
    getPictureUrl = () => this.data.picture_url;

    /**
     * 
     * @param {string} location
     */
    setLocation = (location) => this.data.location = location;

    /**
     * 
     * @returns {string}
     */
    getLocation = () => this.data.location;

    /**
     * 
     * @param {string} claim
     */
    setClaim = (claim) => this.data.claim = claim;

    /**
     * 
     * @returns {string}
     */
    getClaim = () => this.data.claim;

    /**
     * 
     * @param {string} bio
     */
    setBio = (bio) => this.data.bio = bio;

    /**
     * 
     * @returns {string}
     */
    getBio = () => this.data.bio;

    /**
     * 
     * @param {Array<{ name: string }>} tags
     */
    setTags = (tags) => this.data.tags = tags;

    /**
     * 
     * @returns {Array<{ name: string }>}
     */
    getTags = () => this.data.tags;

    /**
     * 
     * @param {number} price_per_hour
     */
    setPricePerHour = (price_per_hour) => this.data.price_per_hour = price_per_hour;

    /**
     * 
     * @returns {number}
     */
    getPricePerHour = () => this.data.price_per_hour;

    /**
     * 
     * @param {Object} contact
     * @param {Array} contact.emails
     * @param {Array} contact.telephone_numbers
     */
    setContact = (contact) => this.data.contact = contact;

    /**
     * 
     * @returns {{emails: [], telephone_numbers: []}}
     */
    getContact = () => this.data.contact;

    /**
     * 
     * @param {string[]} emails
     */
    setEmails = (emails) => this.data.contact.emails = emails;

    /**
     * 
     * @returns {string[]}
     */
    getEmails = () => this.data.contact?.emails;

    /**
     * 
     * @param {string[]} telephone_numbers
     */
    setTelephoneNumbers = (telephone_numbers) => this.data.contact.telephone_numbers = telephone_numbers;

    /**
     * 
     * @returns {string[]}
     */
    getTelephoneNumbers = () => this.data.contact?.telephone_numbers;
}

module.exports = Lecturer;