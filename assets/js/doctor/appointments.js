document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const viewSelect = document.getElementById('viewSelect');
    const filterSelect = document.getElementById('filterSelect');
    const searchInput = document.getElementById('searchInput');
    const appointmentsContainer = document.getElementById('appointmentsContainer');
    const appointmentCount = document.getElementById('appointmentCount');
    const appointmentDetails = document.getElementById('appointmentDetails');
    const appointmentModal = document.getElementById('appointmentModal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const closeModalBtn = document.getElementById('closeModal');
    const createAppointmentBtn = document.getElementById('createAppointmentBtn');
    const customDateRange = document.getElementById('customDateRange');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyDateRangeBtn = document.getElementById('applyDateRange');
    const notificationToast = document.getElementById('notificationToast');
    const toastMessage = document.querySelector('.toast-message');
    const toastClose = document.querySelector('.toast-close');

    // Stats elements
    const todayCount = document.getElementById('todayCount');
    const weekCount = document.getElementById('weekCount');
    const monthCount = document.getElementById('monthCount');
    const cancelledCount = document.getElementById('cancelledCount');

    // Fetch appointments from backend
    async function fetchAppointmentsFromBackend() {
        try {
            console.log('Fetching appointments from backend...');
            const appointments = await DoctorAPI.getAppointments();
            console.log('Received appointments:', appointments);

            // Transform backend data to match frontend format
            appointmentsData = appointments.map(apt => {
                // Map backend statuses to frontend statuses
                const statusMap = {
                    'Pending': 'pending',
                    'Confirmed': 'confirmed',
                    'In Progress': 'in_progress',
                    'Completed': 'completed',
                    'Cancelled': 'cancelled'
                };

                const mappedStatus = statusMap[apt.status] || apt.status.toLowerCase();

                // Parse date as local time, not UTC
                // Backend sends booking_date as ISO timestamp, we need just the date part
                // Extract date portion (YYYY-MM-DD) from ISO timestamp
                const bookingDate = apt.booking_date.split('T')[0];
                const dateStr = `${bookingDate}T${apt.booking_time}`;

                return {
                    id: apt.booking_id,
                    patientFirstName: apt.patient_name.split(' ')[0],
                    patientLastName: apt.patient_name.split(' ').slice(1).join(' ') || apt.patient_name.split(' ')[0],
                    patientEmail: apt.email,
                    patientPhone: apt.phone_number,
                    patientDOB: apt.date_of_birth || 'N/A',
                    date: dateStr,
                    booking_date: apt.booking_date, // Store original date for debugging
                    booking_time: apt.booking_time, // Store original time for debugging
                    reason: apt.reason_for_visit || 'No reason specified',
                    duration: 30, // Default duration
                    status: mappedStatus,
                    notes: apt.notes || ''
                };
            });

            console.log('Transformed appointments:', appointmentsData);
            console.log('Status breakdown:', appointmentsData.map(a => a.status));
            console.log('Sample date strings:', appointmentsData.slice(0, 5).map(a => ({
                booking_date: a.booking_date,
                booking_time: a.booking_time,
                combined: a.date,
                parsed: new Date(a.date),
                year: new Date(a.date).getFullYear(),
                month: new Date(a.date).getMonth(),
                day: new Date(a.date).getDate()
            })));
            loadAppointments();
            updateStats();
            checkUpcomingAppointments();
        } catch (error) {
            console.error('Error fetching appointments:', error);

            if (error.message === 'Unauthorized') {
                showNotification('Please log in to view appointments', 'error');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                showNotification('Failed to load appointments: ' + error.message, 'error');
            }
        }
    }

    // Initialize the page
    initDatePickers();
    fetchAppointmentsFromBackend();
    
    // Event Listeners
    const controlsContainer = document.querySelector('.controls');

    viewSelect.addEventListener('change', function() {
        if (viewSelect.value === 'custom') {
            customDateRange.classList.remove('hidden');
            controlsContainer.classList.add('custom-view-active');
        } else {
            customDateRange.classList.add('hidden');
            controlsContainer.classList.remove('custom-view-active');
            loadAppointments();
            updateStats();
        }
    });
    
    filterSelect.addEventListener('change', function() {
        loadAppointments();
    });
    
    searchInput.addEventListener('input', function() {
        loadAppointments();
    });

    // Create appointment modal elements
    const createAppointmentModal = document.getElementById('createAppointmentModal');
    const closeCreateModal = document.getElementById('closeCreateModal');
    const cancelCreateBtn = document.getElementById('cancelCreateBtn');
    const createAppointmentForm = document.getElementById('createAppointmentForm');
    const patientSelect = document.getElementById('patientSelect');
    const existingPatientBtn = document.getElementById('existingPatientBtn');
    const newPatientBtn = document.getElementById('newPatientBtn');
    const existingPatientSection = document.getElementById('existingPatientSection');
    const newPatientSection = document.getElementById('newPatientSection');

    let isNewPatient = false;

    createAppointmentBtn.addEventListener('click', async function() {
        // Load patients into dropdown
        await loadPatientsForDropdown();
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appointmentDate').value = today;
        // Reset to existing patient view
        isNewPatient = false;
        existingPatientBtn.classList.add('active');
        newPatientBtn.classList.remove('active');
        existingPatientSection.classList.remove('hidden');
        newPatientSection.classList.add('hidden');
        // Show modal
        createAppointmentModal.classList.remove('hidden');
    });

    // Toggle between existing and new patient
    existingPatientBtn.addEventListener('click', function() {
        isNewPatient = false;
        existingPatientBtn.classList.add('active');
        newPatientBtn.classList.remove('active');
        existingPatientSection.classList.remove('hidden');
        newPatientSection.classList.add('hidden');
    });

    newPatientBtn.addEventListener('click', function() {
        isNewPatient = true;
        newPatientBtn.classList.add('active');
        existingPatientBtn.classList.remove('active');
        newPatientSection.classList.remove('hidden');
        existingPatientSection.classList.add('hidden');
    });

    closeCreateModal.addEventListener('click', function() {
        createAppointmentModal.classList.add('hidden');
        createAppointmentForm.reset();
    });

    cancelCreateBtn.addEventListener('click', function() {
        createAppointmentModal.classList.add('hidden');
        createAppointmentForm.reset();
    });

    // Close modal when clicking overlay
    createAppointmentModal.querySelector('.modal-overlay').addEventListener('click', function() {
        createAppointmentModal.classList.add('hidden');
        createAppointmentForm.reset();
    });

    // Handle form submission
    createAppointmentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await createNewAppointment();
    });

    // Load patients for dropdown
    async function loadPatientsForDropdown() {
        try {
            const patients = await DoctorAPI.getPatients();
            patientSelect.innerHTML = '<option value="">Select a patient</option>';
            patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.patient_id;
                option.textContent = `${patient.first_name} ${patient.last_name} - ${patient.email}`;
                patientSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading patients:', error);
            showNotification('Failed to load patients', 'error');
        }
    }

    // Create new appointment
    async function createNewAppointment() {
        try {
            showNotification('Creating appointment...', 'info');

            let patientId;

            // If new patient, register them first
            if (isNewPatient) {
                const newPatientData = {
                    first_name: document.getElementById('newPatientFirstName').value,
                    last_name: document.getElementById('newPatientLastName').value,
                    email: document.getElementById('newPatientEmail').value,
                    phone_number: document.getElementById('newPatientPhone').value,
                    date_of_birth: document.getElementById('newPatientDOB').value || null,
                    gender: document.getElementById('newPatientGender').value || null,
                    address: document.getElementById('newPatientAddress').value || null,
                    emergency_contact_name: document.getElementById('newPatientEmergencyName').value || null,
                    emergency_contact_number: document.getElementById('newPatientEmergencyPhone').value || null
                };

                // Register new patient (you'll need to create this API endpoint)
                const patientResponse = await apiRequest('/api/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({
                        full_name: `${newPatientData.first_name} ${newPatientData.last_name}`,
                        email: newPatientData.email,
                        password: 'TempPass123!', // Generate or send email for password setup
                        phone_number: newPatientData.phone_number,
                        date_of_birth: newPatientData.date_of_birth,
                        gender: newPatientData.gender,
                        address: newPatientData.address,
                        emergency_contact_name: newPatientData.emergency_contact_name,
                        emergency_contact_number: newPatientData.emergency_contact_number
                    })
                });

                patientId = patientResponse.patient_id;
                showNotification('New patient registered successfully!', 'success');
            } else {
                patientId = parseInt(patientSelect.value);
            }

            // Create appointment
            const appointmentData = {
                patient_id: patientId,
                booking_date: document.getElementById('appointmentDate').value,
                booking_time: document.getElementById('appointmentTime').value + ':00',
                duration: parseInt(document.getElementById('appointmentDuration').value),
                status: document.getElementById('appointmentStatus').value,
                payment_method: document.getElementById('paymentMethod').value,
                reason_for_visit: document.getElementById('reasonForVisit').value
            };

            // Calculate end time based on duration
            const startTime = new Date(`2000-01-01T${appointmentData.booking_time}`);
            startTime.setMinutes(startTime.getMinutes() + appointmentData.duration);
            appointmentData.end_time = startTime.toTimeString().slice(0, 8);

            // Create appointment (you'll need to create this API endpoint in the backend)
            const response = await apiRequest('/api/doctor/appointments', {
                method: 'POST',
                body: JSON.stringify(appointmentData)
            });

            createAppointmentModal.classList.add('hidden');
            createAppointmentForm.reset();
            showNotification('Appointment created successfully!', 'success');

            // Refresh appointments list
            await fetchAppointmentsFromBackend();
        } catch (error) {
            console.error('Error creating appointment:', error);
            showNotification('Failed to create appointment: ' + error.message, 'error');
        }
    }

    applyDateRangeBtn.addEventListener('click', function() {
        if (startDateInput.value && endDateInput.value) {
            loadAppointments();
            updateStats();
        } else {
            showNotification('Please select both start and end dates', 'error');
        }
    });

    toastClose.addEventListener('click', function() {
        notificationToast.classList.add('hidden');
    });

    // Modal close event listeners
    closeModalBtn.addEventListener('click', function() {
        appointmentModal.classList.add('hidden');
    });

    modalOverlay.addEventListener('click', function() {
        appointmentModal.classList.add('hidden');
    });

    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !appointmentModal.classList.contains('hidden')) {
            appointmentModal.classList.add('hidden');
        }
    });

    // Initialize date pickers
    function initDatePickers() {
        flatpickr(startDateInput, {
            dateFormat: "Y-m-d",
            allowInput: true
        });
        
        flatpickr(endDateInput, {
            dateFormat: "Y-m-d",
            allowInput: true
        });
    }
    
    // Load appointments based on selected view, filter and search
    function loadAppointments() {
        const view = viewSelect.value;
        const filter = filterSelect.value;
        const searchTerm = searchInput.value.toLowerCase();
        
        // Clear existing appointments
        appointmentsContainer.innerHTML = '';
        
        // Get filtered appointments
        const filteredAppointments = filterAppointments(view, filter, searchTerm);
        
        // Update appointment count
        appointmentCount.textContent = filteredAppointments.length;
        
        // Display appointments
        if (filteredAppointments.length === 0) {
            appointmentsContainer.innerHTML = `
                <div class="no-appointments">
                    <i class="fas fa-calendar-times"></i>
                    <p>No appointments found</p>
                </div>
            `;
        } else {
            filteredAppointments.forEach(appointment => {
                const appointmentElement = createAppointmentElement(appointment);
                appointmentsContainer.appendChild(appointmentElement);
            });
        }
    }
    
    // Filter appointments based on view, status and search term
    function filterAppointments(view, statusFilter, searchTerm) {
        const now = new Date();
        let filtered = [...appointmentsData];

        console.log('Filtering - Total appointments:', filtered.length);
        console.log('View:', view, 'Status Filter:', statusFilter, 'Search:', searchTerm);

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(apt =>
                apt.patientFirstName.toLowerCase().includes(searchTerm) ||
                apt.patientLastName.toLowerCase().includes(searchTerm) ||
                apt.reason.toLowerCase().includes(searchTerm)
            );
            console.log('After search filter:', filtered.length);
        }

        // Apply view filter
        if (view === 'today') {
            filtered = filtered.filter(apt => {
                const aptDate = new Date(apt.date);
                console.log('Today check - aptDate:', aptDate, 'now:', now, 'isSame:', isSameDay(aptDate, now));
                return isSameDay(aptDate, now);
            });
            console.log('After today filter:', filtered.length);
        } else if (view === 'week') {
            const firstFiltered = filtered[0];
            if (firstFiltered) {
                const testDate = new Date(firstFiltered.date);
                console.log('Week filter - Sample date string:', firstFiltered.date);
                console.log('Parsed date:', testDate);
                console.log('Today:', now);

                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);

                console.log('Week range:', startOfWeek, 'to', endOfWeek);
                console.log('Test date in range?', testDate >= startOfWeek && testDate <= endOfWeek);
            }
            filtered = filtered.filter(apt => {
                const aptDate = new Date(apt.date);
                return isSameWeek(aptDate, now);
            });
            console.log('After week filter:', filtered.length);
        } else if (view === 'month') {
            const firstFiltered = filtered[0];
            if (firstFiltered) {
                const testDate = new Date(firstFiltered.date);
                console.log('Sample date string:', firstFiltered.date);
                console.log('Parsed date:', testDate);
                console.log('Date parts - Year:', testDate.getFullYear(), 'Month:', testDate.getMonth(), 'Day:', testDate.getDate());
                console.log('Now parts - Year:', now.getFullYear(), 'Month:', now.getMonth(), 'Day:', now.getDate());
            }
            filtered = filtered.filter(apt => {
                const aptDate = new Date(apt.date);
                return isSameMonth(aptDate, now);
            });
            console.log('After month filter:', filtered.length);
        } else if (view === 'custom' && startDateInput.value && endDateInput.value) {
            const startDate = new Date(startDateInput.value);
            const endDate = new Date(endDateInput.value);
            endDate.setHours(23, 59, 59, 999); // End of the day

            filtered = filtered.filter(apt => {
                const aptDate = new Date(apt.date);
                return aptDate >= startDate && aptDate <= endDate;
            });
            console.log('After custom date filter:', filtered.length);
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(apt => apt.status === statusFilter);
            console.log('After status filter:', filtered.length);
        }

        // Sort by date (soonest first)
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log('Final filtered appointments:', filtered.length);
        return filtered;
    }
    
    // Create appointment element
    function createAppointmentElement(appointment) {
        const element = document.createElement('div');
        element.className = 'appointment-item';
        element.dataset.id = appointment.id;
        
        const date = new Date(appointment.date);
        const formattedDate = formatAppointmentDate(date);
        const formattedTime = formatTime(date);
        const initials = `${appointment.patientFirstName[0]}${appointment.patientLastName[0]}`;
        
        let statusColor;
        let statusText;
        switch(appointment.status) {
            case 'confirmed':
                statusColor = '#28a745';
                statusText = 'Confirmed';
                break;
            case 'completed':
                statusColor = '#17a2b8';
                statusText = 'Completed';
                break;
            case 'cancelled':
                statusColor = '#dc3545';
                statusText = 'Cancelled';
                break;
            case 'pending':
                statusColor = '#ffc107';
                statusText = 'Pending';
                break;
            case 'in_progress':
                statusColor = '#6f42c1';
                statusText = 'In Progress';
                break;
            default:
                statusColor = '#6c757d';
                statusText = 'Unknown';
        }

        // Determine if menu button should be shown
        const showMenu = ['pending', 'confirmed'].includes(appointment.status);

        element.innerHTML = `
            <div class="patient-info">
                <div class="patient-avatar">${initials}</div>
                <div>
                    <strong>${appointment.patientFirstName} ${appointment.patientLastName}</strong>
                    <div class="appointment-time">${formattedDate} at ${formattedTime}</div>
                </div>
            </div>
            <div class="appointment-actions">
                <div class="status-badge">
                    <span class="status-indicator" style="background: ${statusColor}"></span>
                    <span class="status-text">${statusText}</span>
                </div>
                <button class="btn btn-primary view-btn"><i class="fas fa-eye"></i></button>
                ${showMenu ? '<button class="btn btn-outline menu-btn"><i class="fas fa-ellipsis-v"></i></button>' : ''}
            </div>
        `;
        
        // Add click event
        element.addEventListener('click', function(e) {
            if (!e.target.closest('.appointment-actions')) {
                showAppointmentDetails(appointment);
            }
        });
        
        // Add view button event
        element.querySelector('.view-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            showAppointmentDetails(appointment);
        });

        // Add menu button event only if button exists
        const menuBtn = element.querySelector('.menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                showAppointmentMenu(appointment, this);
            });
        }

        return element;
    }
    
    // Show appointment menu
    function showAppointmentMenu(appointment, button) {
        // Remove any existing menus
        const existingMenu = document.querySelector('.appointment-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        const menu = document.createElement('div');
        menu.className = 'appointment-context-menu';
        menu.style.position = 'absolute';
        menu.style.backgroundColor = 'white';
        menu.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        menu.style.borderRadius = '8px';
        menu.style.zIndex = '1000';
        menu.style.padding = '8px 0';
        menu.style.minWidth = '150px';

        const rect = button.getBoundingClientRect();
        menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
        // Position menu to the right edge of the button (align right)
        menu.style.right = `${window.innerWidth - rect.right - window.scrollX}px`;
        
        const statusActions = {
            'pending': ['Confirm', 'Cancel'],
            'confirmed': ['Complete', 'Cancel'],
            'completed': [], // No options for completed
            'cancelled': [], // No options for cancelled
            'in_progress': [] // No options for in progress
        };

        const actions = statusActions[appointment.status] || [];
        
        actions.forEach(action => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.style.padding = '10px 20px';
            menuItem.style.cursor = 'pointer';
            menuItem.style.transition = 'all 0.2s ease';
            menuItem.style.fontSize = '14px';
            menuItem.style.fontFamily = 'Poppins, sans-serif';
            menuItem.style.color = '#333';
            menuItem.style.whiteSpace = 'nowrap';

            menuItem.textContent = action;

            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.backgroundColor = '#f8f9fa';
                menuItem.style.paddingLeft = '24px';
            });

            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.backgroundColor = 'transparent';
                menuItem.style.paddingLeft = '20px';
            });

            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                handleAppointmentAction(appointment, action);
                menu.remove();
            });

            menu.appendChild(menuItem);
        });
        
        document.body.appendChild(menu);
        
        // Close menu when clicking elsewhere
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
    
    // Handle appointment action
    function handleAppointmentAction(appointment, action) {
        switch(action) {
            case 'Confirm':
                updateAppointmentStatus(appointment.id, 'confirmed');
                break;
            case 'Complete':
                updateAppointmentStatus(appointment.id, 'completed');
                break;
            case 'Cancel':
                updateAppointmentStatus(appointment.id, 'cancelled');
                break;
            case 'Reschedule':
                showRescheduleDialog(appointment);
                break;
            case 'Reopen':
                updateAppointmentStatus(appointment.id, 'confirmed');
                break;
            case 'Add Notes':
                showNotesDialog(appointment);
                break;
            case 'Delete':
                if (confirm('Are you sure you want to delete this appointment?')) {
                    deleteAppointment(appointment.id);
                }
                break;
        }
    }
    
    // Show reschedule dialog
    function showRescheduleDialog(appointment) {
        // In a real application, this would show a modal with a date picker
        const newDate = prompt('Enter new date and time (YYYY-MM-DDTHH:MM):', appointment.date.slice(0, 16));
        if (newDate) {
            rescheduleAppointment(appointment.id, newDate);
        }
    }
    
    // Show notes dialog
    function showNotesDialog(appointment) {
        const notes = prompt('Add notes:', appointment.notes);
        if (notes !== null) {
            updateAppointmentNotes(appointment.id, notes);
        }
    }
    
    // Reschedule appointment
    function rescheduleAppointment(id, newDate) {
        const appointment = appointmentsData.find(apt => apt.id === id);
        if (appointment) {
            appointment.date = newDate;
            appointment.status = 'scheduled';
            loadAppointments();
            updateStats();
            showNotification('Appointment rescheduled successfully', 'success');
        }
    }
    
    // Update appointment notes
    function updateAppointmentNotes(id, notes) {
        const appointment = appointmentsData.find(apt => apt.id === id);
        if (appointment) {
            appointment.notes = notes;
            showNotification('Notes updated successfully', 'success');
            
            // If this appointment is currently selected, refresh the details view
            const selectedAppointment = document.querySelector('.appointment-item.selected');
            if (selectedAppointment && parseInt(selectedAppointment.dataset.id) === id) {
                showAppointmentDetails(appointment);
            }
        }
    }
    
    // Delete appointment
    function deleteAppointment(id) {
        const index = appointmentsData.findIndex(apt => apt.id === id);
        if (index !== -1) {
            appointmentsData.splice(index, 1);
            loadAppointments();
            updateStats();

            // Clear details if the deleted appointment was selected
            const selectedAppointment = document.querySelector('.appointment-item.selected');
            if (selectedAppointment && parseInt(selectedAppointment.dataset.id) === id) {
                appointmentDetails.innerHTML = `
                    <div class="no-selection">
                        <i class="fas fa-calendar-alt"></i>
                        <p>Select an appointment to view details</p>
                    </div>
                `;
            }
            
            showNotification('Appointment deleted successfully', 'success');
        }
    }
    
    // Update appointment status
    async function updateAppointmentStatus(id, newStatus) {
        try {
            // Map frontend status to backend status
            const statusMap = {
                'pending': 'Pending',
                'scheduled': 'Pending',
                'confirmed': 'Confirmed',
                'completed': 'Completed',
                'cancelled': 'Cancelled'
            };

            const backendStatus = statusMap[newStatus] || 'Pending';

            await DoctorAPI.updateAppointmentStatus(id, backendStatus);

            // Update local data
            const appointment = appointmentsData.find(apt => apt.id === id);
            if (appointment) {
                appointment.status = newStatus;
                loadAppointments();
                updateStats();
                showNotification(`Appointment ${newStatus} successfully`, 'success');

                // If this appointment is currently selected, refresh the details view
                const selectedAppointment = document.querySelector('.appointment-item.selected');
                if (selectedAppointment && parseInt(selectedAppointment.dataset.id) === id) {
                    showAppointmentDetails(appointment);
                }
            }
        } catch (error) {
            console.error('Error updating appointment status:', error);
            showNotification('Failed to update appointment status', 'error');
        }
    }
    
    // Show appointment details
    async function showAppointmentDetails(appointment) {
        // Open the modal
        appointmentModal.classList.remove('hidden');

        // Remove selected class from all appointments
        document.querySelectorAll('.appointment-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Add selected class to the clicked appointment
        const selectedAppointment = document.querySelector(`.appointment-item[data-id="${appointment.id}"]`);
        if (selectedAppointment) {
            selectedAppointment.classList.add('selected');
        }

        // Try to fetch full details from backend
        try {
            const fullDetails = await DoctorAPI.getAppointmentById(appointment.id);

            // Update appointment object with full details if available
            if (fullDetails) {
                appointment.patientDOB = fullDetails.date_of_birth || appointment.patientDOB;
                appointment.notes = fullDetails.notes || appointment.notes;
            }
        } catch (error) {
            console.error('Could not fetch full appointment details:', error);
            // Continue with existing data
        }

        const date = new Date(appointment.date);
        const formattedDate = formatAppointmentDate(date);
        const formattedTime = formatTime(date);
        
        let statusClass;
        switch(appointment.status) {
            case 'confirmed': statusClass = 'status-confirmed'; break;
            case 'completed': statusClass = 'status-completed'; break;
            case 'cancelled': statusClass = 'status-cancelled'; break;
            default: statusClass = 'status-scheduled';
        }
        
        appointmentDetails.innerHTML = `
            <div class="detail-header">
                <div class="patient-avatar-large">${appointment.patientFirstName[0]}${appointment.patientLastName[0]}</div>
                <div>
                    <h2>${appointment.patientFirstName} ${appointment.patientLastName}</h2>
                    <div class="appointment-status ${statusClass}">${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Appointment Details</h4>
                <div class="detail-item">
                    <span>Date & Time</span>
                    <span>${formattedDate} at ${formattedTime}</span>
                </div>
                <div class="detail-item">
                    <span>Reason</span>
                    <span>${appointment.reason}</span>
                </div>
                <div class="detail-item">
                    <span>Duration</span>
                    <span>${appointment.duration} minutes</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Patient Information</h4>
                <div class="detail-item">
                    <span>Email</span>
                    <span>${appointment.patientEmail}</span>
                </div>
                <div class="detail-item">
                    <span>Phone</span>
                    <span>${appointment.patientPhone}</span>
                </div>
                <div class="detail-item">
                    <span>Date of Birth</span>
                    <span>${appointment.patientDOB}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Notes</h4>
                <p>${appointment.notes || 'No notes available.'}</p>
            </div>
            
            <div class="detail-actions">
                ${appointment.status === 'scheduled' ? 
                    `<button class="btn btn-success confirm-btn">Confirm</button>
                     <button class="btn btn-danger cancel-btn">Cancel</button>` : ''}
                ${appointment.status === 'confirmed' ? 
                    `<button class="btn btn-success complete-btn">Mark as Complete</button>
                     <button class="btn btn-danger cancel-btn">Cancel</button>` : ''}
                ${appointment.status === 'completed' ? 
                    `<button class="btn btn-warning reopen-btn">Reopen</button>` : ''}
                ${appointment.status === 'cancelled' ? 
                    `<button class="btn btn-warning reschedule-btn">Reschedule</button>` : ''}
                <button class="btn btn-outline notes-btn">Add Notes</button>
            </div>
        `;
        
        // Add event listeners to action buttons
        if (appointment.status === 'scheduled') {
            appointmentDetails.querySelector('.confirm-btn').addEventListener('click', () => {
                updateAppointmentStatus(appointment.id, 'confirmed');
                appointmentModal.classList.add('hidden');
            });

            appointmentDetails.querySelector('.cancel-btn').addEventListener('click', () => {
                updateAppointmentStatus(appointment.id, 'cancelled');
                appointmentModal.classList.add('hidden');
            });
        }

        if (appointment.status === 'confirmed') {
            appointmentDetails.querySelector('.complete-btn').addEventListener('click', () => {
                updateAppointmentStatus(appointment.id, 'completed');
                appointmentModal.classList.add('hidden');
            });

            appointmentDetails.querySelector('.cancel-btn').addEventListener('click', () => {
                updateAppointmentStatus(appointment.id, 'cancelled');
                appointmentModal.classList.add('hidden');
            });
        }

        if (appointment.status === 'completed') {
            appointmentDetails.querySelector('.reopen-btn').addEventListener('click', () => {
                updateAppointmentStatus(appointment.id, 'confirmed');
                appointmentModal.classList.add('hidden');
            });
        }

        if (appointment.status === 'cancelled') {
            appointmentDetails.querySelector('.reschedule-btn').addEventListener('click', () => {
                showRescheduleDialog(appointment);
            });
        }

        appointmentDetails.querySelector('.notes-btn').addEventListener('click', () => {
            showNotesDialog(appointment);
        });
    }
    
    // Update statistics
    function updateStats() {
        const now = new Date();

        // Today's appointments
        const todayApps = appointmentsData.filter(apt => {
            const aptDate = new Date(apt.date);
            return isSameDay(aptDate, now);
        });
        todayCount.textContent = todayApps.length;

        // This week's appointments
        const weekApps = appointmentsData.filter(apt => {
            const aptDate = new Date(apt.date);
            return isSameWeek(aptDate, now);
        });
        weekCount.textContent = weekApps.length;

        // This month's appointments
        const monthApps = appointmentsData.filter(apt => {
            const aptDate = new Date(apt.date);
            return isSameMonth(aptDate, now);
        });
        monthCount.textContent = monthApps.length;

        // Cancelled appointments (this month)
        const cancelledApps = appointmentsData.filter(apt => {
            const aptDate = new Date(apt.date);
            return apt.status === 'cancelled' && isSameMonth(aptDate, now);
        });
        cancelledCount.textContent = cancelledApps.length;
    }

    // Render calendar
    function renderCalendar() {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        
        // Update current month display
        currentMonthElement.textContent = `${currentCalendarDate.toLocaleString('default', { month: 'long' })} ${year}`;
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Get days in previous month
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Clear calendar
        calendarElement.innerHTML = '';
        
        // Add day headers
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day header';
            dayElement.textContent = day;
            calendarElement.appendChild(dayElement);
        });
        
        // Add days from previous month
        for (let i = daysInPrevMonth - firstDay + 1; i <= daysInPrevMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = i;
            calendarElement.appendChild(dayElement);
        }
        
        // Add days from current month
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = i;
            dayElement.dataset.date = `${year}-${month + 1}-${i}`;
            
            // Check if today
            if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            // Check if has appointments
            const hasAppointments = appointmentsData.some(apt => {
                const aptDate = new Date(apt.date);
                return aptDate.getFullYear() === year && 
                       aptDate.getMonth() === month && 
                       aptDate.getDate() === i;
            });
            
            if (hasAppointments) {
                dayElement.classList.add('has-appointments');
                
                // Count appointments for this day
                const appointmentCount = appointmentsData.filter(apt => {
                    const aptDate = new Date(apt.date);
                    return aptDate.getFullYear() === year && 
                           aptDate.getMonth() === month && 
                           aptDate.getDate() === i;
                }).length;
                
                if (appointmentCount > 1) {
                    const badge = document.createElement('span');
                    badge.className = 'appointment-count-badge';
                    badge.textContent = appointmentCount;
                    dayElement.appendChild(badge);
                }
            }
            
            // Add click event
            dayElement.addEventListener('click', function() {
                // Remove selected class from all days
                document.querySelectorAll('.calendar-day').forEach(day => {
                    day.classList.remove('selected');
                });
                
                // Add selected class to clicked day
                this.classList.add('selected');
                
                // Show appointments for this day
                const selectedDate = new Date(year, month, i);
                viewSelect.value = 'custom';
                customDateRange.classList.remove('hidden');
                startDateInput.value = formatDateForInput(selectedDate);
                endDateInput.value = formatDateForInput(selectedDate);
                loadAppointments();
            });
            
            calendarElement.appendChild(dayElement);
        }
        
        // Calculate how many days from next month to show
        const totalCells = 42; // 6 rows x 7 columns
        const daysSoFar = firstDay + daysInMonth;
        const nextMonthDays = totalCells - daysSoFar;
        
        // Add days from next month
        for (let i = 1; i <= nextMonthDays; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = i;
            calendarElement.appendChild(dayElement);
        }
    }
    
    // Check for upcoming appointments and show notifications
    function checkUpcomingAppointments() {
        const now = new Date();
        const in30Minutes = new Date(now.getTime() + 30 * 60000);
        
        const upcomingAppointments = appointmentsData.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate > now && aptDate <= in30Minutes && apt.status === 'confirmed';
        });
        
        if (upcomingAppointments.length > 0) {
            const patientNames = upcomingAppointments.map(apt => 
                `${apt.patientFirstName} ${apt.patientLastName}`
            ).join(', ');
            
            showNotification(`Upcoming appointments in 30 minutes: ${patientNames}`, 'info');
        }
    }
    
    // Show notification
    function showNotification(message, type) {
        toastMessage.textContent = message;
        
        // Set background color based on type
        switch(type) {
            case 'success':
                notificationToast.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notificationToast.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notificationToast.style.backgroundColor = '#ffc107';
                break;
            default:
                notificationToast.style.backgroundColor = '#323232';
        }
        
        notificationToast.classList.remove('hidden');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            notificationToast.classList.add('hidden');
        }, 5000);
    }
    
    // Utility functions
    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    function isSameWeek(date1, date2) {
        const startOfWeek = new Date(date2);
        startOfWeek.setDate(date2.getDate() - date2.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        return date1 >= startOfWeek && date1 <= endOfWeek;
    }
    
    function isSameMonth(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth();
    }
    
    function formatAppointmentDate(date) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (isSameDay(date, today)) {
            return 'Today';
        } else if (isSameDay(date, tomorrow)) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
        }
    }
    
    function formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }
    
    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
});

// Appointments data will be fetched from backend
let appointmentsData = [];