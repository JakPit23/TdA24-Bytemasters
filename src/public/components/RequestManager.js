class RequestManager {
    static async getRequest(route, parameters = "") {
        let reqURL = `http://${window.location.hostname}:${window.location.port}/api/${route}/${parameters}`;
        return axios.get(reqURL)
        .then(function(response) {
            console.log(response.data)
            return response.data;
        })
    }

    static async delRequest(uuid) {
        let url = `${window.location.protocol}//${window.location.host}/api/lecturers/${uui}`;
        return axios.delete(url)
        .then(function(response)  {
            console.log(response);
            return;
        })
        .catch(err => {
            console.log("SOME ERORR IS HERE");
        })
    }
}