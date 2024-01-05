const sanitizeHtml = require("sanitize-html");
const Core = require("../Core");
const Logger = require("../Logger");
const Lecturer = require("./Lecturer");
const UUIDProcessor = require("../utils/UUIDProcessor");

class LecturerManager {
    /**
     * 
     * @param {Core} core 
     */
    constructor(core) {
        this.core = core;
    }

    /**
     * 
     * @returns {Lecturer[]}
     */
    getLecturers = () => this.core.getDatabase().query("SELECT * FROM lecturers").map(data => this.readLecturer(data));

    /**
     * 
     * @param {string} uuid
     * @returns {Lecturer}
     */
    getLecturer = (uuid) => this.getLecturers().find(lecturer => lecturer.getUUID() == uuid);

    /**
     * 
     * @private
     * @param {object} lecturer 
     * @param {object} combination 
     * @returns {object}
     */
    processLecturer(lecturer, combination) {
        const json = {};

        const allowedKeys = [
            { key: "title_before" },
            {
                key: "first_name",
                required: true
            },
            { key: "middle_name" },
            {
                key: "last_name",
                required: true
            },
            { key: "title_after" },
            { key: "picture_url" },
            { key: "location" },
            { key: "claim" },
            { key: "price_per_hour" },
            {
                key: "contact",
                required: true
            }
        ];

        for (const { key, required } of allowedKeys) {
            if (!lecturer[key] && required) {
                throw Error("MISSING_REQUIRED_FIELD");
            }

            if (typeof lecturer[key] != "string") {
                continue;
            }
            

            json[key] = this.sanitize(lecturer[key]);
        }

        if (lecturer.bio) {
            json.bio = this.sanitize(lecturer.bio, ["b", "i", "s"]);
        }

        let filteredTags = [];
        let filteredNumbers = [];
        let filteredEmails = [];

        if (lecturer.tags) {
            lecturer.tags?.filter(tag => tag.name).map(tag => {
                if (typeof tag.name !== "string") {
                    return;
                }

                const sanitizedTagName = this.core.getTagManager().sanitize(tag.name);

                const match = this.core.getTagManager().getTagByName(sanitizedTagName);
                if (match) {
                    if (filteredTags.find(filteredTag => filteredTag.name === match.getName())) {
                        return;
                    }

                    return filteredTags.push({
                        uuid: match.getUUID(),
                        name: match.getName()
                    });
                }
    
                const createdTag = this.core.getTagManager().createTag({ name: sanitizedTagName });
                return filteredTags.push({
                    uuid: createdTag.getUUID(),
                    name: createdTag.getName()
                });
            });
        }

        if (lecturer.contact) {
            if (lecturer.contact.telephone_numbers && Array.isArray(lecturer.contact.telephone_numbers)) {
                // Use Set to remove duplicates
                filteredNumbers = [...new Set(lecturer.contact.telephone_numbers.filter(number => this.isValidPhoneNumber(number)))];
            }
        
            if (lecturer.contact.emails && Array.isArray(lecturer.contact.emails)) {
                // Use Set to remove duplicates
                filteredEmails = [...new Set(lecturer.contact.emails.filter(email => this.isValidEmail(email)))];
            }
        }

        if (filteredTags.length > 0) {
            json.tags = filteredTags;
        }

        let contact = {};
        if (filteredNumbers.length > 0) {
            contact.telephone_numbers = filteredNumbers;
        }
        
        if (filteredEmails.length > 0) {
            contact.emails = filteredEmails;
        }

        if (Object.keys(contact).length > 0) {
            json.contact = contact;
        } else {
            throw Error("MISSING_REQUIRED_FIELD");
        }

        if (combination) {
            Object.entries(json).forEach(([key, value]) => (combination[key]) = value);
            return combination;
        }

        json.uuid = UUIDProcessor.newUUID();
        while (this.getLecturer(json.uuid)) json.uuid = UUIDProcessor.newUUID();

        return json;
    }

    /**
     * 
     * @private
     * @param {object} data 
     * @returns {Lecturer}
     */
    readLecturer = (data) => {
        const { tags, emails, telephone_numbers, ...lecturer } = data;
        const json = { ...lecturer };

        const contact = {};
        if (emails) 
            contact.emails = emails.split(",");

        if (telephone_numbers) 
            contact.telephone_numbers = telephone_numbers.split(",");

        if (Object.keys(contact).length > 0) 
            json.contact = contact;
        
        if (tags) 
            json.tags = tags.split(",").map(tag => this.core.getTagManager().getTagByUUID(tag));

        return new Lecturer(json);
    };

