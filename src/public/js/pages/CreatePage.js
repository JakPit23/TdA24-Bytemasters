class Page {
    constructor(app) {
       this.app = app;
       this.api = new API();
       
       this.activityName = $("[data-activityName]");
       this.description = $("[data-description]");
       this.classStructure = $("[data-type]");
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
       this.createBtn = $("[data-createActivity]");

       this.init();
    }

    async init() {

        this.prepBtn.on("click", this.addPrep.bind(this));
        this.instrBtn.on("click", this.addInstr.bind(this));
        this.agendaBtn.on("click", this.agendaBtn.bind(this));
        this.createBtn.on("click", this.sendRequest.bind(this));

        this.app.hideLoader();
    }

    addPrep() {
        const prepTitle = $("<input>").attr("type", "text").attr("placeholder", "Název přípravy").addClass("border-2 border-gray-300 p-2 rounded-md").appendTo(this.prep);
        const prepWarn = $("<input>").attr("type", "text").attr("placeholder", "Varování").addClass("border-2 border-gray-300 p-2 rounded-md").appendTo(this.prep);
        const prepNote = $("<input>").attr("type", "text").attr("placeholder", "Poznámka").addClass("border-2 border-gray-300 p-2 rounded-md").appendTo(this.prep);
    }

    sendRequest(event) {
        event.preventDefault();

        // kamo gg mrdam to
        const data = {
            activityName: this.activityName.val(),
            description: this.description.val(),
            classStructure: this.classStructure.val(),
            minLength: this.minLength.val(),
            maxLength: this.maxLength.val(),
            age: this.age.val()
        }

        console.log(data);
        this.api.createActivity(data);
    }
}