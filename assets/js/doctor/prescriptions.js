let allPrescriptions = [];
let currentPatientId = null;
let editingPrescriptionId = null;

document.addEventListener('DOMContentLoaded', () => {
    initializePrescriptions();
    attachEventListeners();
});

function initializePrescriptions() {
    loadPatients();
    loadPrescriptions();
}

function attachEventListeners() {
    document.getElementById('createPrescriptionBtn')?.addEventListener('click', openCreatePrescriptionModal);

    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    document.getElementById('statusFilter')?.addEventListener('change', handleFilter);

    document.getElementById('prescriptionForm')?.addEventListener('submit', handlePrescriptionSubmit);

    document.querySelector('.toast-close')?.addEventListener('click', hideToast);
}

async function loadPatients() {
    try {
        const response = await fetch('/api/doctor/patients', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load patients');
        }

        const patients = await response.json();
        populatePatientDropdown(patients);
    } catch (error) {
        console.error('Error loading patients:', error);
        showToast('Failed to load patients', 'error');
    }
}

function populatePatientDropdown(patients) {
    const select = document.getElementById('patientId');
    if (!select) return;

    select.innerHTML = '<option value="">Select patient...</option>';

    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.patient_id;
        option.textContent = `${patient.first_name} ${patient.last_name} - ${patient.email}`;
        select.appendChild(option);
    });
}

async function loadPrescriptions() {
    try {
        const response = await fetch('/api/doctor/prescriptions', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load prescriptions');
        }

        allPrescriptions = await response.json();
        renderPrescriptions(allPrescriptions);
        updateStats(allPrescriptions);
    } catch (error) {
        console.error('Error loading prescriptions:', error);
        showLoadingError();
    }
}

function renderPrescriptions(prescriptions) {
    const tbody = document.getElementById('prescriptionsTableBody');
    const countBadge = document.getElementById('prescriptionCount');

    if (!tbody) return;

    if (countBadge) {
        countBadge.textContent = prescriptions.length;
    }

    tbody.innerHTML = '';

    if (prescriptions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-row">
                    <div class="empty-message">
                        <i class="fas fa-prescription"></i>
                        <p>No prescriptions found</p>
                        <small>Click "New Prescription" to create one</small>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    prescriptions.forEach(prescription => {
        const row = createPrescriptionRow(prescription);
        tbody.appendChild(row);
    });
}

function createPrescriptionRow(prescription) {
    const row = document.createElement('tr');
    row.dataset.id = prescription.prescription_id;

    const statusClass = getStatusClass(prescription.status);
    const formattedDate = formatDate(prescription.prescribed_date);

    let statusColor;
    switch(prescription.status) {
        case 'Active':
            statusColor = '#28a745';
            break;
        case 'Completed':
            statusColor = '#17a2b8';
            break;
        case 'Cancelled':
            statusColor = '#dc3545';
            break;
        default:
            statusColor = '#6c757d';
    }

    const showMenu = ['Active'].includes(prescription.status);

    row.innerHTML = `
        <td>${formattedDate}</td>
        <td><strong>${prescription.patient_name || 'N/A'}</strong></td>
        <td><strong>${prescription.medication_name}</strong></td>
        <td>${prescription.dosage || '-'}</td>
        <td>${prescription.frequency || '-'}</td>
        <td>${prescription.duration || '-'}</td>
        <td>
            <div class="status-badge ${statusClass}">
                <span class="status-indicator" style="background: ${statusColor}"></span>
                <span class="status-text">${prescription.status}</span>
            </div>
        </td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-primary view-btn" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                ${showMenu ? '<button class="btn btn-outline menu-btn"><i class="fas fa-ellipsis-v"></i></button>' : ''}
            </div>
        </td>
    `;

    const viewBtn = row.querySelector('.view-btn');
    viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        viewPrescription(prescription.prescription_id);
    });

    const menuBtn = row.querySelector('.menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPrescriptionMenu(prescription, menuBtn);
        });
    }

    return row;
}

function getStatusClass(status) {
    const statusMap = {
        'Active': 'status-active',
        'Completed': 'status-completed',
        'Cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-active';
}


function updateStats(prescriptions) {
    const stats = {
        total: prescriptions.length,
        active: 0,
        completed: 0,
        cancelled: 0
    };

    prescriptions.forEach(prescription => {
        const status = prescription.status;
        if (status === 'Active') stats.active++;
        else if (status === 'Completed') stats.completed++;
        else if (status === 'Cancelled') stats.cancelled++;
    });

    document.getElementById('totalCount').textContent = stats.total;
    document.getElementById('activeCount').textContent = stats.active;
    document.getElementById('completedCount').textContent = stats.completed;
    document.getElementById('cancelledCount').textContent = stats.cancelled;
}


function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    applyFilters(searchTerm, null);
}

function handleFilter(e) {
    const status = e.target.value;
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
    applyFilters(searchTerm, status);
}

