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

        const tags = this.lecturers.flatMap(lecturer => lecturer.tags)
            .filter(tag => tag && typeof tag == "object")
            .reduce((uniqueTags, currentTag) => {
                if (!uniqueTags.some(tag => tag.uuid == currentTag.uuid)) {
                    uniqueTags.push({ uuid: currentTag.uuid, name: currentTag.name });
                }
                
                return uniqueTags;
            }, []);

        tags.forEach(tag => {
            const label = $('<label>').addClass('checkbox checkbox-skyblue').data("uuid", tag.uuid).appendTo(this.filterTags);
            $('<input>').attr('type', 'checkbox').appendTo(label);
            $('<span>').text(tag.name).appendTo(label);
        });

        const locations = this.lecturers.flatMap(lecturer => lecturer.location)
            .filter(location => location !== null)
            .reduce((uniqueLocations, currentLocation) => {
                if (!uniqueLocations.includes(currentLocation)) {
                    uniqueLocations.push(currentLocation);
                }

                return uniqueLocations;
            }, []);
        
        locations.forEach(location => {
            const label = $('<label>').addClass('checkbox checkbox-prussianblue').appendTo(this.filterLocation);
            $('<input>').attr('type', 'checkbox').appendTo(label);
            $('<span>').text(location).appendTo(label);
        });
        
        this.searchInput.on('input', this.filterBySearch.bind(this));
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

            if (this.filters.tags && this.filters.tags.length > 0 && lecturer.tags && !lecturer.tags.some(tag => this.filters.tags.includes(tag.uuid))) {
                return false;
            }

            if (this.filters.search) {
                const name = [ lecturer.title_before, lecturer.first_name, lecturer.middle_name, lecturer.last_name, lecturer.title_after ].filter(part => part !== "").join(' ');
                return name.toLowerCase().includes(this.filters.search.toLowerCase());
            }
    
            return true;
        });

        if (filteredLecturers.length <= 0) {
            this.lecturersList.children().hide();
            this.noResults.show();
            return;
        }

        this.noResults.hide();

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

    filterBySearch = () => {
        const query = this.searchInput.val();

        this.filters.search = query;
        this.filterLecturers();
    }

    openFilterBox = () => this.filterBox.toggleClass("!hidden");

    loadLecturers = async (lecturers) => {
        if (lecturers.length <= 0) {
            this.app.hideLoader('[data-loaderLecturers]');
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
            $('<img>').addClass('lecturer-profileImage').attr('src', data.picture_url).appendTo(lecturerDiv);
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