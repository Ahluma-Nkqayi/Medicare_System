const form = document.querySelector("#registration-form"),
    nextBtn = form.querySelector(".nextBtn"),
    backBtn = form.querySelector(".backBtn"),
    allInput = form.querySelectorAll(".first input");

nextBtn.addEventListener("click", () => {
    let allFilled = true;

    allInput.forEach(input => {
        if (input.hasAttribute('required') && input.value === "") {
            allFilled = false;
        }
    });

    if (allFilled) {
        form.classList.add('secActive');
    } else {
        const errorDiv = document.getElementById('register-error');
        if (!errorDiv) {
            const newErrorDiv = document.createElement('div');
            newErrorDiv.id = 'register-error';
            newErrorDiv.className = 'message error-message';
            newErrorDiv.textContent = 'Please fill in all required fields';
            newErrorDiv.style.display = 'block';
            nextBtn.parentElement.insertBefore(newErrorDiv, nextBtn);

            setTimeout(() => {
                newErrorDiv.style.display = 'none';
            }, 3000);
        }
    }
});

backBtn.addEventListener("click", () => {
    form.classList.remove('secActive');
});

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const dob = document.getElementById('dob').value;
    const gender = document.getElementById('gender').value;
    const address = document.getElementById('address').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const emergencyName = document.getElementById('emergency-name').value;
    const emergencyPhone = document.getElementById('emergency-phone').value;
    const idNumber = document.getElementById('id-number').value;
    const bloodType = document.getElementById('blood-type').value;

    const submitBtn = form.querySelector('.submit-btn');
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');

    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match.';
        errorDiv.style.display = 'block';
        return;
    }

    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters long.';
        errorDiv.style.display = 'block';
        return;
    }

    submitBtn.disabled = true;
    submitBtn.querySelector('.btnText').textContent = 'Registering...';

    try {
        const registrationData = {
            full_name: fullName,
            email: email,
            password: password,
            role: 'patient'
        };

        if (phone) registrationData.phone_number = phone;
        if (dob) registrationData.date_of_birth = dob;
        if (gender) registrationData.gender = gender;
        if (address) registrationData.address = address;
        if (emergencyName) registrationData.emergency_contact_name = emergencyName;
        if (emergencyPhone) registrationData.emergency_contact_number = emergencyPhone;
        if (idNumber) registrationData.identification_number = idNumber;
        if (bloodType) registrationData.blood_type = bloodType;

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(registrationData),
        });

        const data = await response.json();

        if (response.ok) {
            successDiv.textContent = data.message || 'Registration successful! Redirecting to login...';
            successDiv.style.display = 'block';

            form.reset();
            form.classList.remove('secActive'); 

            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            errorDiv.textContent = data.error || 'Registration failed. Please try again.';
            errorDiv.style.display = 'block';
        }

    } catch (error) {
        console.error('Registration error:', error);
        errorDiv.textContent = 'Connection error. Please check your internet connection and try again.';
        errorDiv.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btnText').textContent = 'Register';
    }
});