    /**
     * 
     * @private
     * @param {object} lecturer 
     */
    saveLecturer = (lecturer) => {
        let emails;
        if (lecturer.getEmails() && Array.isArray(lecturer.getEmails())) {
            emails = lecturer.getEmails().join(",");
        }

        let telephoneNumbers;
        if (lecturer.getTelephoneNumbers() && Array.isArray(lecturer.getTelephoneNumbers())) {
            telephoneNumbers = lecturer.getTelephoneNumbers().join(",");
        }
        
        let tags;
        if (lecturer.getTags() && Array.isArray(lecturer.getTags())) {
            tags = lecturer.getTags().map(tag => tag.uuid).join(",");
        }

        if (this.getLecturer(lecturer.getUUID())) {
            this.core.getDatabase().exec("UPDATE lecturers SET title_before = ?, first_name = ?, middle_name = ?, last_name = ?, title_after = ?, picture_url = ?, location = ?, claim = ?, bio = ?, tags = ?, price_per_hour = ?, emails = ?, telephone_numbers = ? WHERE uuid = ?", [
                lecturer.getTitleBefore(),
                lecturer.getFirstName(),
                lecturer.getMiddleName(),
                lecturer.getLastName(),
                lecturer.getTitleAfter(),
                lecturer.getPictureUrl(),
                lecturer.getLocation(),
                lecturer.getClaim(),
                lecturer.getBio(),
                tags,
                lecturer.getPricePerHour(),
                emails,
                telephoneNumbers,
                lecturer.getUUID(),
            ]);

            return;
        }

        this.core.getDatabase().exec("INSERT INTO lecturers (uuid, title_before, first_name, middle_name, last_name, title_after, picture_url, location, claim, bio, tags, price_per_hour, emails, telephone_numbers) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
            lecturer.getUUID(),
            lecturer.getTitleBefore(),
            lecturer.getFirstName(),
            lecturer.getMiddleName(),
            lecturer.getLastName(),
            lecturer.getTitleAfter(),
            lecturer.getPictureUrl(),
            lecturer.getLocation(),
            lecturer.getClaim(),
            lecturer.getBio(),
            tags,
            lecturer.getPricePerHour(),
            emails,
            telephoneNumbers,
        ]);
    }

    /**
     * 
     * @private
     * @param {string} dirty 
     * @param {string} allowedTags 
     * @returns {string}
     */
    sanitize = (dirty, allowedTags) => sanitizeHtml(dirty, { allowedTags });

    /**
     * 
     * @param {object} data 
     * @returns {Lecturer}
     */
    createLecturer(data) {
        try {
            const lecturer = new Lecturer(this.processLecturer(data));
            this.saveLecturer(lecturer);
            return lecturer;
        } catch (error) {
            throw error;
        }
    }

    /**
     * 
     * @param {string} uuid 
     */
    deleteLecturer(uuid) {
        if (!this.getLecturer(uuid)) {
            throw Error("LECTURER_NOT_FOUND");
        }

        this.core.getDatabase().exec("DELETE FROM lecturers WHERE uuid = ?", [uuid]);
    }

    /**
     * 
     * @param {string} uuid 
     * @param {object} data 
     * @returns {Lecturer}
     */
    editLecturer(uuid, data) {
        const lecturer = this.getLecturer(uuid);

        if (!lecturer) {
            throw Error("LECTURER_NOT_FOUND");
        }

        const editedLecturer = new Lecturer(this.processLecturer(data, lecturer.getData()));
        this.saveLecturer(editedLecturer);
        return editedLecturer;
    }

    /**
     * 
     * @private
     * @param {string} phoneNumber
     * @returns {boolean}
     */
    isValidPhoneNumber(phoneNumber) {
        // For simplicity, this function only checks for numbers
        // and does not check for country codes.
        const phoneNumberRegex = /^\+?(\d+\s?)+$/;
        return phoneNumberRegex.test(phoneNumber);
    }

    /**
     * 
     * @private
     * @param {string} email
     * @returns {boolean}
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

module.exports = LecturerManager;