class Page {

    constructor(app) {
        this.app = app;
        this.api = new API();
        this.activitiesList = $("[data-activities]");

        this.init();
    }

    async init() {
        let activities = await this.loadActivities();
        console.log(activities);
        activities.forEach(activity => {
            this.renderActivity(activity);
        });
        await this.app.hideLoader();
    }

    loadActivities = async () => {
        try {
            const activities = await this.api.getActivities();
            return activities;
        } catch (error) {
            console.log("An error occurred while loading activities:", error);
        }

    }

    renderActivity(data) {
        const activityBox = $("<div>").addClass("activity activity-box").appendTo(this.activitiesList);
        const activityTitle = $("<h2>").text(data.activityName).addClass("font-bold text-3xl").appendTo(activityBox);
        const activityContent = $("<div>").addClass("flex flex-row").appendTo(activityBox);
        $("<img>").attr("src", data.gallery[0].images[0].lowRes).appendTo(activityContent);
        const activityDescription = $("<div>").addClass("flex flex-col").appendTo(activityContent);
        $("<p>").text(data.description).appendTo(activityDescription);
        $("<h3*>")
    }
}