class Authentication {
    constructor() {
        // get control elements
        this.btn = $('[data-registerBtn]');
        this.loginBtn = $('[data-loginBtn]');
        this.loginBtn.on('click', (event) => this.login(event));
        this.btn.on('click', (event) => this.register(event));
        this.messagebox = $('data-errorbox');
    }

    async register(event) {
        event.preventDefault();
        // get values from input fields
        this.email = $('[data-email]').val();
        this.username = $('[data-username]').val();
        this.password = $('[data-password]').val();
        // API Request
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: this.email,
                password: this.password,
                username: this.username,
            }),
        });
    }

    async login(event) {
        event.preventDefault();
        this.email = $('[data-email]').val();
        this.password = $('[data-password]').val();

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: this.email,
                password: this.password,
            }),
        });

        console.log(response);
        if(response.status === 200) {
            console.log('logged in');
            window.location.href = '/gdpr';
        }
    }
}

this.auth = new Authentication();