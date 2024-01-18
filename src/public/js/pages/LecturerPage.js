class Page {
    constructor(app) {
        this.app = app;
        this.lecturerAPI = new LecturerAPI();
        this.lecturerElement = $('[data-lecturer]');
        
        this.init();
    }

    init = async () => {
        const lecturerUUID = window.location.pathname.match(/[0-9a-f]{8}-[0-9a-f]{4}-[14][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
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
            const loadImage = (url) => {
                return new Promise((resolve) => {
                    const profilePicture = new Image();
                    profilePicture.onload = () => resolve(profilePicture);
                    profilePicture.src = url;
                });
            };

            const profilePicture = await loadImage(data.picture_url);
            $(profilePicture).addClass('lecturer-profileImage').appendTo(this.lecturerElement);
        }
        
        const lecturerContent = $('<div>').addClass('lecturer-content flex flex-col').appendTo(this.lecturerElement);
        const profile = $('<div>').addClass('flex').appendTo(lecturerContent);
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
                $('<div>').addClass('min-w-fit ml-auto').appendTo(profile)
            );

            if (data.location) {
                $('<p>').addClass('lecturer-location').text(data.location).appendTo(rowBox);
            }

            if (data.price_per_hour) {
                $('<p>').addClass('lecturer-price').text(`${data.price_per_hour} Kč/h`).appendTo(rowBox);
            }
        }

        if (data.contact && (data.contact.emails || data.contact.telephone_numbers)) {
            const contactBox = $('<div>').addClass('flex flex-wrap space-x-4 my-4').appendTo(lecturerContent);

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

        $('title').text(`${name} | ${$('title').text()}`);
        this.lecturerElement.show();
    }
}