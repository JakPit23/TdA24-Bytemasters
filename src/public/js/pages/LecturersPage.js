// class Page {
//     constructor(app) {
//         this.app = app;
//         this.lecturerAPI = new LecturerAPI();
//         this.filterButton = $('[data-filterButton]');
//         this.filterBox = $('[data-filterBox]');
//         this.searchInput = $('[data-searchInput]');
//         this.lecturersElement = $('[data-lecturers]');
//         this.noResults = $('[data-noResults]');
        
//         this.searchInput.on('input', this.searchLecturers)
//         this.filterButton.on('click', this.openFilterBox)
//         this.init();
//     }

//     init = async () => {
//         await this.loadLecturers();

//         this.app.hideLoader();
//     }
    
//     openFilterBox = () => this.filterBox.toggle();

//     searchLecturers = async () => {
//         const query = this.searchInput.val();

//         let lecturers = await this.lecturerAPI.getLecturers();
//         if (!query) {
//             return this.loadLecturers();
//         }

//         lecturers = lecturers.filter(lecturer => {
//             const name = [ lecturer.title_before, lecturer.first_name, lecturer.middle_name, lecturer.last_name, lecturer.title_after ].filter(part => part !== "").join(' ');

//             return name.toLowerCase().includes(query.toLowerCase());
//         });

//         if (lecturers.length <= 0) {
//             this.lecturersElement.empty();
//             this.noResults.show();
//             return;
//         }

//         if (this.noResults.is(":visible")) {
//             this.noResults.hide();
//         }

//         for (const lecturer of lecturers) {
//             if (this.lecturersElement.children().find(element => $(element).data('lecturerUUID') === lecturer.uuid)) {
//                 continue;
//             }

//             this.renderLecturer(lecturer);
//         }
        
//         this.lecturersElement.children().each((index, element) => {
//             if (lecturers.find(lecturer => lecturer.uuid === $(element).data('lecturerUUID'))) {
//                 lecturers.forEach(lecturer => this.renderLecturer(lecturer));
//                 return;
//             }

//             $(element).remove();
//         });
//     }

//     loadLecturers = async () => {
//         const lecturers = await this.lecturerAPI.getLecturers();

//         if (!lecturers) {
//             this.noResults.show();
//             return;
//         }

//         lecturers.forEach(lecturer => this.renderLecturer(lecturer));
//     }

//     renderLecturer = async (data) => {
//         const lecturerDiv = $('<div>').addClass('lecturerCard').data('lecturerUUID', data.uuid).appendTo(this.lecturersElement);
//         lecturerDiv.on("click", () => $(location).attr('href', `/lecturer/${data.uuid}`));

//         if (data.picture_url) {
//             const loadImage = (url) => {
//                 return new Promise((resolve) => {
//                     const profilePicture = new Image();
//                     profilePicture.onload = () => resolve(profilePicture);
//                     profilePicture.src = url;
//                 });
//             };

//             const profilePicture = await loadImage(data.picture_url);
//             $(profilePicture).addClass('lecturer-profileImage').appendTo(lecturerDiv);
//         }
    
//         const contentDiv = $('<div>').addClass('lecturer-content').appendTo(lecturerDiv);
//         const name = [ data.title_before, data.first_name, data.middle_name, data.last_name, data.title_after ].filter(part => part !== "").join(' ');
//         $('<h1>').addClass('lecturer-name').text(name).appendTo(contentDiv);

//         if (data.price_per_hour) {
//             $('<p>').addClass('lecturer-price').text(`${data.price_per_hour} Kč/h`).appendTo(contentDiv);
//         }

//         if (data.tags) {
//             const tagsDiv = $('<div>').addClass('lecturer-tags').appendTo(contentDiv);

//             data.tags.forEach(tag => {
//                 if (tagsDiv.children().length >= 3) {
//                     return;
//                 }

//                 $('<p>').text(tag.name).appendTo(tagsDiv);
//             });
//         }

//         if (data.claim) {
//             $('<p>').addClass('lecturer-claim').text(data.claim).appendTo(contentDiv);
//         }
//     }
// }

class Page {
    constructor(app) {
        this.app = app;
        this.lecturerAPI = new LecturerAPI();
        this.filterButton = $('[data-filterButton]');
        this.filterBox = $('[data-filterBox]');
        this.searchInput = $('[data-searchInput]');
        this.lecturersList = $('[data-lecturers]');
        this.noResults = $('[data-noResults]');
        
        this.searchInput.on('input', this.searchLecturers);
        this.filterButton.on('click', this.openFilterBox);
        this.init();
    }

    init = async () => {
        this.lecturers = await this.lecturerAPI.getLecturers();

        if (!this.lecturers) {
            this.noResults.show();
            return;
        }

        this.loadLecturers(this.lecturers);
    }

    openFilterBox = () => this.filterBox.toggle();

    searchLecturers = async () => {
        const query = this.searchInput.val();
        if (!query) {
            this.lecturersList.children().show();
            return;
        }

        const lecturers = this.lecturers.filter(lecturer => {
            const name = [ lecturer.title_before, lecturer.first_name, lecturer.middle_name, lecturer.last_name, lecturer.title_after ].filter(part => part !== "").join(' ');
            
            return name.toLowerCase().includes(query.toLowerCase());
        });
        
        if (lecturers.length <= 0) {
            this.lecturersList.children().hide();
            this.noResults.show();
            return;
        }

        this.noResults.hide();

        for (const element of this.lecturersList.children()) {
            const lecturer = lecturers.find(lecturer => lecturer.uuid === $(element).data('lecturerUUID'));

            if (!lecturer) {
                $(element).hide();
                continue;
            }

            $(element).show();
        }
    }

    loadLecturers = async (lecturers) => {
        if (!lecturers) {
            this.noResults.show();
            return;
        }
        
        lecturers.forEach(lecturer => this.renderLecturer(lecturer));

        this.lecturersList.show();
        this.app.hideLoader();
    }

    renderLecturer = async (data) => {
        const lecturerDiv = $('<div>').addClass('lecturerCard').data('lecturerUUID', data.uuid).appendTo(this.lecturersList);
        lecturerDiv.on("click", () => $(location).attr('href', `/lecturer/${data.uuid}`));

        if (data.picture_url) {
            const loadImage = (url) => {
                return new Promise((resolve) => {
                    const profilePicture = new Image();
                    profilePicture.onload = () => resolve(profilePicture);
                    profilePicture.src = url;
                });
            };

            const profilePicture = await loadImage(data.picture_url);
            $(profilePicture).addClass('lecturer-profileImage').appendTo(lecturerDiv);
        }
    
        const contentDiv = $('<div>').addClass('lecturer-content').appendTo(lecturerDiv);
        const name = [ data.title_before, data.first_name, data.middle_name, data.last_name, data.title_after ].filter(part => part !== "").join(' ');
        $('<h1>').addClass('lecturer-name').text(name).appendTo(contentDiv);

        if (data.price_per_hour) {
            $('<p>').addClass('lecturer-price').text(`${data.price_per_hour} Kč/h`).appendTo(contentDiv);
        }

        if (data.tags) {
            const tagsDiv = $('<div>').addClass('lecturer-tags').appendTo(contentDiv);

            data.tags.forEach(tag => {
                if (tagsDiv.children().length >= 3) {
                    return;
                }

                $('<p>').text(tag.name).appendTo(tagsDiv);
            });
        }

        if (data.claim) {
            $('<p>').addClass('lecturer-claim').text(data.claim).appendTo(contentDiv);
        }
    }
}