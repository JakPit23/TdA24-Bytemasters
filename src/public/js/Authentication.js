class Authentication {
    constructor() {
        // get control elements
        this.btn = $('[data-registerBtn]');
        this.loginBtn = $('[data-loginBtn]');
        this.loginBtn.on('click', (event) => this.login(event));
        this.btn.on('click', (event) => this.register(event));
        this.messagebox = $('data-errorbox');
    }

    async login(event) {
        event.preventDefault();
        this.username = $('[data-email]').val();
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
    }
}

this.auth = new Authentication();