class Page {
    /**
     * @param {Application} app 
     */
    constructor(app) {
        this.app = app;
        this.api = new API();

        this.filterButton = $('[data-filterButton]');
        this.filterBox = $('[data-filterBox]');
        this.searchInput = $('[data-searchInput]');
        this.lecturersList = $('[data-lecturers]');
        this.noResults = $('[data-noResults]');
        
        this.filterPriceMinInput = $('[data-filterPrice-minInput]');
        this.filterPriceMaxInput = $('[data-filterPrice-maxInput]');

        this.filterTags = $('[data-filterTags]');
        this.filterLocation = $('[data-filterLocations]');

        this.init();
    }

    /**
     * @private
     */
    _openFilterBox = () => this.filterBox.toggleClass("!hidden");

    /**
     * @private
     */
    _filterByPrice() {
        const minPrice = this.filterPriceMinInput.val();
        const maxPrice = this.filterPriceMaxInput.val();

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
    
    /**
     * @private
     */
    _filterByLocation() {
        this.filters.locations = this.filterLocation.find('input[type="checkbox"]:checked').map(function() {
            return $(this).siblings('span').text();
        }).get();

        this.filterLecturers();
    }
    
    /**
     * @private
     */
    _filterByTags() {
        this.filters.tags = this.filterTags.find('input[type="checkbox"]:checked').map(function() {
            return $(this).parent().data('uuid')
        }).get();

        this.filterLecturers();
    }

    /**
     * @private
     */
    _filterBySearch = () => {
        this.filters.search = this.searchInput.val();
        this.filterLecturers();
    }

    /**
     * @private
     */
    async _fetchMoreLecturers() {
        console.log('Loading more items...');
        this._fetchInProgress = true;

        const lecturers = await this._fetchLecturers({ limit: 25, after: this.lecturers[this.lecturers.length - 1].uuid });
        if (!lecturers || lecturers.length <= 0) {
            this.app.hideLoader('[data-loaderLecturers]');
            console.log('No more items to load...');
            return;
        }

        this.lecturers.push(...lecturers);
        this.loadLecturers(lecturers);
        this._fetchInProgress = false;
    }

    /**
     * @private
     */
    async _fetchLecturers(options = {}) {
        try {
            this.app.showLoader("[data-loaderLecturers]");
            const lecturers = await this.api.getLecturers(options);
            return lecturers;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async init() {
        this.filters = {};
        this.lecturers = await this._fetchLecturers({ limit: 25 });

        if (!this.lecturers) {
            this.noResults.show();
            this.app.hideLoader('[data-loaderPage]');
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
        
        this.searchInput.on('input', this._filterBySearch.bind(this));
        this.filterButton.on('click', this._openFilterBox.bind(this));

        this.filterLocation.find('input[type="checkbox"]').on('change', this._filterByLocation.bind(this));
        this.filterTags.find('input[type="checkbox"]').on('change', this._filterByTags.bind(this));

        this.minPrice = Math.min(...this.lecturers.filter(lecturer => typeof lecturer.price_per_hour === 'number').map(lecturer => lecturer.price_per_hour));
        this.maxPrice = Math.max(...this.lecturers.filter(lecturer => typeof lecturer.price_per_hour === 'number').map(lecturer => lecturer.price_per_hour));

        this.filterPriceMinInput.on('input', this._filterByPrice.bind(this));
        this.filterPriceMaxInput.on('input', this._filterByPrice.bind(this));
        this.filterPriceMinInput.val(this.minPrice);
        this.filterPriceMaxInput.val(this.maxPrice);

        $(window).scroll(async () => {
            const windowBottom = $(window).scrollTop() + $(window).height();
            const gridBottom = this.lecturersList.offset().top + this.lecturersList.outerHeight();
            
            if (windowBottom <= gridBottom - 200) {
                return;
            }

            if (!this.lecturers || this.lecturers.length <= 0) {
                console.log('No items to load...');
                return;
            }
            
            if (this._fetchInProgress) {
                console.log('Fetch in progress, skipping...');
                return;
            }

            await this._fetchMoreLecturers();
        });

        this.app.hideLoader('[data-loaderPage]');
    }

    loadLecturers(lecturers) {
        if (lecturers.length <= 0) {
            this.noResults.show();
            this.app.hideLoader('[data-loaderLecturers]');
            return;
        }
        
        lecturers.forEach(lecturer => this.renderLecturer(lecturer));
        this.lecturersList.show();
        this.app.hideLoader('[data-loaderLecturers]');
    }

    filterLecturers() {
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
                const name = [ lecturer.title_before, lecturer.first_name, lecturer.middle_name, lecturer.last_name, lecturer.title_after ].filter(part => part != undefined).join(' ');

                return lecturer.tags.some(tag => tag.name.toLowerCase().includes(this.filters.search.toLowerCase()))
                    || lecturer.location.toLowerCase().includes(this.filters.search.toLowerCase())
                    || lecturer.claim.toLowerCase().includes(this.filters.search.toLowerCase())
                    || name.toLowerCase().includes(this.filters.search.toLowerCase())
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

    renderLecturer(data) {
        const lecturerDiv = $('<div>').addClass('lecturerCard').data('lecturerUUID', data.uuid).appendTo(this.lecturersList);
        lecturerDiv.on("click", () => $(location).attr('href', `/lecturer/${data.uuid}`));

        if (data.picture_url) {
            $('<img>').addClass('lecturer-profileImage').attr('src', data.picture_url).appendTo(lecturerDiv);
        } else {
            $('<div>').addClass('lecturer-profileImage flex justify-center items-center').appendTo(lecturerDiv).append($('<i>').addClass('fa-solid fa-user placeholder'));
        }
    
        const contentDiv = $('<div>').addClass('lecturer-content').appendTo(lecturerDiv);
        $('<h1>').addClass('lecturer-name').text(
            [ data.title_before, data.first_name, data.middle_name, data.last_name, data.title_after ]
                .filter(part => part != undefined)
                .join(' ')
        ).appendTo(contentDiv);

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