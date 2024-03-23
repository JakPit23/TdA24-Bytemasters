class Page {
    constructor(app) {
        this.app = app;
        this.api = new API();

        this.activitiesList = $("[data-activities]");
        this.searchBar = $("[data-searchInput]");
        this.formBtn = $("[data-formBtn]");
        this.form = $("[data-createActivity]");

        this.init();
    }

    async init() {
        await this.loadActivities();
        this.searchBar.on("input", () => this.fetchSearch());   
        this.formBtn.on("click", () => this.toggleForm());  
        console.log("hiding loader");
        await this.app.hideLoader();
    }

    toggleForm() {
        console.log("Toggling form");
        this.form.toggleClass("hidden");
    }

    async loadActivities(activities = null) {
        this.activitiesList.empty();

        if (!activities) {
            // TODO: before, after, limit
            console.log("[DEBUG] Activities are null, fetching...");
            activities = await this.api.getActivities();
        }

        if (activities.length == 0) {
            $("<h1>").text("Žádné aktivity nebyly nalezeny").addClass("col-span-3 mx-auto text-3xl font-bold").appendTo(this.activitiesList);
            $("<p>").text("Začněte tím, že vytvoříte novou aktivitu.").addClass("col-span-3 mx-auto text-xl btn btn-big").appendTo(this.activitiesList);
            return;            
        }

        activities.forEach(activity => this.renderActivity(activity));
        console.log("done1");
    }

    async _fetchSearch() {
        if (this.searchNow + 500 > Date.now()) {
            console.log("[DEBUG] Search throttled")
            return;
        }

        this.app.showLoader("[data-loader]");
        const search = this.searchBar.val();
        const activities = await this.api.searchActivities(search);
        this.loadActivities(activities);
    }

    async fetchSearch() {
        this.searchNow = Date.now();
        setTimeout(() => this._fetchSearch(), 500);
    }

    renderActivity(data) {
        const activityBox = $("<div>").addClass("activity").appendTo(this.activitiesList);
        activityBox.on("click", () => window.location.href = `/activity/${data.uuid}`);
        if(data.gallery && Array.isArray(data.gallery)) {
            $("<img>").attr("src", data.gallery[0].images[0].lowRes).addClass("activity-image").appendTo(activityBox);
        }
        
        const activityDescription = $("<div>").addClass("flex flex-col").appendTo(activityBox);
        $("<h2>").text(data.activityName).addClass("font-bold text-2xl").appendTo(activityDescription);
        $("<p>").text(data.description).appendTo(activityDescription);
    }
}