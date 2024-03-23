class Page {
    constructor(app) {
       this.app = app;
       this.api = new API();
       
       this.activityName = $("[data-activityName]");
       this.description = $("[data-description]");
       this.activityType = $("[data-type]");
       this.minLength = $("[data-minLength]");
       this.maxLength = $("[data-maxLength]");
       this.age = $("[data-age]");
       this.tools = $("[data-tools]");

       this.prep = $("[data-prep]");
       this.instructions = $("[data-instr]");
       this.agenda = $("[data-agenda]");

       this.prepBtn = $("[data-addPrep]");
       this.instrBtn = $("[data-addInstr]");
       this.agendaBtn = $("[data-addAgenda]");

       this.init();
    }

    async init() {

        this.prepBtn.on("click", this.addPrep.bind(this));
        this.instrBtn.on("click", this.addInstr.bind(this));
        this.agendaBtn.on("click", this.addAgenda.bind(this));

        this.app.hideLoader();
    }

    addPrep() {
        const prepTitle = $("<input>").attr("type", "text").attr("placeholder", "Název přípravy").addClass("border-2 border-gray-300 p-2 rounded-md").appendTo(this.prep);
        const prepWarn = $("<input>").attr("type", "text").attr("placeholder", "Varování").addClass("border-2 border-gray-300 p-2 rounded-md").appendTo(this.prep);
        const prepNote = $("<input>").attr("type", "text").attr("placeholder", "Poznámka").addClass("border-2 border-gray-300 p-2 rounded-md").appendTo(this.prep);
    }


}