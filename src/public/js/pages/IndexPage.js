class Page {
    /**
     * @param {Application} app 
     */
    constructor(app) {
        this.app = app;
        this.api = new API();

        this.init();
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
        this.lecturers = await this._fetchLecturers({ limit: 25 });

        if (!this.lecturers) {
            this.noResults.show();
            this.app.hideLoader('[data-loaderPage]');
            return;
        }

        this.loadLecturers(this.lecturers);

        
        this.searchInput.on('input', this._filterBySearch.bind(this));

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

    }

    renderLecturer(data) {
        
    }
}