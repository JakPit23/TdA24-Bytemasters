class Calendar {
    exportCalendar() {
        return document.getElementById('calendar');   
    }

    exportEvents() {
        return document.getElementById('external-events');
    }
}

this.exporter = new Calendar();