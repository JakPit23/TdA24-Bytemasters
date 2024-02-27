class LecturerAPI {
    /**
     * @param {object} options 
     * @param {number} options.limit
     * @param {string} options.before
     * @param {string} options.after
     * @returns {Promise<object>}
     */
    getLecturers = async (options = {}) => {
        try {
            const response = await fetch(`/api/lecturers?${new URLSearchParams(options).toString()}`);

            if (response.status != 200) {
                throw Error(body.message);
            }

            return await response.json();
        } catch (error) {
            // TODO: pridat logger vec
            console.error(error);

            throw error;
        }
    }

    getLecturer = async (uuid) => {
        const response = await fetch(`/api/lecturers/${uuid}`);
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    }
}