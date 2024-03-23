class Page {
    constructor(app) {
        this.app = app;
        this.api = new API();
        this.init();
        
        this.info = $("[data-info]");
        this.approve = $("[data-approve");
        this.approve.on("click", this.approveActivity.bind(this));
    }

    async init() {
        this.app.hideLoader();
        this.params = new URLSearchParams(document.location.search);
        let edit = this.params.get("edit"); // is the string "Jonathan"
        console.log("EI: ", edit);
        if(edit) {
            console.log("Editing"); 
            
        }
    }

    approveActivity() {
        this.api.approveActivity(window.location.pathname.replace("/activity/", ""));
    }
}