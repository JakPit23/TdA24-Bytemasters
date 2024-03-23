class Page {

    constructor(app) {
        this.app = app;
        this.api = new API();
        this.activitiesList = $("[data-activities]");
        this.searchBar = $("[data-searchInput]");
        this.init();
    }

    async init() {
        let activities = await this.loadActivities();
        console.log(activities);
        if(activities.length == 0)  {
            $("<h1>").text("Žádné aktivity nebyly nalezeny").addClass("col-span-3 mx-auto text-3xl font-bold").appendTo(this.activitiesList);
            $("<p>").text("Začněte tím, že vytvoříte novou aktivitu.").addClass("col-span-3 mx-auto text-xl btn btn-big").appendTo(this.activitiesList);
            await this.app.hideLoader();
            return;
        }
        this.searchBar.on("input", () => this._fetchSearch());   
        activities.forEach(activity => this.renderActivity(activity));
        await this.app.hideLoader();
    }

    loadActivities = async () => {
        return await this.api.getActivities();
    }

    _fetchSearch = async () => {
        const search = this.searchBar.val();
        this.searchNow = Date.now();
        setTimeout(async () => {
            if(this.searchNow + 500 < Date.now()) {
                console.log("Searching for:", search);
                this.app.showLoader("[data-loader]");
                const activities = await this.api.searchActivities(search);
                this.activitiesList.empty();
                activities.forEach(activity => this.renderActivity(activity));
            }
        }, 500);
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