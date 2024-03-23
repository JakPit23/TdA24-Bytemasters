class Page {

    constructor(app) {
        this.app = app;
        this.api = new API();

        this.activitiesList = $("[data-activities]");
    }
/* 
    renderActivities(data) {
        const activityBox = $('<div>').addClass('activity-box').appendTo(this.activitiesList);

        $('<h3>').text(data.activityName).appendTo(activityBox);

    } */
}