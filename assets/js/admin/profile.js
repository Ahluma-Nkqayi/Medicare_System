document.addEventListener('DOMContentLoaded', async function() {

    const profileForm = document.getElementById('profileForm');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editButtons = document.getElementById('editButtons');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const notificationToast = document.getElementById('notificationToast');
    const toastMessage = document.querySelector('.toast-message');
    const toastClose = document.querySelector('.toast-close');

    const username = document.getElementById('username');
    const adminId = document.getElementById('adminId');

    const securitySection = document.getElementById('securitySection');
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');

    let profileData = null;
    let isEditMode = false;

    async function loadProfile() {
        try {
            const response = await fetch('/api/admin/profile', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load profile');
            }

            profileData = await response.json();
            displayProfile(profileData);
        } catch (error) {
            console.error('Error loading profile:', error);
            showNotification('Failed to load profile data', 'error');
        }
    }

    function displayProfile(data) {
        const initials = data.username?.substring(0, 2).toUpperCase() || 'AD';
        document.getElementById('profileAvatar').textContent = initials;

        document.getElementById('profileFullName').textContent = data.username || 'Admin';
        document.getElementById('profileUsername').textContent = `@${data.username || 'admin'}`;

        username.value = data.username || '';
        adminId.value = data.admin_id || '';
    }

    function enableEditMode() {
        isEditMode = true;

        currentPassword.disabled = false;
        newPassword.disabled = false;
        confirmPassword.disabled = false;

        editProfileBtn.classList.add('hidden');
        editButtons.classList.remove('hidden');

        currentPassword.focus();
    }

    function disableEditMode() {
        isEditMode = false;

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
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
        disableEditMode();
    });

    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        try {
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

            const passwordResponse = await fetch('/api/admin/password', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: currentPassword.value,
                    new_password: newPassword.value
                })
            });

            if (!passwordResponse.ok) {
                const errorData = await passwordResponse.json();
                throw new Error(errorData.error || 'Failed to update password');
            }

            showNotification('Password updated successfully!', 'success');

            currentPassword.value = '';
            newPassword.value = '';
            confirmPassword.value = '';

            disableEditMode();
        } catch (error) {
            console.error('Error updating password:', error);
            showNotification('Failed to update password: ' + error.message, 'error');
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
