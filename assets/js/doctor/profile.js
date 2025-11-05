document.addEventListener('DOMContentLoaded', async function() {

    const profileForm = document.getElementById('profileForm');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editButtons = document.getElementById('editButtons');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const notificationToast = document.getElementById('notificationToast');
    const toastMessage = document.querySelector('.toast-message');
    const toastClose = document.querySelector('.toast-close');

    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const username = document.getElementById('username');
    const dateOfBirth = document.getElementById('dateOfBirth');
    const gender = document.getElementById('gender');
    const idNumber = document.getElementById('idNumber');
    const specialization = document.getElementById('specialization');

    const securitySection = document.getElementById('securitySection');
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');

    let profileData = null;
    let isEditMode = false;

    async function loadProfile() {
        try {
            profileData = await DoctorAPI.getProfile();
            displayProfile(profileData);
        } catch (error) {
            console.error('Error loading profile:', error);
            showNotification('Failed to load profile data', 'error');
        }
    }

    function displayProfile(data) {
        const initials = `${data.first_name?.[0] || 'D'}${data.last_name?.[0] || 'R'}`;
        document.getElementById('profileAvatar').textContent = initials;

        const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Not provided';
        document.getElementById('profileFullName').textContent = fullName;
        document.getElementById('profileUsername').textContent = `@${data.username || 'username'}`;

        let formattedDate = '';
        if (data.date_of_birth) {
            const date = new Date(data.date_of_birth);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
        }

        firstName.value = data.first_name || '';
        lastName.value = data.last_name || '';
        username.value = data.username || '';
        dateOfBirth.value = formattedDate;
        gender.value = data.gender || '';
        idNumber.value = data.identification_number || '';
        specialization.value = data.specialization || '';

        const statusBadge = document.getElementById('statusBadge');
        statusBadge.textContent = data.status || 'Active';
        statusBadge.className = 'status-badge ' + (data.status === 'Active' ? 'status-active' : '');
    }

    function enableEditMode() {
        isEditMode = true;

        firstName.disabled = false;
        lastName.disabled = false;
        dateOfBirth.disabled = false;
        gender.disabled = false;
        specialization.disabled = false;

        securitySection.classList.remove('hidden');
        currentPassword.disabled = false;
        newPassword.disabled = false;
        confirmPassword.disabled = false;

        editProfileBtn.classList.add('hidden');
        editButtons.classList.remove('hidden');

        firstName.focus();
    }

    function disableEditMode() {
        isEditMode = false;

        firstName.disabled = true;
        lastName.disabled = true;
        dateOfBirth.disabled = true;
        gender.disabled = true;
        specialization.disabled = true;

        securitySection.classList.add('hidden');
        currentPassword.disabled = true;
        newPassword.disabled = true;
        confirmPassword.disabled = true;

        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';

        editProfileBtn.classList.remove('hidden');
        editButtons.classList.add('hidden');
    }

    editProfileBtn.addEventListener('click', function() {
        enableEditMode();
    });

    cancelEditBtn.addEventListener('click', function() {
        if (profileData) {
            displayProfile(profileData);
        }
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
        disableEditMode();
    });

    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        try {
            const hasPasswordFields = currentPassword.value || newPassword.value || confirmPassword.value;

            if (hasPasswordFields) {
                if (!currentPassword.value) {
                    showNotification('Please enter your current password', 'error');
                    currentPassword.focus();
                    return;
                }

                if (!newPassword.value) {
                    showNotification('Please enter a new password', 'error');
                    newPassword.focus();
                    return;
                }

                if (newPassword.value.length < 6) {
                    showNotification('New password must be at least 6 characters long', 'error');
                    newPassword.focus();
                    return;
                }

                if (newPassword.value !== confirmPassword.value) {
                    showNotification('New passwords do not match', 'error');
                    confirmPassword.focus();
                    return;
                }

                try {
                    await DoctorAPI.updatePassword({
                        current_password: currentPassword.value,
                        new_password: newPassword.value
                    });
                    showNotification('Password updated successfully!', 'success');

                    currentPassword.value = '';
                    newPassword.value = '';
                    confirmPassword.value = '';
                } catch (error) {
                    console.error('Error updating password:', error);
                    showNotification('Failed to update password: ' + error.message, 'error');
                    return; 
                }
            }

            const updatedData = {
                first_name: firstName.value,
                last_name: lastName.value,
                date_of_birth: dateOfBirth.value || null,
                gender: gender.value || null,
                specialization: specialization.value
            };

            await DoctorAPI.updateProfile(updatedData);

            if (hasPasswordFields) {
                showNotification('Profile and password updated successfully!', 'success');
            } else {
                showNotification('Profile updated successfully!', 'success');
            }

            disableEditMode();
            await loadProfile(); 
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('Failed to update profile: ' + error.message, 'error');
        }
    });

    function showNotification(message, type = 'info') {
        toastMessage.textContent = message;
        notificationToast.className = 'toast ' + (type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : '');
        notificationToast.classList.remove('hidden');

        setTimeout(() => {
            notificationToast.classList.add('hidden');
        }, 3000);
    }

    toastClose.addEventListener('click', function() {
        notificationToast.classList.add('hidden');
    });

    await loadProfile();
});
