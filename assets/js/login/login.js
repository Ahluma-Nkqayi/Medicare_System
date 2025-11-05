document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab-option');
    const emailLabel = document.getElementById('login-email-label');
    const emailInput = document.getElementById('login-email');
    const helpText = document.getElementById('login-help-text');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));

            this.classList.add('active');

            const selectedRole = this.getAttribute('data-role');

            if (selectedRole === 'patient') {
                emailLabel.textContent = 'Email Address';
                emailInput.placeholder = 'Enter your email';
                emailInput.type = 'email';
                helpText.style.display = 'none';
            } else if (selectedRole === 'doctor') {
                emailLabel.textContent = 'Username';
                emailInput.placeholder = 'Enter your username';
                emailInput.type = 'text';
                helpText.style.display = 'block';
            } else if (selectedRole === 'admin') {
                emailLabel.textContent = 'Username';
                emailInput.placeholder = 'Enter your admin username';
                emailInput.type = 'text';
                helpText.style.display = 'none';
            }
        });
    });

    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const selectedRole = document.querySelector('.tab-option.active').getAttribute('data-role');
        const loginBtn = document.getElementById('login-btn');
        const errorDiv = document.getElementById('login-error');
        const successDiv = document.getElementById('login-success');

        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        loginBtn.disabled = true;
        loginBtn.querySelector('.btnText').textContent = 'Logging in...';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: email,
                    password: password,
                    role: selectedRole
                }),
            });

            const data = await response.json();

            if (response.ok) {
                successDiv.textContent = `Welcome back, ${data.user.first_name || data.user.username}! Login successful.`;
                successDiv.style.display = 'block';

                localStorage.setItem('currentUser', JSON.stringify(data.user));
                localStorage.setItem('currentUserRole', selectedRole);

                setTimeout(() => {
                    switch(selectedRole) {
                        case 'patient':
                            window.location.href = '/patient/dashboard';
                            break;
                        case 'doctor':
                            window.location.href = '/doctor/dashboard';
                            break;
                        case 'admin':
                            window.location.href = '/admin/bookings';
                            break;
                    }
                }, 1500);

            } else {
                errorDiv.textContent = data.error || 'Login failed. Please try again.';
                errorDiv.style.display = 'block';
            }

        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = 'Connection error. Please check your internet connection and try again.';
            errorDiv.style.display = 'block';
        } finally {
            loginBtn.disabled = false;
            loginBtn.querySelector('.btnText').textContent = 'Login';
        }
    });
});
