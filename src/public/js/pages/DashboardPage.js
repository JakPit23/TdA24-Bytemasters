class DashboardPage {
    constructor(app, uuid) {
        this.app = app;
        this.uuid = uuid;
        this.calendar = new CalendarModule(this.app, this.uuid);
    }
}

this.dash = new DashboardPage(this.app, this.uuid);