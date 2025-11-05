(function () {
  'use strict';

  let users = [];
  let filteredUsers = [];
  let currentEditingUser = null;

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function () {
    loadUsers();
    setupEventListeners();
  });

  function setupEventListeners() {
    // Search and filter
    document.getElementById('searchInput').addEventListener('input', filterUsers);
    document.getElementById('userTypeFilter').addEventListener('change', filterUsers);

    // Modal close buttons
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        const modal = this.closest('.modal');
        modal.style.display = 'none';
      });
    });

    // Cancel buttons
    const cancelButtons = document.querySelectorAll('.cancel-btn');
    cancelButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        const modal = this.closest('.modal');
        modal.style.display = 'none';
      });
    });

    // Click outside modal to close
    window.addEventListener('click', function (e) {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });

    // Form submissions
    document.getElementById('addForm').addEventListener('submit', handleAddUser);
    document.getElementById('editForm').addEventListener('submit', handleEditUser);

    // User type change in add modal
    document.getElementById('addUserType').addEventListener('change', function () {
      toggleAddFormFields(this.value);
    });
  }

  async function loadUsers() {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      users = await response.json();
      filteredUsers = [...users];
      renderUsersTable();
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users');
    }
  }

  function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    if (filteredUsers.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-table">
            <i class="fas fa-users"></i>
            <p>No users found</p>
          </td>
        </tr>
      `;
      return;
    }

    filteredUsers.forEach(user => {
      const row = document.createElement('tr');
      const userTypeClass = `user-type-${user.user_type}`;

      let details = '';
      if (user.user_type === 'patient') {
        details = user.email || 'N/A';
      } else if (user.user_type === 'doctor') {
        details = user.specialization || 'N/A';
      } else {
        details = 'System Administrator';
      }

      const fullName = user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : 'N/A';

      row.innerHTML = `
        <td>#${user.id}</td>
        <td>${user.username}</td>
        <td>${fullName}</td>
        <td><span class="table-user-type ${userTypeClass}">${user.user_type}</span></td>
        <td>${details}</td>
        <td>
          <div class="table-actions">
            <button class="table-edit-btn" onclick="openEditModal('${user.user_type}', ${user.id})">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="table-delete-btn" onclick="deleteUser('${user.user_type}', ${user.id})">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('userTypeFilter').value;

    filteredUsers = users.filter(user => {
      const matchesSearch =
        (user.username && user.username.toLowerCase().includes(searchTerm)) ||
        (user.first_name && user.first_name.toLowerCase().includes(searchTerm)) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchTerm)) ||
        (user.email && user.email.toLowerCase().includes(searchTerm));

      const matchesType = !typeFilter || user.user_type === typeFilter;

      return matchesSearch && matchesType;
    });

    renderUsersTable();
  }

  window.openAddModal = function () {
    document.getElementById('addForm').reset();
    document.getElementById('commonFields').style.display = 'none';
    document.getElementById('patientFields').style.display = 'none';
    document.getElementById('doctorFields').style.display = 'none';
    document.getElementById('addModal').style.display = 'block';
  };

  function toggleAddFormFields(userType) {
    const commonFields = document.getElementById('commonFields');
    const patientFields = document.getElementById('patientFields');
    const doctorFields = document.getElementById('doctorFields');

    if (userType === 'admin') {
      commonFields.style.display = 'none';
      patientFields.style.display = 'none';
      doctorFields.style.display = 'none';
    } else if (userType === 'patient') {
      commonFields.style.display = 'block';
      patientFields.style.display = 'block';
      doctorFields.style.display = 'none';
    } else if (userType === 'doctor') {
      commonFields.style.display = 'block';
      patientFields.style.display = 'none';
      doctorFields.style.display = 'block';
    }
  }

  async function handleAddUser(e) {
    e.preventDefault();

    const userType = document.getElementById('addUserType').value;

    if (!userType) {
      alert('Please select a user type');
      return;
    }

    const formData = {
      type: userType,
      username: document.getElementById('addUsername').value,
      password: document.getElementById('addPassword').value
    };

    if (userType !== 'admin') {
      formData.first_name = document.getElementById('addFirstName').value;
      formData.last_name = document.getElementById('addLastName').value;
      formData.date_of_birth = document.getElementById('addDOB').value;
      formData.gender = document.getElementById('addGender').value;
      formData.identification_number = document.getElementById('addIDNumber').value;
    }

    if (userType === 'patient') {
      formData.email = document.getElementById('addEmail').value;
      formData.phone_number = document.getElementById('addPhone').value;
      formData.address = document.getElementById('addAddress').value;
      formData.emergency_contact_name = document.getElementById('addEmergencyName').value;
      formData.emergency_contact_number = document.getElementById('addEmergencyPhone').value;
      formData.blood_type = document.getElementById('addBloodType').value;
    }

    if (userType === 'doctor') {
      formData.specialization = document.getElementById('addSpecialization').value;
      formData.status = document.getElementById('addStatus').value;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add user');
      }

      alert('User added successfully!');
      document.getElementById('addModal').style.display = 'none';
      loadUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error: ' + error.message);
    }
  }

  window.openEditModal = async function (userType, userId) {
    try {
      const response = await fetch(`/api/admin/users/${userType}/${userId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const user = await response.json();
      currentEditingUser = { type: userType, id: userId };

      // Set hidden fields
      document.getElementById('editUserId').value = userId;
      document.getElementById('editUserType').value = userType;
      document.getElementById('editUsername').value = user.username;

      // Show/hide field groups based on user type
      const editCommonFields = document.getElementById('editCommonFields');
      const editPatientFields = document.getElementById('editPatientFields');
      const editDoctorFields = document.getElementById('editDoctorFields');

      if (userType === 'admin') {
        editCommonFields.style.display = 'none';
        editPatientFields.style.display = 'none';
        editDoctorFields.style.display = 'none';
      } else if (userType === 'patient') {
        editCommonFields.style.display = 'block';
        editPatientFields.style.display = 'block';
        editDoctorFields.style.display = 'none';

        // Populate patient fields
        document.getElementById('editFirstName').value = user.first_name || '';
        document.getElementById('editLastName').value = user.last_name || '';
        document.getElementById('editDOB').value = user.date_of_birth ? user.date_of_birth.split('T')[0] : '';
        document.getElementById('editGender').value = user.gender || '';
        document.getElementById('editIDNumber').value = user.identification_number || '';
        document.getElementById('editEmail').value = user.email || '';
        document.getElementById('editPhone').value = user.phone_number || '';
        document.getElementById('editAddress').value = user.address || '';
        document.getElementById('editEmergencyName').value = user.emergency_contact_name || '';
        document.getElementById('editEmergencyPhone').value = user.emergency_contact_number || '';
        document.getElementById('editBloodType').value = user.blood_type || '';
      } else if (userType === 'doctor') {
        editCommonFields.style.display = 'block';
        editPatientFields.style.display = 'none';
        editDoctorFields.style.display = 'block';

        // Populate doctor fields
        document.getElementById('editFirstName').value = user.first_name || '';
        document.getElementById('editLastName').value = user.last_name || '';
        document.getElementById('editDOB').value = user.date_of_birth ? user.date_of_birth.split('T')[0] : '';
        document.getElementById('editGender').value = user.gender || '';
        document.getElementById('editIDNumber').value = user.identification_number || '';
        document.getElementById('editSpecialization').value = user.specialization || '';
        document.getElementById('editStatus').value = user.status || 'Active';
      }

      document.getElementById('editModal').style.display = 'block';
    } catch (error) {
      console.error('Error loading user details:', error);
      alert('Failed to load user details');
    }
  };

  async function handleEditUser(e) {
    e.preventDefault();

    if (!currentEditingUser) return;

    const userType = currentEditingUser.type;
    const userId = currentEditingUser.id;

    const formData = {};

    if (userType !== 'admin') {
      formData.first_name = document.getElementById('editFirstName').value;
      formData.last_name = document.getElementById('editLastName').value;
      formData.date_of_birth = document.getElementById('editDOB').value;
      formData.gender = document.getElementById('editGender').value;
      formData.identification_number = document.getElementById('editIDNumber').value;
    }

    if (userType === 'patient') {
      formData.email = document.getElementById('editEmail').value;
      formData.phone_number = document.getElementById('editPhone').value;
      formData.address = document.getElementById('editAddress').value;
      formData.emergency_contact_name = document.getElementById('editEmergencyName').value;
      formData.emergency_contact_number = document.getElementById('editEmergencyPhone').value;
      formData.blood_type = document.getElementById('editBloodType').value;
    }

    if (userType === 'doctor') {
      formData.specialization = document.getElementById('editSpecialization').value;
      formData.status = document.getElementById('editStatus').value;
    }

    try {
      const response = await fetch(`/api/admin/users/${userType}/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      alert('User updated successfully!');
      document.getElementById('editModal').style.display = 'none';
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error: ' + error.message);
    }
  }

  window.deleteUser = async function (userType, userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userType}/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      alert('User deleted successfully!');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error: ' + error.message);
    }
  };

})();
