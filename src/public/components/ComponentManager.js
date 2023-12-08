class ComponentManager {
    constructor() {
        console.log("Component Manager ready");
        this.uuid = this.getUUID()
        this.content = "";
        this.fillPage();
    }

    // Fill page with content
    async fillPage () { 
        this.content = await this.getContent(this.uuid); 

        console.log("Here is the content: " + this.content);
    }

    // Send API request and get content for this page
    async getContent(uuid) {
        return axios.get("http://localhost:3000/api/lecturers/" + uuid)
        .then(function(response) {
            console.log(response.data)
            return response.data;
        })
    }
    
    // Create content and append it to parent
    createAndAppend(tag, content, appendTo) {
        let newTag = document.createElement(tag);
        if(tag != "img") {
            newTag.innerHTML = content;
        } else {
            newTag.src = content;
        }
        parent = document.getElementById(appendTo);
        parent.appendChild(newTag);
    }

    // Get UUID from URL using Regex
    getUUID() {
        const url = window.location.pathname
        // What does this mean?
        const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[14][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

        const match = url.match(uuidPattern);
        if (match) {
            return match[0];
        } else {
            return null;
  }
}
}