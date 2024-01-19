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
    }

    init = async () => {
        $('[data-navbarLinks]').addClass("md:block");

        this.filters = {};

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

        this.filterPriceMinInput.on('input', this.filterByPrice.bind(this));
        this.filterPriceMaxInput.on('input', this.filterByPrice.bind(this));
        this.filterPriceMinInput.val(this.minPrice);
        this.filterPriceMaxInput.val(this.maxPrice);
    }

    filterLecturers = () => {
        console.log("this.filters", this.filters);

        const filteredLecturers = this.lecturers.filter(lecturer => {
            if (this.filters.price) {
                if (this.filters.price.min && lecturer.price_per_hour < this.filters.price.min) {
                    return false;
                }

                if (this.filters.price.max && lecturer.price_per_hour > this.filters.price.max) {
                    return false;
                }
            }

            // janky solution wrote 7 minutes before deadline :D
            if (this.filters.locations && this.filters.locations.length > 0 && !this.filters.locations.includes(lecturer.location)) {
                return false;
            }

            if (this.filters.tags && this.filters.tags.length > 0 && !lecturer.tags.some(tag => this.filters.tags.includes(tag.uuid))) {
                return false;
            }
    
            return true;
        });

        for (const element of this.lecturersList.children()) {
            const lecturer = filteredLecturers.find(lecturer => lecturer.uuid === $(element).data('lecturerUUID'));

            if (!lecturer) {
                $(element).hide();
                continue;
            }

            $(element).show();
        }
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

        (this.filters.price ??= {})["min"] = minPrice;
        (this.filters.price ??= {})["max"] = maxPrice;

        this.filterLecturers();
    }
    
    filterByLocation() {
        const locations = this.filterLocation.find('input[type="checkbox"]:checked').map(function() {
            return $(this).siblings('span').text();
        }).get();

        this.filters.locations = locations;
        this.filterLecturers();
    }
    
    filterByTags() {
        const tags = this.filterTags.find('input[type="checkbox"]:checked').map(function() {
            return $(this).parent().data('uuid')
        }).get();

        this.filters.tags = tags;
        this.filterLecturers();
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