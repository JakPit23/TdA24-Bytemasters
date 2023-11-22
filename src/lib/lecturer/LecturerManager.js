const crypto = require("crypto");
const Core = require("../Core");
const Logger = require("../Logger");
const Lecturer = require("./Lecturer");
const LecturerTag = require("./Tag");

class LecturerManager {
    /**
     * 
     * @param {Core} core 
     */
    constructor(core) {
        this.core = core;
    }

    generateId() {
        return crypto.randomUUID();
    }

    getLecturers() {
        const lecturers = this.core.getDatabase().query("SELECT * FROM lecturers");
        return lecturers.map(({ id, tags, contact, ...data }) => {
            const parsedContact = contact ? JSON.parse(contact) : null;
            const uuidTags = tags ? JSON.parse(tags) : null;

            const fetchedTags = uuidTags.map(tag => this.core.getTagManager().getTagById(tag));

            return new Lecturer(id, { ...data, tags: fetchedTags, contact: parsedContact });
        });
    }

    getLecturer(id) {
        const lecturer = this.getLecturers().find(lecturer => lecturer.getId() == id);

        if (!lecturer) {
            return null;
        }

        return lecturer;
    }

    createLecturer(id, data) {
        if (!id) {
            throw Error("MISSING_ID");
        }

        if (!data) {
            throw Error("MISSING_DATA");
        }

        if (this.getLecturer(id)) {
            throw Error("LECTURER_ALREADY_EXISTS");
        }

        try {
            const lecturer = new Lecturer(id, data);

            const tags = lecturer.getTags().map(tag => {
                const tagName = tag?.name || null;

                let foundTag = this.core.getTagManager().getTagByName(tagName);
                if (!foundTag) {
                    foundTag = this.core.getTagManager().createTag(null, tagName);
                }

                return foundTag;
            });

            this.core.getDatabase().exec("INSERT INTO lecturers (id, title_before, first_name, middle_name, last_name, title_after, picture_url, location, claim, bio, tags, price_per_hour, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                lecturer.getId(),
                lecturer.getTitleBefore(),
                lecturer.getFirstName(),
                lecturer.getMiddleName(),
                lecturer.getLastName(),
                lecturer.getTitleAfter(),
                lecturer.getPictureUrl(),
                lecturer.getLocation(),
                lecturer.getClaim(),
                lecturer.getBio(),
                JSON.stringify(tags.map(tag => tag.getId())),
                lecturer.getPricePerHour(),
                JSON.stringify(lecturer.getContact()),
            ]);

            lecturer.setTags(tags);
            
            return lecturer;
        } catch(error) {
            Logger.error(Logger.Type.LecturerManager, `Failed to create lecturer: ${error.message}`);
            throw error;
        }
    }

    deleteLecturer(id) {
        if (!this.getLecturer(id)) {
            throw Error("LECTURER_NOT_FOUND");
        }

        try {
            const result = this.core.getDatabase().exec("DELETE FROM lecturers WHERE id = ?", [id]);
            return result;
        } catch(error) {
            Logger.error(Logger.Type.LecturerManager, `Failed to delete lecturer: ${error.message}`);
            throw error;
        }
    }

    editLecturer(id, data) {
        const lecturer = this.getLecturer(id);

        if (!lecturer) {
            throw Error("LECTURER_NOT_FOUND");
        }

        const editedData = { ...lecturer.getData() };
        for (const key of Object.keys(data)) {
            // Skip if the key is "id" or not present in the original data or the new value is undefined
            if (key === "id" || !editedData.hasOwnProperty(key) || data[key] === undefined) {
                continue;
            }

            if (key === "contact" && typeof data[key] === "object" && data[key] !== null) {
                const allowedContactProperties = ["emails", "telephone_numbers"];
                editedData[key] = allowedContactProperties.reduce((contactObj, prop) => {
                    // Check if the property exists in data, if not, include the original value
                    contactObj[prop] = data[key][prop] !== undefined ? data[key][prop] : editedData[key][prop];
                
                    return contactObj;
                }, {});

                continue;
            }

            editedData[key] = data[key];
        }

        this.core.getDatabase().exec(`
            UPDATE lecturers 
            SET 
                title_before = ?,
                first_name = ?,
                middle_name = ?,
                last_name = ?,
                title_after = ?,
                picture_url = ?,
                location = ?,
                claim = ?,
                bio = ?,
                tags = ?,
                price_per_hour = ?,
                contact = ?
            WHERE id = ?
        `, [
            editedData.title_before,
            editedData.first_name,
            editedData.middle_name,
            editedData.last_name,
            editedData.title_after,
            editedData.picture_url,
            editedData.location,
            editedData.claim,
            editedData.bio,
            JSON.stringify(editedData.tags),
            editedData.price_per_hour,
            JSON.stringify(editedData.contact),
            id,
        ]);

        return editedData;
    }

    isValidTag(tag) {
        return (
            tag.name !== undefined
        );
    }

    isValidContact(contact) {
        return (
            contact &&
            Array.isArray(contact.telephone_numbers) &&
            contact.telephone_numbers.length >= 1 &&
            contact.telephone_numbers.every(phone => this.isValidPhoneNumber(phone)) &&
            Array.isArray(contact.emails) &&
            contact.emails.length >= 1 &&
            contact.emails.every(email => this.isValidEmail(email))
        );
    }

    /**
     * Check if a phone number is valid.
     * @param {string} phoneNumber - The phone number to validate.
     * @returns {boolean} True if the phone number is valid, false otherwise.
     */
    isValidPhoneNumber(phoneNumber) {
        // For simplicity, this function only checks for numbers
        // and does not check for country codes.
        const phoneNumberRegex = /^\+?(\d+\s?)+$/;
        return phoneNumberRegex.test(phoneNumber);
    }

    /**
     * Check if an email address is valid.
     * @param {string} email - The email address to validate.
     * @returns {boolean} True if the email address is valid, false otherwise.
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

module.exports = LecturerManager;