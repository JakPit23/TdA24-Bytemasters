class LecturerAPI {
    getLecturers = async () => {
        const response = await fetch('/api/lecturers');
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    }

    getLecturer = async (uuid) => {
        const response = await fetch(`/api/lecturers/${uuid}`);
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    }
}