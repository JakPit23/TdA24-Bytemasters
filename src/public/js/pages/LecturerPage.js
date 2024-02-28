class Page {
    /**
     * @param {Application} app 
     * @param {string} uuid 
     */
    constructor(app, uuid) {
        this.app = app;
        this.uuid = uuid;
        this.api = new API();

        this.lecturerElement = $('[data-lecturer]');
        this.reservationForm = $('[data-reservationForm]');

        this.init();
    }

    init() {
        this.reservationForm.on('submit', this._reserveLecturer.bind(this));
        this.app.hideLoader();
    }

    async _reserveLecturer(event) {
        event.preventDefault();

        const reserveButton = this.reservationForm.find(":submit");
        const firstName = $('[data-reservationInput="firstName"]').val();
        const lastName = $('[data-reservationInput="lastName"]').val();
        const email = $('[data-reservationInput="email"]').val();
        const phoneNumber = $('[data-reservationInput="phoneNumber"]').val();
        const message = $('[data-reservationInput="message"]').val();
        const location = $('[data-reservationInput="location"]').val();

        // nejvic messy vec :3
        const reservationTimeStart = this.app.getDateTimeFromString($('[data-reservationInput="timeStart"]').val());
        const reservationTimeEnd = this.app.getTimeFromString($('[data-reservationInput="timeEnd"]').val());
        reservationTimeEnd.setDate(reservationTimeStart.getDate());
        reservationTimeEnd.setMonth(reservationTimeStart.getMonth());
        reservationTimeEnd.setFullYear(reservationTimeStart.getFullYear());
        
        try {
            await this.api.createReservation(this.uuid, {
                start: Math.floor(reservationTimeStart.getTime() / 1000),
                end: Math.floor(reservationTimeEnd.getTime() / 1000),
                firstName,
                lastName,
                email,
                phoneNumber,
                message,
                location
            });

            reserveButton.prop('disabled', true).addClass("!bg-green-600").text("Rezervace úspěšně odeslána");
        } catch (error) {
            console.log("An error occurred while reserving:", error);

            const errorMessage = error.displayMessage || "Nastala neznámá chyba";
            reserveButton.prop("disabled", true).addClass("!bg-red-500").text(errorMessage);
            setTimeout(() => reserveButton.prop("disabled", false).removeClass("!bg-red-500").text("Rezervovat"), 2500);
        }
    }
}