function applyFilters(searchTerm, status) {
    let filtered = [...allPrescriptions];

    if (searchTerm) {
        filtered = filtered.filter(prescription => {
            return (
                (prescription.patient_name && prescription.patient_name.toLowerCase().includes(searchTerm)) ||
                (prescription.medication_name && prescription.medication_name.toLowerCase().includes(searchTerm)) ||
                (prescription.dosage && prescription.dosage.toLowerCase().includes(searchTerm)) ||
                (prescription.frequency && prescription.frequency.toLowerCase().includes(searchTerm))
            );
        });
    }

    if (status && status !== 'all') {
        filtered = filtered.filter(prescription => prescription.status === status);
    }

    renderPrescriptions(filtered);
}

function openCreatePrescriptionModal() {
    editingPrescriptionId = null;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-prescription"></i> New Prescription';
    document.getElementById('prescriptionForm')?.reset();
    document.getElementById('prescriptionId').value = '';

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('prescribedDate').value = today;

    showModal('prescriptionModal');
}

function closePrescriptionModal() {
    hideModal('prescriptionModal');
    document.getElementById('prescriptionForm')?.reset();
    editingPrescriptionId = null;
}

window.closePrescriptionModal = closePrescriptionModal;

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}


function showPrescriptionMenu(prescription, button) {
    const existingMenu = document.querySelector('.prescription-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const menu = document.createElement('div');
    menu.className = 'prescription-context-menu';

    const rect = button.getBoundingClientRect();
    menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
    menu.style.right = `${window.innerWidth - rect.right - window.scrollX}px`;

    const menuOptions = [
        { label: 'Edit', icon: 'fa-edit', action: 'edit' },
        { label: 'Mark as Completed', icon: 'fa-check', action: 'complete' },
        { label: 'Cancel', icon: 'fa-times-circle', action: 'cancel', danger: true },
        { label: 'Delete', icon: 'fa-trash', action: 'delete', danger: true }
    ];

    menuOptions.forEach(option => {
        const menuItem = document.createElement('div');
        menuItem.className = `menu-item ${option.danger ? 'danger' : ''}`;
        menuItem.innerHTML = `<i class="fas ${option.icon}"></i> ${option.label}`;

        menuItem.addEventListener('click', (e) => {
            e.stopPropagation();
            handlePrescriptionMenuAction(prescription, option.action);
            menu.remove();
        });

        menu.appendChild(menuItem);
    });

    document.body.appendChild(menu);

    const closeMenu = (e) => {
        if (!menu.contains(e.target) && e.target !== button) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };

    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 0);
}

function handlePrescriptionMenuAction(prescription, action) {
    switch(action) {
        case 'edit':
            editPrescription(prescription.prescription_id);
            break;
        case 'complete':
            updatePrescriptionStatus(prescription.prescription_id, 'Completed');
            break;
        case 'cancel':
            updatePrescriptionStatus(prescription.prescription_id, 'Cancelled');
            break;
        case 'delete':
            deletePrescription(prescription.prescription_id);
            break;
    }
}

