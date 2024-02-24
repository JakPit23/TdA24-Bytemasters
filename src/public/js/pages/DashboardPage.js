class DashboardPage {
    constructor(app) {
        this.app = app;
        this.uuid = this.app.getUUID()[0];
        this.calendar = new CalendarModule(this.app);
    }
}

this.dash = new DashboardPage(this.app);