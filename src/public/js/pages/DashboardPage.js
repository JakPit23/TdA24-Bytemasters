class DashboardPage {
    constructor(app) {
        this.app = app;
        this.calendar = new CalendarModule();
    }
}

this.dash = new DashboardPage(this.app);