async function updatePrescriptionStatus(prescriptionId, newStatus) {
    try {
        const response = await fetch(`/api/doctor/prescriptions/${prescriptionId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Failed to update prescription status');
        }

        showToast(`Prescription ${newStatus.toLowerCase()} successfully`, 'success');
        loadPrescriptions(); // Reload prescriptions
    } catch (error) {
        console.error('Error updating prescription status:', error);
        showToast('Failed to update prescription status', 'error');
    }
}


async function viewPrescription(prescriptionId) {
    try {
        const prescription = allPrescriptions.find(p => p.prescription_id === prescriptionId);

        if (!prescription) {
            showToast('Prescription not found', 'error');
            return;
        }

        displayPrescriptionDetails(prescription);
        showModal('viewPrescriptionModal');
    } catch (error) {
        console.error('Error viewing prescription:', error);
        showToast('Failed to load prescription details', 'error');
    }
}

window.viewPrescription = viewPrescription;

function displayPrescriptionDetails(prescription) {
    const detailsContainer = document.getElementById('prescriptionDetails');
    if (!detailsContainer) return;

    const statusClass = getStatusClass(prescription.status);

    detailsContainer.innerHTML = `
        <div class="prescription-details">
            <div class="detail-section">
                <h3><i class="fas fa-user"></i> Patient Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Patient Name:</label>
                        <span>${prescription.patient_name || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Email:</label>
                        <span>${prescription.patient_email || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-pills"></i> Medication Details</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Medication:</label>
                        <span><strong>${prescription.medication_name}</strong></span>
                    </div>
                    <div class="detail-item">
                        <label>Dosage:</label>
                        <span>${prescription.dosage || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Frequency:</label>
                        <span>${prescription.frequency || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Duration:</label>
                        <span>${prescription.duration || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Quantity:</label>
                        <span>${prescription.quantity || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Refills:</label>
                        <span>${prescription.refills || '0'}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-calendar"></i> Dates</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Prescribed Date:</label>
                        <span>${formatDate(prescription.prescribed_date)}</span>
                    </div>
                    ${prescription.start_date ? `
                        <div class="detail-item">
                            <label>Start Date:</label>
                            <span>${formatDate(prescription.start_date)}</span>
                        </div>
                    ` : ''}
                    ${prescription.end_date ? `
                        <div class="detail-item">
                            <label>End Date:</label>
                            <span>${formatDate(prescription.end_date)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>

            ${prescription.instructions ? `
                <div class="detail-section">
                    <h3><i class="fas fa-info-circle"></i> Instructions</h3>
                    <p class="detail-text">${prescription.instructions}</p>
                </div>
            ` : ''}

            ${prescription.notes ? `
                <div class="detail-section">
                    <h3><i class="fas fa-sticky-note"></i> Notes</h3>
                    <p class="detail-text">${prescription.notes}</p>
                </div>
            ` : ''}

            <div class="detail-section">
                <div class="detail-item">
                    <label>Status:</label>
                    <span class="status-badge ${statusClass}">${prescription.status}</span>
                </div>
            </div>
        </div>
    `;
}

function closeViewModal() {
    hideModal('viewPrescriptionModal');
}

window.closeViewModal = closeViewModal;


async function editPrescription(prescriptionId) {
    try {
        const prescription = allPrescriptions.find(p => p.prescription_id === prescriptionId);

        if (!prescription) {
            showToast('Prescription not found', 'error');
            return;
        }

        editingPrescriptionId = prescriptionId;
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Prescription';

        // Populate form
        document.getElementById('prescriptionId').value = prescription.prescription_id;
        document.getElementById('patientId').value = prescription.patient_id;
        document.getElementById('prescribedDate').value = prescription.prescribed_date || '';
        document.getElementById('medicationName').value = prescription.medication_name || '';
        document.getElementById('dosage').value = prescription.dosage || '';
        document.getElementById('frequency').value = prescription.frequency || '';
        document.getElementById('duration').value = prescription.duration || '';
        document.getElementById('quantity').value = prescription.quantity || '';
        document.getElementById('refills').value = prescription.refills || '0';
        document.getElementById('startDate').value = prescription.start_date || '';
        document.getElementById('endDate').value = prescription.end_date || '';
        document.getElementById('instructions').value = prescription.instructions || '';
        document.getElementById('notes').value = prescription.notes || '';
        document.getElementById('status').value = prescription.status || 'Active';

        showModal('prescriptionModal');
    } catch (error) {
        console.error('Error editing prescription:', error);
        showToast('Failed to load prescription for editing', 'error');
    }
}

window.editPrescription = editPrescription;


async function handlePrescriptionSubmit(e) {
    e.preventDefault();

    const formData = {
        patient_id: document.getElementById('patientId').value,
        prescribed_date: document.getElementById('prescribedDate').value,
        medication_name: document.getElementById('medicationName').value,
        dosage: document.getElementById('dosage').value,
        frequency: document.getElementById('frequency').value,
        duration: document.getElementById('duration').value || null,
        quantity: document.getElementById('quantity').value || null,
        refills: document.getElementById('refills').value || 0,
        start_date: document.getElementById('startDate').value || null,
        end_date: document.getElementById('endDate').value || null,
        instructions: document.getElementById('instructions').value || null,
        notes: document.getElementById('notes').value || null,
        status: document.getElementById('status').value
    };

    try {
        let response;

        if (editingPrescriptionId) {
            response = await fetch(`/api/doctor/prescriptions/${editingPrescriptionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
        } else {
            response = await fetch('/api/doctor/prescriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save prescription');
        }

        showToast(editingPrescriptionId ? 'Prescription updated successfully' : 'Prescription created successfully', 'success');
        closePrescriptionModal();
        loadPrescriptions(); 
    } catch (error) {
        console.error('Error saving prescription:', error);
        showToast(error.message || 'Failed to save prescription', 'error');
    }
}


async function deletePrescription(prescriptionId) {
    if (!confirm('Are you sure you want to delete this prescription? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/doctor/prescriptions/${prescriptionId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to delete prescription');
        }

        showToast('Prescription deleted successfully', 'success');
        loadPrescriptions(); // Reload prescriptions
    } catch (error) {
        console.error('Error deleting prescription:', error);
        showToast('Failed to delete prescription', 'error');
    }
}

window.deletePrescription = deletePrescription;


function printPrescription() {
    window.print();
}

window.printPrescription = printPrescription;


function formatDate(dateString) {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function showLoadingError() {
    const tbody = document.getElementById('prescriptionsTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="error-row">
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Failed to load prescriptions</p>
                        <button class="btn-secondary" onclick="loadPrescriptions()">Retry</button>
                    </div>
                </td>
            </tr>
        `;
    }
}


function showToast(message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    const messageEl = toast?.querySelector('.toast-message');

    if (!toast || !messageEl) return;

    messageEl.textContent = message;

    toast.classList.remove('toast-success', 'toast-error', 'toast-info');

    if (type === 'success') {
        toast.classList.add('toast-success');
    } else if (type === 'error') {
        toast.classList.add('toast-error');
    } else {
        toast.classList.add('toast-info');
    }

    toast.classList.remove('hidden');

    setTimeout(() => {
        hideToast();
    }, 5000);
}

function hideToast() {
    const toast = document.getElementById('notificationToast');
    if (toast) {
        toast.classList.add('hidden');
    }
}
