class DashboardPage {
    constructor(app, uuid) {
        this.app = app;
        this.uuid = uuid;
        new CalendarModule(this.app, this.uuid);
        this.btn = document.getElementById('timeBtn');
        this.btn.addEventListener('click', this.toggleForm);
        /* $('[data-addFreeTime]').on('click', this.addFreeTime); */
        $('[data-logout]').on('click', this.logoutUser);
    }

    toggleForm = () => {
        const form = document.getElementById('timeForm');
        form.classList.toggle('hidden');
    }

    logoutUser = async() => {
        const response = await fetch('/api/auth/logout', {
            method: 'POST'
        })
        if (response.status === 200) {
            window.location.href = '/';
        }
    }

    addFreeTime = async() => {
        const response = await fetch(`/api/user/@me`, {
           method: 'PATCH',
           body: JSON.stringify({
               "start": new Date($('[data-timeFrom]')[0].val).getTime(),
               "end": new Date($('[data-timeTo]')[0].val).getTime()
           }),       
    })
}
}

this.dash = new DashboardPage(this.app, this.uuid);