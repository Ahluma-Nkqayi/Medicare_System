(function () {
  'use strict';

  let prescriptions = [];
  let filteredPrescriptions = [];
  let patients = [];
  let doctors = [];
  let currentEditingPrescription = null;

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function () {
    loadPrescriptions();
    loadPatientsAndDoctors();
    setupEventListeners();
  });

  function setupEventListeners() {
    // Search and filter
    document.getElementById('searchInput').addEventListener('input', filterPrescriptions);
    document.getElementById('statusFilter').addEventListener('change', filterPrescriptions);

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
    document.getElementById('addForm').addEventListener('submit', handleAddPrescription);
    document.getElementById('editForm').addEventListener('submit', handleEditPrescription);
  }

  async function loadPrescriptions() {
    try {
      const response = await fetch('/api/admin/prescriptions', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prescriptions');
      }

      prescriptions = await response.json();
      filteredPrescriptions = [...prescriptions];
      renderPrescriptionsTable();
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      alert('Failed to load prescriptions');
    }
  }

  async function loadPatientsAndDoctors() {
    try {
      // Load patients
      const patientsResponse = await fetch('/api/admin/users', {
        credentials: 'include'
      });

      if (!patientsResponse.ok) {
        throw new Error('Failed to fetch users');
      }

      const allUsers = await patientsResponse.json();
      patients = allUsers.filter(user => user.user_type === 'patient');
      doctors = allUsers.filter(user => user.user_type === 'doctor');

      populatePatientDropdowns();
      populateDoctorDropdowns();
    } catch (error) {
      console.error('Error loading patients and doctors:', error);
      alert('Failed to load patients and doctors');
    }
  }

  function populatePatientDropdowns() {
    const addPatientSelect = document.getElementById('addPatient');
    const editPatientSelect = document.getElementById('editPatient');

    patients.forEach(patient => {
      const fullName = patient.first_name && patient.last_name
        ? `${patient.first_name} ${patient.last_name}`
        : patient.username;

      const addOption = new Option(fullName, patient.id);
      const editOption = new Option(fullName, patient.id);

      addPatientSelect.add(addOption);
      editPatientSelect.add(editOption);
    });
  }

  function populateDoctorDropdowns() {
    const addDoctorSelect = document.getElementById('addDoctor');
    const editDoctorSelect = document.getElementById('editDoctor');

    doctors.forEach(doctor => {
      const fullName = doctor.first_name && doctor.last_name
        ? `${doctor.first_name} ${doctor.last_name}`
        : doctor.username;

      const addOption = new Option(fullName, doctor.id);
      const editOption = new Option(fullName, doctor.id);

      addDoctorSelect.add(addOption);
      editDoctorSelect.add(editOption);
    });
  }

  function renderPrescriptionsTable() {
    const tbody = document.getElementById('prescriptionsTableBody');
    tbody.innerHTML = '';

    if (filteredPrescriptions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="empty-table">
            <i class="fas fa-prescription"></i>
            <p>No prescriptions found</p>
          </td>
        </tr>
      `;
      return;
    }

    filteredPrescriptions.forEach(prescription => {
      const row = document.createElement('tr');

      const statusClass = `status-${prescription.status.toLowerCase()}`;
      const prescribedDate = prescription.prescription_date
        ? new Date(prescription.prescription_date).toLocaleDateString()
        : 'N/A';

      row.innerHTML = `
        <td>#${prescription.prescription_id}</td>
        <td>${prescription.patient_name || 'N/A'}</td>
        <td>${prescription.doctor_name || 'N/A'}</td>
        <td>${prescription.medication_name || 'N/A'}</td>
        <td>${prescription.dosage || 'N/A'}</td>
        <td>${prescription.frequency || 'N/A'}</td>
        <td>${prescription.duration || 'N/A'}</td>
        <td>${prescribedDate}</td>
        <td><span class="table-status ${statusClass}">${prescription.status}</span></td>
        <td>
          <div class="table-actions">
            <button class="table-edit-btn" onclick="openEditModal(${prescription.prescription_id})">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="table-delete-btn" onclick="deletePrescription(${prescription.prescription_id})">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  function filterPrescriptions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    filteredPrescriptions = prescriptions.filter(prescription => {
      const matchesSearch =
        (prescription.patient_name && prescription.patient_name.toLowerCase().includes(searchTerm)) ||
        (prescription.doctor_name && prescription.doctor_name.toLowerCase().includes(searchTerm)) ||
        (prescription.medication_name && prescription.medication_name.toLowerCase().includes(searchTerm));

      const matchesStatus = !statusFilter || prescription.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    renderPrescriptionsTable();
  }

  window.openAddModal = function () {
    document.getElementById('addForm').reset();
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('addPrescribedDate').value = today;
    document.getElementById('addModal').style.display = 'block';
  };

  async function handleAddPrescription(e) {
    e.preventDefault();

    const formData = {
      patient_id: document.getElementById('addPatient').value,
      doctor_id: document.getElementById('addDoctor').value,
      medication_name: document.getElementById('addMedication').value,
      dosage: document.getElementById('addDosage').value,
      frequency: document.getElementById('addFrequency').value,
      duration: document.getElementById('addDuration').value || null,
      prescribed_date: document.getElementById('addPrescribedDate').value,
      status: document.getElementById('addStatus').value,
      instructions: document.getElementById('addInstructions').value || null
    };

    if (!formData.patient_id || !formData.doctor_id) {
      alert('Please select both patient and doctor');
      return;
    }

    try {
      const response = await fetch('/api/admin/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add prescription');
      }

      alert('Prescription added successfully!');
      document.getElementById('addModal').style.display = 'none';
      loadPrescriptions();
    } catch (error) {
      console.error('Error adding prescription:', error);
      alert('Error: ' + error.message);
    }
  }

  window.openEditModal = async function (prescriptionId) {
    try {
      const prescription = prescriptions.find(p => p.prescription_id === prescriptionId);

      if (!prescription) {
        throw new Error('Prescription not found');
      }

      currentEditingPrescription = prescriptionId;

      // Populate form fields
      document.getElementById('editPrescriptionId').value = prescription.prescription_id;
      document.getElementById('editPatient').value = prescription.patient_id;
      document.getElementById('editDoctor').value = prescription.doctor_id;
      document.getElementById('editMedication').value = prescription.medication_name || '';
      document.getElementById('editDosage').value = prescription.dosage || '';
      document.getElementById('editFrequency').value = prescription.frequency || '';
      document.getElementById('editDuration').value = prescription.duration || '';

      const prescribedDate = prescription.prescription_date
        ? prescription.prescription_date.split('T')[0]
        : '';
      document.getElementById('editPrescribedDate').value = prescribedDate;

      document.getElementById('editStatus').value = prescription.status || 'Active';
      document.getElementById('editInstructions').value = prescription.instructions || '';

      document.getElementById('editModal').style.display = 'block';
    } catch (error) {
      console.error('Error loading prescription details:', error);
      alert('Failed to load prescription details');
    }
  };

  async function handleEditPrescription(e) {
    e.preventDefault();

    if (!currentEditingPrescription) return;

    const formData = {
      patient_id: document.getElementById('editPatient').value,
      doctor_id: document.getElementById('editDoctor').value,
      medication_name: document.getElementById('editMedication').value,
      dosage: document.getElementById('editDosage').value,
      frequency: document.getElementById('editFrequency').value,
      duration: document.getElementById('editDuration').value || null,
      prescribed_date: document.getElementById('editPrescribedDate').value,
      status: document.getElementById('editStatus').value,
      instructions: document.getElementById('editInstructions').value || null
    };

    if (!formData.patient_id || !formData.doctor_id) {
      alert('Please select both patient and doctor');
      return;
    }

    try {
      const response = await fetch(`/api/admin/prescriptions/${currentEditingPrescription}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update prescription');
      }

      alert('Prescription updated successfully!');
      document.getElementById('editModal').style.display = 'none';
      loadPrescriptions();
    } catch (error) {
      console.error('Error updating prescription:', error);
      alert('Error: ' + error.message);
    }
  }

  window.deletePrescription = async function (prescriptionId) {
    if (!confirm('Are you sure you want to delete this prescription? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete prescription');
      }

      alert('Prescription deleted successfully!');
      loadPrescriptions();
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Error: ' + error.message);
    }
  };

})();