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
            await this.api.createAppointment(this.uuid, {
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

            let errorMessage = error.displayMessage;
            if (error.type == APIError.Types.InvalidValueType) {
                switch (error.data.valueName) {
                    case "start":
                        if (error.data.requiredType == "working_hours") {
                            errorMessage = "Čas rezervace musí být v pracovní době (8:00 - 20:00)";
                            break;
                        }
                    case "end":
                        errorMessage = "Nastala chyba při zpracování data a času";
                        break;
                    case "start,end":
                        if (error.data.requiredType == "minutes") {
                            errorMessage = "Rezervace nemůže obsahovat minuty";
                            break;
                        }

                        if (error.data.requiredType == "start_after_end") {
                            errorMessage = "Rezervace nemůže začínat po jejím konci";
                            break;
                        }

                        break;
                    case "firstName":
                        errorMessage = "Špatně zadané jméno";
                        break;
                    case "lastName":
                        errorMessage = "Špatně zadané příjmení";
                        break;
                    case "email":
                        errorMessage = "Špatně zadaný email";
                        break;
                    case "phoneNumber":
                        errorMessage = "Špatně zadané telefonní číslo";
                        break;
                    case "location":
                        errorMessage = "Špatně zadaná lokace";
                        break;
                }
            } 

            if (error.type == APIError.Types.InvalidValueLength) {
                switch (error.data.valueName) {
                    case "start":
                    case "end":
                        errorMessage = "Datum a čas nejsou v požadováném formátu";
                        break;
                    case "firstName":
                        errorMessage = `Jméno musí být v rozsahu ${error.data.minLength} až ${error.data.maxLength} znaků`;
                        break;
                    case "lastName":
                        errorMessage = `Příjmení musí být v rozsahu ${error.data.minLength} až ${error.data.maxLength} znaků`;
                        break;
                    case "message":
                        errorMessage = `Zpráva musí být v rozsahu ${error.data.minLength} až ${error.data.maxLength} znaků`;
                        break;
                }
            }

            if (error.type == APIError.Types.DuplicateValue && error.data.valueType == "appointment") {
                errorMessage = "Rezervace v tento čas je již obsazena";
            }

            reserveButton.prop("disabled", true).addClass("!bg-red-500").text(errorMessage);
            setTimeout(() => reserveButton.prop("disabled", false).removeClass("!bg-red-500").text("Rezervovat"), 2500);
        }
    }
}