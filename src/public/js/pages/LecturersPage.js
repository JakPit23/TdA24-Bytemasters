class Page {
    constructor(app) {
        this.app = app;
        this.lecturerAPI = new LecturerAPI();
        this.filterButton = $('[data-filterButton]');
        this.filterBox = $('[data-filterBox]');
        this.searchInput = $('[data-searchInput]');
        this.lecturersList = $('[data-lecturers]');
        this.noResults = $('[data-noResults]');
        
        this.filterPriceMinInput = $('[data-filterPrice-minInput]');
        this.filterPriceMaxInput = $('[data-filterPrice-maxInput]');

        this.filterTags = $('[data-filterTags]');
        this.filterLocation = $('[data-filterLocations]');
        this.filterPriceMinInput.on('input', this.filterByPrice.bind(this));
        this.filterPriceMaxInput.on('input', this.filterByPrice.bind(this));
    }

    init = async () => {
        $('[data-navbarLinks]').addClass("md:block");

        this.lecturers = await this.lecturerAPI.getLecturers();
        if (!this.lecturers) {
            this.noResults.show();
            return;
        }

        this.loadLecturers(this.lecturers);

        const tags = [...new Set(this.lecturers.map(lecturer => lecturer.tags).flat().map(tag => JSON.stringify(tag)))].map(tag => JSON.parse(tag));

        tags.forEach(tag => {
            const label = $('<label>').addClass('checkbox checkbox-skyblue').data("uuid", tag.uuid).appendTo(this.filterTags);
            $('<input>').attr('type', 'checkbox').appendTo(label);
            $('<span>').text(tag.name).appendTo(label);
        });

        const locations = [...new Set(this.lecturers.map(lecturer => lecturer.location).filter(location => location !== null))];
        locations.forEach(location => {
            const label = $('<label>').addClass('checkbox checkbox-prussianblue').appendTo(this.filterLocation);
            $('<input>').attr('type', 'checkbox').appendTo(label);
            $('<span>').text(location).appendTo(label);
        });
        
        this.searchInput.on('input', this.searchLecturers.bind(this));
        this.filterButton.on('click', this.openFilterBox.bind(this));

        this.filterLocation.find('input[type="checkbox"]').on('change', this.filterByLocation.bind(this));
        this.filterTags.find('input[type="checkbox"]').on('change', this.filterByTags.bind(this));

        this.minPrice = Math.min(...this.lecturers.filter(lecturer => typeof lecturer.price_per_hour === 'number').map(lecturer => lecturer.price_per_hour));
        this.maxPrice = Math.max(...this.lecturers.filter(lecturer => typeof lecturer.price_per_hour === 'number').map(lecturer => lecturer.price_per_hour));

        this.filterPriceMinInput.val(this.minPrice);
        this.filterPriceMaxInput.val(this.maxPrice);
    }

    filterByPrice() {
        let minPrice = this.filterPriceMinInput.val();
        let maxPrice = this.filterPriceMaxInput.val();

        if (isNaN(minPrice) || isNaN(maxPrice)) {
            return;
        }

        if (minPrice < 0) {
            this.filterPriceMinInput.val(0);
        }

        if (maxPrice < 0) {
            this.filterPriceMaxInput.val(0);
        }
        
        this.getLecturersByPrice(minPrice, maxPrice);
    }

    getLecturersByPrice(minPrice, maxPrice) {
        const filteredLecturers = this.lecturers.filter(lecturer => minPrice <= lecturer.price_per_hour && lecturer.price_per_hour <= maxPrice);
        for (const element of this.lecturersList.children()) {
            const lecturer = filteredLecturers.find(lecturer => lecturer.uuid === $(element).data('lecturerUUID'));

            if (!lecturer) {
                $(element).hide();
                continue;
            }

            $(element).show();
        }
    }


    filterByLocation() {
        const selectedLocations = this.getSelectedLocations();
        if (selectedLocations.length === 0) {
            this.lecturersList.children().show();
            return;
        }

        const filteredLecturers = this.lecturers.filter(lecturer => selectedLocations.includes(lecturer.location));
        for (const element of this.lecturersList.children()) {
            const lecturer = filteredLecturers.find(lecturer => lecturer.uuid === $(element).data('lecturerUUID'));

            if (!lecturer) {
                $(element).hide();
                continue;
            }

            $(element).show();
        }
    }

    filterByTags() {
        const selectedTags = this.getSelectedTags();
        if (selectedTags.length === 0) {
            this.lecturersList.children().show();
            return;
        }

        const filteredLecturers = this.lecturers.filter(lecturer => lecturer.tags.some(tag => selectedTags.includes(tag.uuid)));
        for (const element of this.lecturersList.children()) {
            const lecturer = filteredLecturers.find(lecturer => lecturer.uuid === $(element).data('lecturerUUID'));

            if (!lecturer) {
                $(element).hide();
                continue;
            }

            $(element).show();
        }
    }
    
    getSelectedLocations() {
        return this.filterLocation.find('input[type="checkbox"]:checked').map(function() {
            return $(this).siblings('span').text();
        }).get();
    }
    
    getSelectedTags() {
        return this.filterTags.find('input[type="checkbox"]:checked').map(function() {
            return $(this).parent().data('uuid')
        }).get();
    }

    openFilterBox = () => this.filterBox.toggleClass("!hidden");

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
        this.app.hideLoader('[data-loaderLecturers]');
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

        if (data.location) {
            $('<p>').addClass('lecturer-location').text(data.location).appendTo(contentDiv);
        }

        if (data.tags) {
            const tagsDiv = $('<div>').addClass('lecturer-tags').appendTo(contentDiv);

            data.tags.forEach(tag => $('<p>').text(tag.name).appendTo(tagsDiv));
        }

        if (data.claim) {
            $('<p>').addClass('lecturer-claim').text(data.claim).appendTo(contentDiv);
        }
    }
}