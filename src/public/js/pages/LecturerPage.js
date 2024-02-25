class Page {
    constructor(app) {
        this.app = app;
        this.lecturerAPI = new LecturerAPI();
        this.lecturerElement = $('[data-lecturer]');
    }

    init = async () => {
        const lecturerUUID = this.app.getUUID();
        if (!(lecturerUUID && lecturerUUID[0])) {
            $(location).attr('href', '/404');
            return;
        }
        
        this.lecturerUUID = lecturerUUID[0];
        await this.loadLecturer();
    }

    loadLecturer = async () => {
        const lecturer = await this.lecturerAPI.getLecturer(this.lecturerUUID);

        if (!lecturer) {
            $(location).attr('href', '/404');
            return;
        }

        this.renderLecturer(lecturer);
        this.app.hideLoader();
    }

    renderLecturer = async (data) => {
        if (data.picture_url) {
            $('<img>').addClass('lecturer-profileImage').attr('src', data.picture_url).appendTo(this.lecturerElement);
        }
        
        const lecturerContent = $('<div>').addClass('lecturer-content flex flex-col').appendTo(this.lecturerElement);
        const profile = $('<div>').addClass('flex flex-col md:flex-row').appendTo(lecturerContent);
        const profileInfo = $('<div>').appendTo(profile);
        
        const name = [ data.title_before, data.first_name, data.middle_name, data.last_name, data.title_after ].filter(part => part !== "").join(' ');
        $('<h1>').addClass('lecturer-name').text(name).appendTo(profileInfo);

        if (data.claim) {
            $('<p>').addClass('lecturer-claim').text(data.claim).appendTo(profileInfo);
        }
        
        if (data.tags) {
            const lecturerTags = $('<div>').addClass('lecturer-tags').appendTo(profileInfo);
            data.tags.forEach(tag => $('<p>').text(tag.name).appendTo(lecturerTags));
        }

        if (data.location || data.price_per_hour) {
            const rowBox = $('<div>').addClass('flex flex-row space-x-2').appendTo(
                $('<div>').addClass('min-w-fit md:ml-auto').appendTo(profile)
            );

            if (data.location) {
                $('<p>').addClass('lecturer-location').text(data.location).appendTo(rowBox);
            }

            if (data.price_per_hour) {
                $('<p>').addClass('lecturer-price').text(`${data.price_per_hour} Kč/h`).appendTo(rowBox);
            }
        }

        if (data.contact && (data.contact.emails || data.contact.telephone_numbers)) {
            const contactBox = $('<div>').addClass('flex flex-wrap gap-4 my-4').appendTo(lecturerContent);

            if (data.contact.emails) {
                const info = $('<div>').addClass('lecturer-rowBox').appendTo(contactBox).append($('<h1>').text('Emails'));

                const emails = $('<div>').addClass('flex flex-col space-y-1').appendTo(info);
                data.contact.emails.forEach(email => $('<a>').attr('href', `mailto:${email}`).text(email).appendTo(emails));
            }

            if (data.contact.telephone_numbers) {
                const info = $('<div>').addClass('lecturer-rowBox').appendTo(contactBox).append($('<h1>').text('Telephone Numbers'));

                const telephoneNumbers = $('<div>').addClass('flex flex-col space-y-1').appendTo(info);
                data.contact.telephone_numbers.forEach(telephoneNumber => $('<a>').attr('href', `tel:${telephoneNumber}`).text(telephoneNumber).appendTo(telephoneNumbers));
            }
        }

        if (data.bio) {
            $('<p>').addClass('lecturer-bio').text(data.bio).appendTo(lecturerContent);
        }

        // Reservation form consists of firstName, lastName, email, message, date and time and a submit button. it should be flex-column and have a gap. Please use the right colors
        const reservationForm = $('<form>').addClass('flex flex-col gap-4').appendTo(lecturerContent);
        $('<h1>').text('Rezervace').appendTo(reservationForm).addClass('text-2xl mx-auto font-bold');
        $('<input>').attr('type', 'text').attr('placeholder', 'Jméno').appendTo(reservationForm).addClass('bg-transparent').attr('id', 'firstName')
        $('<input>').attr('type', 'text').attr('placeholder', 'Příjmení').appendTo(reservationForm).addClass('bg-transparent').attr('id', 'lastName')
        $('<input>').attr('type', 'email').attr('placeholder', 'Email').appendTo(reservationForm).addClass('bg-transparent').attr('id', 'email')
        $('<input>').attr('type', 'tel').attr('placeholder', 'Telefon').appendTo(reservationForm).addClass('bg-transparent').attr('id', 'telephone')
        $('<input>').attr('type', 'text').attr('placeholder', 'Místo').appendTo(reservationForm).addClass('bg-transparent').attr('id', 'location')
        $('<textarea>').attr('placeholder', 'Zpráva').appendTo(reservationForm).addClass('bg-transparent').attr('id', 'message');
        $('<input>').attr('type', 'datetime-local').appendTo(reservationForm).addClass('bg-transparent').attr('id', 'time');
        $('<button>').text('Rezervovat').addClass('btn').on('click', this.reserveLecturer).appendTo(reservationForm);

        
        
        $('title').text(`${name} | ${$('title').text()}`);
        this.lecturerElement.show();
    }

    reserveLecturer = async (e) => {
        e.preventDefault();
        alert('Rezervace');
        var time = new Date(document.getElementById('time').value).getTime();

        console.log(JSON.stringify({
            "firstName" : document.getElementById('firstName').value,
            "lastName" : document.getElementById('lastName').value,
            "email" : document.getElementById('email').value,
            "phoneNumber": document.getElementById('telephone').value,
            "event": {
                "name": document.getElementById('message').value,
                "location": document.getElementById('location').value,
                "start":  time,
                "end": time + 3600
            }
        }));

        const response = await fetch(`/api/lecturers/${this.app.getUUID()[0]}/event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "firstName" : document.getElementById('firstName').value,
                "lastName" : document.getElementById('lastName').value,
                "email" : document.getElementById('email').value,
                "phoneNumber": document.getElementById('telephone').value,
                "event": {
                    "name": document.getElementById('message').value,
                    "location": document.getElementById('location').value,
                    "start":  time,
                    "end": time + 3600
                }
            }),
        });
        console.log(response);
    }
}