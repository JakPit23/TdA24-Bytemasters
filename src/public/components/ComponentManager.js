class ComponentManager {
    static getContent(uuid) {
        axios.get("http://localhost:3000/api/lecturers/" + uuid)
        .then(function(response) {
            return response.data;
        })
        .catch(function(error) {
            console.error(error);
        })
    }
    
    static createAndAppend(tag, content, appendTo) {
        let newTag = document.createElement(tag);
        if(tag != "img") {
            newTag.innerHTML = content;
        } else {
            newTag.src = content;
        }
        parent = document.getElementById(appendTo);
        parent.appendChild(newTag);
    }

    getUUID() {
        return window.location.pathname().replace("/lecturer/", "");
    }
}