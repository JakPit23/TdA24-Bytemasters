class DashboardPage {
    constructor(app, uuid) {
        this.app = app;
        this.uuid = uuid;
        new CalendarModule(this.app, this.uuid);
        this.btn = document.getElementById('timeBtn');
        this.btn.addEventListener('click', this.toggleForm);
    }

    toggleForm = () => {
        const form = document.getElementById('timeForm');
        form.classList.toggle('hidden');
    }
}

this.dash = new DashboardPage(this.app, this.uuid);