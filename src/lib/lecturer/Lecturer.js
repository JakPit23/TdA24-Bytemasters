class Lecturer {
    /**
     * Creates a new instance of Lecturer.
     * @constructor
     * @param {string} uuid - The UUID of the lecturer.
     * @param {Object} data - The data of the lecturer.
     * @param {string} data.title_before - The title before the lecturer's name.
     * @param {string} data.first_name - The first name of the lecturer.
     * @param {string} data.middle_name - The middle name of the lecturer.
     * @param {string} data.last_name - The last name of the lecturer.
     * @param {string} data.title_after - The title after the lecturer's name.
     * @param {string} data.picture_url - The URL of the lecturer's picture.
     * @param {string} data.location - The location of the lecturer.
     * @param {string} data.claim - The claim of the lecturer.
     * @param {string} data.bio - The biography of the lecturer.
     * @param {Array} data.tags - The tags associated with the lecturer.
     * @param {string} data.tags.name - The name of the tag.
     * @param {string} data.tags.uuid - The UUID of the tag.
     * @param {number} data.price_per_hour - The price per hour for the lecturer's services.
     * @param {Array} data.contact - The contact information of the lecturer.
     * @param {string[]} data.contact.emails - The emails of the lecturer.
     * @param {string[]} data.contact.telephone_numbers - The telephone numbers of the lecturer.
     */
    constructor(uuid, data) {
        this.uuid = uuid;
        this.data = data;
    }

    /**
     * Sets the UUID of the lecturer.
     * @param {string} uuid - The UUID of the lecturer.
     */
    setUUID(uuid) {
        this.uuid = uuid;
    }

    /**
     * Gets the UUID of the lecturer.
     * @returns {string} The UUID of the lecturer.
     */
    getUUID() {
        return this.uuid || null;
    }

    /**
     * Sets the data of the lecturer.
     * @param {Object} data - The data of the lecturer.
     */
    setData(data) {
        this.data = data;
    }

    /**
     * Gets the data of the lecturer.
     * @returns {Object} The data of the lecturer.
     */
    getData() {
        return this.data;
    }

    toJSON() {
        return {
            uuid: this.getUUID(),
            title_before: this.getTitleBefore(),
            first_name: this.getFirstName(),
            middle_name: this.getMiddleName(),
            last_name: this.getLastName(),
            title_after: this.getTitleAfter(),
            picture_url: this.getPictureUrl(),
            location: this.getLocation(),
            claim: this.getClaim(),
            bio: this.getBio(),
            tags: this.getTags(),
            price_per_hour: this.getPricePerHour(),
            contact: this.getContact()
        }
    }

    /**
     * Sets the title before the lecturer's name.
     * @param {string} titleBefore - The title before the lecturer's name.
     */
    setTitleBefore(titleBefore) {
        this.data.title_before = titleBefore;
    }

    /**
     * Gets the title before the lecturer's name.
     * @returns {string} The title before the lecturer's name.
     */
    getTitleBefore() {
        return this.data.title_before || null;
    }

    /**
     * Sets the first name of the lecturer.
     * @param {string} firstName - The first name of the lecturer.
     */
    setFirstName(firstName) {
        this.data.first_name = firstName;
    }

    /**
     * Gets the first name of the lecturer.
     * @returns {string} The first name of the lecturer.
     */
    getFirstName() {
        return this.data.first_name || null;
    }

    /**
     * Sets the middle name of the lecturer.
     * @param {string} middleName - The middle name of the lecturer.
     */
    setMiddleName(middleName) {
        this.data.middle_name = middleName;
    }

    /**
     * Gets the middle name of the lecturer.
     * @returns {string} The middle name of the lecturer.
     */
    getMiddleName() {
        return this.data.middle_name || null;
    }

    /**
     * Sets the last name of the lecturer.
     * @param {string} lastName - The last name to set.
     */
    setLastName(lastName) {
        this.data.last_name = lastName;
    }

    /**
     * Gets the last name of the lecturer.
     * @returns {string} The last name of the lecturer.
     */
    getLastName() {
        return this.data.last_name || null;
    }

    /**
     * Sets the title after the lecturer's name.
     * @param {string} titleAfter - The title after the lecturer's name.
     */
    setTitleAfter(titleAfter) {
        this.data.title_after = titleAfter;
    }

    /**
     * Gets the title after the lecturer's name.
     * @returns {string} The title after the lecturer's name.
     */
    getTitleAfter() {
        return this.data.title_after || null;
    }

    /**
     * Sets the URL of the lecturer's picture.
     * @param {string} pictureUrl - The URL of the lecturer's picture.
     */
    setPictureUrl(pictureUrl) {
        this.data.picture_url = pictureUrl;
    }

    /**
     * Gets the URL of the lecturer's picture.
     * @returns {string} The URL of the lecturer's picture.
     */
    getPictureUrl() {
        return this.data.picture_url || null;
    }

    /**
     * Sets the location of the lecturer.
     * @param {string} location - The location of the lecturer.
     */
    setLocation(location) {
        this.data.location = location;
    }

    /**
     * Gets the location of the lecturer.
     * @returns {string} The location of the lecturer.
     */
    getLocation() {
        return this.data.location || null;
    }

    /**
     * Sets the claim of the lecturer.
     * @param {string} claim - The claim of the lecturer.
     */
    setClaim(claim) {
        this.data.claim = claim;
    }

    /**
     * Gets the claim of the lecturer.
     * @returns {string} The claim of the lecturer.
     */
    getClaim() {
        return this.data.claim || null;
    }

    /**
     * Sets the biography of the lecturer.
     * @param {string} bio - The biography of the lecturer.
     */
    setBio(bio) {
        this.data.bio = bio;
    }

    /**
     * Gets the biography of the lecturer.
     * @returns {string} The biography of the lecturer.
     */
    getBio() {
        return this.data.bio || null;
    }

    /**
     * Sets the tags associated with the lecturer.
     * @param {Array<{ name: string }>} tags - The tags associated with the lecturer.
     */
    setTags(tags) {
        this.data.tags = tags;
    }

    /**
     * Retrieves the tags associated with the lecturer.
     * @returns {Array<{ name: string }>} The tags of the lecturer
     */
    getTags() {
        return this.data.tags || null;
    }

    /**
     * Sets the price per hour for the lecturer's services.
     * @param {number} pricePerHour - The price per hour for the lecturer's services.
     */
    setPricePerHour(pricePerHour) {
        this.data.price_per_hour = pricePerHour;
    }

    /**
     * Gets the price per hour for the lecturer's services.
     * @returns {number} The price per hour for the lecturer's services.
     */
    getPricePerHour() {
        return this.data.price_per_hour || null;
    }

    /**
     * Sets the contact information for the lecturer.
     * @param {Object} contact - The contact information.
     * @param {Array} contact.emails - An array of email addresses.
     * @param {Array} contact.telephone_numbers - An array of telephone numbers.
     */
    setContact(contact) {
        this.data.contact = contact;
    }

    /**
     * Retrieves the contact information of the lecturer.
     * @returns {{emails: [], telephone_numbers: []}} The contact information of the lecturer.
     */
    getContact() {
        return this.data.contact || null;
    }
}

module.exports = Lecturer;