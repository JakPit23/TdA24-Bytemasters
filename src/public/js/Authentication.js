class Authentication {
    constructor() {
        // get control elements
        this.loginBtn = $('[data-loginBtn]');
        this.messagebox = $('[data-error]');
        this.loginBtn.on('click', (event) => this.login(event));
    }

    async login(event) {
        event.preventDefault();
        this.messagebox.empty();
        this.username = $('[data-username]').val();
        this.password = $('[data-password]').val();

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: this.username,
                password: this.password,
            }),
        });
        const body = await response.json();
        console.log(body)
        if(response.status !== 200) {
            var text = ""
            if(body.error == "INVALID_CREDENTIALS") {
                console.log("ERROR")
                text = $("<p></p>").text("Špatné uživatelské jméno nebo heslo").addClass('mx-auto p-4');
            } else if(body.error == "MISSING_REQUIRED_VALUES") {
                text = $("<p></p>").text("Nezadali jste veškeré údaje").addClass('mx-auto p-4');
            }
            this.messagebox.append(text);
            this.messagebox.addClass('mt-3');
        return;
        }
        window.location.href = "/dashboard";
    }
}

this.auth = new Authentication();