class Page {

    constructor(app) {
        this.app = app;
        this.api = new API();
        this.activitiesList = $("[data-activities]");

        this.init();
    }

    async init() {
        await this.loadActivities();

        await this.app.hideLoader();
    }

    loadActivities = async () => {
        try {
            const activities = await this.api.getActivities();
            console.log(activities);
        } catch (error) {
            console.log("An error occurred while loading activities:", error);
        }
    }

    renderActivity(data) {
        const activityBox = $("<div>").addClass("activity-box").appendTo(this.activitiesList);
        const activityTitle = $("<h2>").text(data.activityName).addClass("font-bold text-3xl").appendTo(activityBox);
    }
}