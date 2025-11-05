document.addEventListener('DOMContentLoaded', async function() {
    // DOM Elements
    const currentDateEl = document.getElementById('currentDate');
    const prevDayBtn = document.getElementById('prevDay');
    const nextDayBtn = document.getElementById('nextDay');
    const daySelector = document.getElementById('daySelector');
    const timeSlots = document.getElementById('timeSlots');
    const scheduleTitle = document.getElementById('scheduleTitle');
    const todayCount = document.getElementById('todayCount');
    const weekCount = document.getElementById('weekCount');
    const upcomingAppointments = document.getElementById('upcomingAppointments');
    const upcomingBadge = document.getElementById('upcomingBadge');
    const viewToggleBtn = document.getElementById('viewToggleBtn');
    const notificationToast = document.getElementById('notificationToast');
    const toastMessage = document.querySelector('.toast-message');
    const toastClose = document.querySelector('.toast-close');

    // View mode elements
    const calendarModeBtn = document.getElementById('calendarModeBtn');
    const upcomingModeBtn = document.getElementById('upcomingModeBtn');
    const calendarView = document.getElementById('calendarView');
    const upcomingView = document.getElementById('upcomingView');

    // State
    let currentDate = new Date();
    let isWeekView = false;
    let scheduleData = [];
    let currentViewMode = 'calendar'; // 'calendar' or 'upcoming'

    // Available time slots (working hours)
    const workingHours = [
        '08:00:00', '08:30:00', '09:00:00', '09:30:00',
        '10:00:00', '10:30:00', '11:00:00', '11:30:00',
        '13:00:00', '13:30:00', '14:00:00', '14:30:00',
        '15:00:00', '15:30:00', '16:00:00', '16:30:00'
    ];

    // Utility Functions
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatDateDisplay(date) {
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    function getDayName(date) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    }

    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${period}`;
    }

    function calculateEndTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        let hour = parseInt(hours);
        let min = parseInt(minutes) + 30;

        if (min >= 60) {
            hour += 1;
            min -= 60;
        }

        return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
    }

    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    // Load schedule data from API
    async function loadSchedule(startDate, endDate) {
        try {
            const startStr = formatDate(startDate);
            const endStr = formatDate(endDate);
            console.log('Loading schedule from', startStr, 'to', endStr);
            const data = await DoctorAPI.getSchedule(startStr, endStr);
            console.log('Schedule data received:', data);

            if (Array.isArray(data) && data.length > 0) {
                console.log('First appointment:', data[0]);
                console.log('Sample patient_id:', data[0].patient_id);
            } else {
                console.warn('No appointments returned from API');
            }

            scheduleData = data || [];
            console.log('scheduleData now contains', scheduleData.length, 'appointments');
            return scheduleData;
        } catch (error) {
            console.error('Error loading schedule:', error);
            showNotification('Failed to load schedule data', 'error');
            return [];
        }
    }

    // Get appointments for a specific date
    function getAppointmentsForDate(date) {
        const formattedDate = formatDate(date);
        return scheduleData.filter(appt => {
            // Extract just the date part from the ISO string
            const apptDate = appt.booking_date.split('T')[0];
            return apptDate === formattedDate;
        });
    }

    // Get upcoming appointments (next 7 days)
    function getUpcomingAppointments() {
        const today = formatDate(new Date());
        const nextWeek = formatDate(addDays(new Date(), 7));

        return scheduleData
            .filter(appt => {
                const apptDate = appt.booking_date.split('T')[0];
                return apptDate >= today && apptDate <= nextWeek;
            })
            .sort((a, b) => {
                const dateA = a.booking_date.split('T')[0];
                const dateB = b.booking_date.split('T')[0];
                if (dateA !== dateB) {
                    return dateA.localeCompare(dateB);
                }
                return a.booking_time.localeCompare(b.booking_time);
            });
    }

    // Calculate statistics
    function calculateStats() {
        const today = formatDate(new Date());
        const nextWeek = formatDate(addDays(new Date(), 7));

        const todayAppointments = scheduleData.filter(appt => {
            const apptDate = appt.booking_date.split('T')[0];
            return apptDate === today;
        });

        const weekAppointments = scheduleData.filter(appt => {
            const apptDate = appt.booking_date.split('T')[0];
            return apptDate >= today && apptDate <= nextWeek;
        });

        return {
            today: todayAppointments.length,
            week: weekAppointments.length
        };
    }

    // Render day selector
    function renderDaySelector() {
        daySelector.innerHTML = '';

        for (let i = 0; i < 5; i++) {
            const date = addDays(currentDate, i);
            const appointments = getAppointmentsForDate(date);

            const dayOption = document.createElement('div');
            dayOption.className = 'day-option';
            if (i === 0) dayOption.classList.add('active');

            dayOption.innerHTML = `
                <div class="day-option-info">
                    <div class="day-label">${i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : getDayName(date)}</div>
                    <div class="day-date">${formatDateDisplay(date)}</div>
                </div>
                <div class="appointment-count">${appointments.length}</div>
            `;

            dayOption.addEventListener('click', () => {
                document.querySelectorAll('.day-option').forEach(opt => opt.classList.remove('active'));
                dayOption.classList.add('active');
                currentDate = date;
                currentDateEl.textContent = formatDateDisplay(currentDate);

                // Update both views
                if (currentViewMode === 'calendar') {
                    renderTimeSlots();
                } else {
                    renderUpcomingForSelectedDate();
                }
            });

            daySelector.appendChild(dayOption);
        }
    }

    // Render time slots for current date
    function renderTimeSlots() {
        if (isWeekView) {
            renderWeekView();
            return;
        }

        const appointments = getAppointmentsForDate(currentDate);
        const appointmentsByTime = {};
        appointments.forEach(appt => {
            appointmentsByTime[appt.booking_time] = appt;
        });

        timeSlots.innerHTML = '';

        workingHours.forEach(time => {
            const appointment = appointmentsByTime[time];
            const slot = document.createElement('div');

            if (appointment) {
                slot.className = 'time-slot booked';
                slot.innerHTML = `
                    <div class="slot-time">
                        <i class="fas fa-clock"></i>
                        ${formatTime(time)} - ${formatTime(calculateEndTime(time))}
                    </div>
                    <span class="slot-status">Booked</span>
                    <div class="patient-info">
                        <div class="patient-name">
                            <i class="fas fa-user"></i>
                            ${appointment.patient_name}
                        </div>
                        <div class="appointment-reason">${appointment.reason_for_visit || 'General consultation'}</div>
                    </div>
                `;
            } else {
                slot.className = 'time-slot available';
                slot.innerHTML = `
                    <div class="slot-time">
                        <i class="fas fa-clock"></i>
                        ${formatTime(time)} - ${formatTime(calculateEndTime(time))}
                    </div>
                    <span class="slot-status">Available</span>
                    <div class="slot-placeholder">No appointment scheduled</div>
                `;
            }

            timeSlots.appendChild(slot);
        });

        scheduleTitle.textContent = `Appointments for ${formatDateDisplay(currentDate)}`;
    }

    // Render week view
    function renderWeekView() {
        timeSlots.innerHTML = '';

        const weekGrid = document.createElement('div');
        weekGrid.className = 'week-view';

        const gridContainer = document.createElement('div');
        gridContainer.className = 'week-grid';

        // Header row
        const timeHeader = document.createElement('div');
        timeHeader.className = 'week-header time-label';
        timeHeader.textContent = 'Time';
        gridContainer.appendChild(timeHeader);

        for (let i = 0; i < 7; i++) {
            const date = addDays(currentDate, i);
            const dayHeader = document.createElement('div');
            dayHeader.className = 'week-header';
            dayHeader.innerHTML = `
                <div>${getDayName(date)}</div>
                <div style="font-size: 12px; opacity: 0.9;">${date.getMonth() + 1}/${date.getDate()}</div>
            `;
            gridContainer.appendChild(dayHeader);
        }

        // Time slots
        workingHours.forEach(time => {
            const timeLabel = document.createElement('div');
            timeLabel.className = 'week-time-label';
            timeLabel.textContent = formatTime(time);
            gridContainer.appendChild(timeLabel);

            for (let i = 0; i < 7; i++) {
                const date = addDays(currentDate, i);
                const dateStr = formatDate(date);
                const appointment = scheduleData.find(appt => {
                    const apptDate = appt.booking_date.split('T')[0];
                    return apptDate === dateStr && appt.booking_time === time;
                });

                const slot = document.createElement('div');
                slot.className = appointment ? 'week-slot booked' : 'week-slot available';

                if (appointment) {
                    slot.innerHTML = `
                        <div class="week-patient-name">${appointment.patient_name}</div>
                        <div class="week-reason">${appointment.reason_for_visit || 'Consultation'}</div>
                    `;
                } else {
                    slot.textContent = 'Available';
                }

                gridContainer.appendChild(slot);
            }
        });

        weekGrid.appendChild(gridContainer);
        timeSlots.appendChild(weekGrid);

        const startDate = formatDateDisplay(currentDate);
        const endDate = formatDateDisplay(addDays(currentDate, 6));
        scheduleTitle.textContent = `Weekly Schedule: ${startDate} - ${endDate}`;
    }

    // Render upcoming appointments (all upcoming)
    function renderUpcoming() {
        const upcoming = getUpcomingAppointments();
        upcomingBadge.textContent = upcoming.length;

        if (upcoming.length === 0) {
            upcomingAppointments.innerHTML = '<p class="no-appointments">No upcoming appointments</p>';
            return;
        }

        upcomingAppointments.innerHTML = '';

        upcoming.forEach(appt => {
            const appointmentDate = new Date(appt.booking_date);
            const appointmentEl = document.createElement('div');
            appointmentEl.className = 'upcoming-appointment';

            appointmentEl.innerHTML = `
                <div class="upcoming-date">
                    <div class="upcoming-day">${getDayName(appointmentDate)}</div>
                    <div class="upcoming-full-date">${formatDateDisplay(appointmentDate)}</div>
                </div>
                <div class="upcoming-time">${formatTime(appt.booking_time)}</div>
                <div>
                    <div class="upcoming-patient-name">${appt.patient_name}</div>
                    <div class="upcoming-reason">${appt.reason_for_visit || 'General consultation'}</div>
                </div>
                <button class="view-details-btn" data-patient-id="${appt.patient_id}" data-patient-name="${appt.patient_name}">
                    View Details
                </button>
            `;

            // Add click event to view details button
            const viewBtn = appointmentEl.querySelector('.view-details-btn');
            viewBtn.addEventListener('click', () => {
                openMedicalRecordsModal(appt.patient_id, appt.patient_name);
            });

            upcomingAppointments.appendChild(appointmentEl);
        });
    }

    // Render appointments for selected date only
    function renderUpcomingForSelectedDate() {
        const appointments = getAppointmentsForDate(currentDate);
        upcomingBadge.textContent = appointments.length;

        if (appointments.length === 0) {
            upcomingAppointments.innerHTML = '<p class="no-appointments">No appointments for this date</p>';
            return;
        }

        upcomingAppointments.innerHTML = '';

        // Sort by time
        appointments.sort((a, b) => a.booking_time.localeCompare(b.booking_time));

        appointments.forEach(appt => {
            const appointmentDate = new Date(appt.booking_date);
            const appointmentEl = document.createElement('div');
            appointmentEl.className = 'upcoming-appointment';

            appointmentEl.innerHTML = `
                <div class="upcoming-date">
                    <div class="upcoming-day">${getDayName(appointmentDate)}</div>
                    <div class="upcoming-full-date">${formatDateDisplay(appointmentDate)}</div>
                </div>
                <div class="upcoming-time">${formatTime(appt.booking_time)}</div>
                <div>
                    <div class="upcoming-patient-name">${appt.patient_name}</div>
                    <div class="upcoming-reason">${appt.reason_for_visit || 'General consultation'}</div>
                </div>
                <button class="view-details-btn" data-patient-id="${appt.patient_id}" data-patient-name="${appt.patient_name}">
                    View Details
                </button>
            `;

            // Add click event to view details button
            const viewBtn = appointmentEl.querySelector('.view-details-btn');
            viewBtn.addEventListener('click', () => {
                openMedicalRecordsModal(appt.patient_id, appt.patient_name);
            });

            upcomingAppointments.appendChild(appointmentEl);
        });
    }

    // Toggle between day and week view
    function toggleView() {
        isWeekView = !isWeekView;

        if (isWeekView) {
            viewToggleBtn.innerHTML = '<i class="fas fa-calendar-day"></i><span>View Today</span>';
        } else {
            viewToggleBtn.innerHTML = '<i class="fas fa-calendar-alt"></i><span>View Full Week</span>';
        }

        renderTimeSlots();
    }

    // Switch between calendar and upcoming view modes
    function switchViewMode(mode) {
        currentViewMode = mode;

        // Update button states
        if (mode === 'calendar') {
            calendarModeBtn.classList.add('active');
            upcomingModeBtn.classList.remove('active');
            calendarView.classList.remove('hidden');
            upcomingView.classList.add('hidden');
            // Show date navigation for calendar view
            prevDayBtn.parentElement.style.display = 'flex';
        } else {
            calendarModeBtn.classList.remove('active');
            upcomingModeBtn.classList.add('active');
            calendarView.classList.add('hidden');
            upcomingView.classList.remove('hidden');
            // Hide date navigation for upcoming view
            prevDayBtn.parentElement.style.display = 'none';
            // Render appointments for the currently selected date
            renderUpcomingForSelectedDate();
        }
    }

    // Show notification
    function showNotification(message, type = 'info') {
        toastMessage.textContent = message;
        notificationToast.className = 'toast ' + (type === 'error' ? 'toast-error' : 'toast-success');
        notificationToast.classList.remove('hidden');

        setTimeout(() => {
            notificationToast.classList.add('hidden');
        }, 3000);
    }

    // Event Listeners
    calendarModeBtn.addEventListener('click', () => {
        switchViewMode('calendar');
    });

    upcomingModeBtn.addEventListener('click', () => {
        switchViewMode('upcoming');
    });

    prevDayBtn.addEventListener('click', async () => {
        currentDate = addDays(currentDate, -1);
        currentDateEl.textContent = formatDateDisplay(currentDate);
        await loadSchedule(currentDate, addDays(currentDate, 7));
        renderDaySelector();
        renderTimeSlots();
        renderUpcoming();
    });

    nextDayBtn.addEventListener('click', async () => {
        currentDate = addDays(currentDate, 1);
        currentDateEl.textContent = formatDateDisplay(currentDate);
        await loadSchedule(currentDate, addDays(currentDate, 7));
        renderDaySelector();
        renderTimeSlots();
        renderUpcoming();
    });

    viewToggleBtn.addEventListener('click', toggleView);

    toastClose.addEventListener('click', () => {
        notificationToast.classList.add('hidden');
    });

    // Initialize
    async function init() {
        currentDateEl.textContent = formatDateDisplay(currentDate);

        // Load schedule data for current week
        await loadSchedule(currentDate, addDays(currentDate, 7));

        // Calculate and display stats
        const stats = calculateStats();
        todayCount.textContent = stats.today;
        weekCount.textContent = stats.week;

        // Render components
        renderDaySelector();
        renderTimeSlots();
        renderUpcoming();
    }

    // Medical Records Modal Functions
    async function openMedicalRecordsModal(patientId, patientName) {
        console.log('Opening medical records modal for patient:', patientId, patientName);

        const modal = document.getElementById('medicalRecordsModal');
        const loadingState = document.getElementById('modalLoadingState');
        const content = document.getElementById('medicalRecordsContent');

        if (!modal) {
            console.error('Modal element not found!');
            return;
        }

        // Show modal with loading state
        modal.classList.remove('hidden');
        loadingState.classList.remove('hidden');
        content.classList.add('hidden');
        document.body.style.overflow = 'hidden';

        try {
            console.log('Fetching medical records for patient ID:', patientId);
            // Fetch medical records
            const data = await DoctorAPI.getPatientMedicalRecords(patientId);
            console.log('Medical records data received:', data);

            if (!data || !data.patient) {
                throw new Error('Invalid medical records data received');
            }

            // Populate patient info
            populatePatientInfo(data.patient);

            // Populate allergies
            populateAllergies(data.allergies || []);

            // Populate conditions
            populateConditions(data.conditions || []);

            // Populate medications
            populateMedications(data.currentMedications || []);

            // Populate reports
            populateReports(data.reports || []);

            // Hide loading, show content
            loadingState.style.display = 'none';
            content.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading medical records:', error);
            console.error('Error details:', error.message, error.stack);
            showNotification(`Failed to load medical records: ${error.message}`, 'error');
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    function populatePatientInfo(patient) {
        // Avatar initials
        const initials = `${patient.first_name?.charAt(0) || ''}${patient.last_name?.charAt(0) || ''}`;
        document.getElementById('patientAvatar').textContent = initials;

        // Patient details
        document.getElementById('patientName').textContent = `${patient.first_name || ''} ${patient.last_name || ''}`;
        document.getElementById('patientId').textContent = patient.patient_id || '-';
        document.getElementById('patientDob').textContent = patient.date_of_birth ? formatDateForDisplay(new Date(patient.date_of_birth)) : '-';
        document.getElementById('patientGender').textContent = patient.gender || '-';
        document.getElementById('patientBloodType').textContent = patient.blood_type || '-';
        document.getElementById('patientEmail').textContent = patient.email || '-';
        document.getElementById('patientPhone').textContent = patient.phone_number || '-';
    }

    function populateAllergies(allergies) {
        const container = document.getElementById('allergiesContent');
        const count = document.getElementById('allergiesCount');

        count.textContent = allergies.length;

        if (allergies.length === 0) {
            container.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-check-circle"></i>
                    <p>No known allergies</p>
                </div>
            `;
            return;
        }

        container.innerHTML = allergies.map(allergy => `
            <div class="allergy-item">
                <div class="item-name">${allergy.allergen}</div>
                <div class="item-details">
                    ${allergy.reaction ? `<div>Reaction: ${allergy.reaction}</div>` : ''}
                    ${allergy.diagnosed_date ? `<div>Diagnosed: ${formatDateForDisplay(new Date(allergy.diagnosed_date))}</div>` : ''}
                    ${allergy.notes ? `<div>${allergy.notes}</div>` : ''}
                </div>
                ${allergy.severity ? `<span class="item-status severity-${allergy.severity.toLowerCase()}">${allergy.severity}</span>` : ''}
            </div>
        `).join('');
    }

    function populateConditions(conditions) {
        const container = document.getElementById('conditionsContent');
        const count = document.getElementById('conditionsCount');

        count.textContent = conditions.length;

        if (conditions.length === 0) {
            container.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-check-circle"></i>
                    <p>No medical conditions</p>
                </div>
            `;
            return;
        }

        container.innerHTML = conditions.map(condition => `
            <div class="condition-item">
                <div class="item-name">${condition.condition_name}</div>
                <div class="item-details">
                    ${condition.diagnosed_date ? `<div>Diagnosed: ${formatDateForDisplay(new Date(condition.diagnosed_date))}</div>` : ''}
                    ${condition.medications ? `<div>Medications: ${condition.medications}</div>` : ''}
                    ${condition.notes ? `<div>${condition.notes}</div>` : ''}
                </div>
                ${condition.status ? `<span class="item-status status-${condition.status.toLowerCase().replace(' ', '-')}">${condition.status}</span>` : ''}
            </div>
        `).join('');
    }

    function populateMedications(medications) {
        const container = document.getElementById('medicationsContent');
        const count = document.getElementById('medicationsCount');

        count.textContent = medications.length;

        if (medications.length === 0) {
            container.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-check-circle"></i>
                    <p>No current medications</p>
                </div>
            `;
            return;
        }

        container.innerHTML = medications.map(med => `
            <div class="medication-item">
                <div class="item-name">${med.medication_name}</div>
                <div class="item-details">
                    ${med.dosage ? `<div>Dosage: ${med.dosage}</div>` : ''}
                    ${med.frequency ? `<div>Frequency: ${med.frequency}</div>` : ''}
                    ${med.start_date ? `<div>Started: ${formatDateForDisplay(new Date(med.start_date))}</div>` : ''}
                    ${med.notes ? `<div>${med.notes}</div>` : ''}
                </div>
                ${med.status ? `<span class="item-status status-${med.status.toLowerCase()}">${med.status}</span>` : ''}
            </div>
        `).join('');
    }

    function populateReports(reports) {
        const container = document.getElementById('reportsContent');
        const count = document.getElementById('reportsCount');

        if (!container) return;

        if (count) count.textContent = reports.length;

        if (reports.length === 0) {
            container.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-file-medical"></i>
                    <p>No medical reports yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = reports.map(report => `
            <div class="medication-item">
                <div class="item-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div class="item-name">${escapeHtml(report.report_type)}</div>
                    <span class="item-status status-active">${formatDateForDisplay(new Date(report.report_date))}</span>
                </div>
                ${report.diagnosis ? `<div class="item-details"><strong>Diagnosis:</strong> ${escapeHtml(report.diagnosis)}</div>` : ''}
                ${report.treatment_plan ? `<div class="item-details"><strong>Treatment Plan:</strong> ${escapeHtml(report.treatment_plan)}</div>` : ''}
                ${report.tests_recommended ? `<div class="item-details"><strong>Tests Recommended:</strong> ${escapeHtml(report.tests_recommended)}</div>` : ''}
                <div class="item-details" style="margin-top: 8px;">
                    ${report.doctor_name ? `<div><i class="fas fa-user-md"></i> Dr. ${escapeHtml(report.doctor_name)}</div>` : ''}
                    ${report.doctor_specialization ? `<div><i class="fas fa-stethoscope"></i> ${escapeHtml(report.doctor_specialization)}</div>` : ''}
                    ${report.followup_date ? `<div><i class="fas fa-calendar-check"></i> Follow-up: ${formatDateForDisplay(new Date(report.followup_date))}</div>` : ''}
                </div>
                ${report.notes ? `<div class="item-details" style="margin-top: 8px; font-style: italic;"><i class="fas fa-sticky-note"></i> ${escapeHtml(report.notes)}</div>` : ''}
            </div>
        `).join('');
    }

    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.toString().replace(/[&<>"']/g, m => map[m]);
    }

    function formatDateForDisplay(date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Make closeMedicalRecordsModal available globally
    window.closeMedicalRecordsModal = function() {
        const modal = document.getElementById('medicalRecordsModal');
        const modalContainer = modal.querySelector('.modal-container');
        modal.classList.add('hidden');
        modalContainer.classList.remove('enlarged');
        document.body.style.overflow = 'auto';

        // Reset enlarge button icon
        const enlargeBtn = document.getElementById('enlargeBtn');
        if (enlargeBtn) {
            enlargeBtn.innerHTML = '<i class="fas fa-expand"></i>';
            enlargeBtn.title = 'Enlarge';
        }
    };

    // Enlarge/Shrink modal
    window.enlargeMedicalRecordsModal = function() {
        const modal = document.getElementById('medicalRecordsModal');
        const modalContainer = modal.querySelector('.modal-container');
        const enlargeBtn = document.getElementById('enlargeBtn');

        if (modalContainer.classList.contains('enlarged')) {
            // Shrink to normal size
            modalContainer.classList.remove('enlarged');
            enlargeBtn.innerHTML = '<i class="fas fa-expand"></i>';
            enlargeBtn.title = 'Enlarge';
        } else {
            // Enlarge to full screen
            modalContainer.classList.add('enlarged');
            enlargeBtn.innerHTML = '<i class="fas fa-compress"></i>';
            enlargeBtn.title = 'Shrink';
        }
    };

    // Print medical records
    window.printMedicalRecords = function() {
        const printContent = document.getElementById('medicalRecordsContent').cloneNode(true);
        const printWindow = window.open('', '_blank');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Medical Records - Print</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 20px;
                        color: #333;
                    }
                    .patient-info-card {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 20px;
                        margin-bottom: 20px;
                        border: 1px solid #dee2e6;
                    }
                    .patient-header {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                    }
                    .patient-avatar {
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        background: #1a6fc4;
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .patient-details h3 {
                        margin: 0 0 10px 0;
                        font-size: 20px;
                    }
                    .patient-meta, .patient-contact {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 15px;
                        font-size: 13px;
                        margin-bottom: 5px;
                    }
                    .medical-info-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 20px;
                        margin-top: 20px;
                    }
                    .info-card {
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        overflow: hidden;
                        page-break-inside: avoid;
                    }
                    .info-card-header {
                        background: #f8f9fa;
                        padding: 12px 15px;
                        border-bottom: 1px solid #dee2e6;
                        font-weight: bold;
                    }
                    .info-card-header h4 {
                        margin: 0;
                        font-size: 16px;
                    }
                    .info-card-body {
                        padding: 15px;
                    }
                    .allergy-item, .condition-item, .medication-item {
                        padding: 12px;
                        background: #f8f9fa;
                        border-radius: 6px;
                        margin-bottom: 10px;
                        border-left: 4px solid #1a6fc4;
                    }
                    .allergy-item {
                        border-left-color: #ff9800;
                    }
                    .condition-item {
                        border-left-color: #f44336;
                    }
                    .medication-item {
                        border-left-color: #4caf50;
                    }
                    .item-name {
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .item-details {
                        font-size: 12px;
                        color: #666;
                    }
                    .item-status {
                        display: inline-block;
                        padding: 3px 8px;
                        border-radius: 10px;
                        font-size: 11px;
                        font-weight: bold;
                        margin-top: 5px;
                    }
                    .empty-message {
                        text-align: center;
                        color: #999;
                        font-style: italic;
                        padding: 20px;
                    }
                    @media print {
                        body { padding: 10px; }
                        .info-card { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `);

        printWindow.document.close();
    };

    // Download medical records as PDF
    window.downloadMedicalRecordsPDF = async function() {
        try {
            showNotification('Generating PDF...', 'info');

            const content = document.getElementById('medicalRecordsContent');
            const patientName = document.getElementById('patientName').textContent || 'Patient';

            // Use html2canvas to capture the content
            const canvas = await html2canvas(content, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');

            // Create PDF using jsPDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add additional pages if content is longer
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Save the PDF
            const fileName = `Medical_Records_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

            showNotification('PDF downloaded successfully', 'success');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showNotification('Failed to generate PDF', 'error');
        }
    };

    // Close modal when clicking overlay
    document.querySelector('.modal-overlay')?.addEventListener('click', () => {
        window.closeMedicalRecordsModal();
    });

    // Medical Records CRUD Functions
    let currentEditingItemId = null;
    let currentEditingItemType = null;

    // Allergy Modal Functions
    window.openAddAllergyModal = function() {
        currentEditingItemId = null;
        document.getElementById('allergyModalTitle').innerHTML = '<i class="fas fa-exclamation-triangle"></i> Add Allergy';
        document.getElementById('allergyForm').reset();
        document.getElementById('allergyId').value = '';
        document.getElementById('allergyModal').classList.remove('hidden');
    };

    window.closeAllergyModal = function() {
        document.getElementById('allergyModal').classList.add('hidden');
        currentEditingItemId = null;
    };

    document.getElementById('allergyForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            patient_id: currentPatient.patient_id,
            allergen: document.getElementById('allergen').value,
            reaction: document.getElementById('reaction').value || null,
            severity: document.getElementById('severity').value,
            diagnosed_date: document.getElementById('allergyDiagnosedDate').value || null,
            notes: document.getElementById('allergyNotes').value || null
        };

        try {
            const allergyId = document.getElementById('allergyId').value;
            const url = allergyId ? `/api/doctor/allergies/${allergyId}` : '/api/doctor/allergies';
            const method = allergyId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save allergy');

            showNotification(allergyId ? 'Allergy updated successfully' : 'Allergy added successfully', 'success');
            window.closeAllergyModal();
            await loadPatientMedicalRecords(currentPatient.patient_id);
        } catch (error) {
            console.error('Error saving allergy:', error);
            showNotification('Failed to save allergy', 'error');
        }
    });

    // Condition Modal Functions
    window.openAddConditionModal = function() {
        currentEditingItemId = null;
        document.getElementById('conditionModalTitle').innerHTML = '<i class="fas fa-heartbeat"></i> Add Condition';
        document.getElementById('conditionForm').reset();
        document.getElementById('conditionId').value = '';
        document.getElementById('conditionModal').classList.remove('hidden');
    };

    window.closeConditionModal = function() {
        document.getElementById('conditionModal').classList.add('hidden');
        currentEditingItemId = null;
    };

    document.getElementById('conditionForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            patient_id: currentPatient.patient_id,
            condition_name: document.getElementById('conditionName').value,
            status: document.getElementById('conditionStatus').value,
            diagnosed_date: document.getElementById('conditionDiagnosedDate').value || null,
            notes: document.getElementById('conditionNotes').value || null
        };

        try {
            const conditionId = document.getElementById('conditionId').value;
            const url = conditionId ? `/api/doctor/conditions/${conditionId}` : '/api/doctor/conditions';
            const method = conditionId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save condition');

            showNotification(conditionId ? 'Condition updated successfully' : 'Condition added successfully', 'success');
            window.closeConditionModal();
            await loadPatientMedicalRecords(currentPatient.patient_id);
        } catch (error) {
            console.error('Error saving condition:', error);
            showNotification('Failed to save condition', 'error');
        }
    });

    // Medication Modal Functions
    window.openAddMedicationModal = function() {
        currentEditingItemId = null;
        document.getElementById('medicationModalTitle').innerHTML = '<i class="fas fa-pills"></i> Add Medication';
        document.getElementById('medicationForm').reset();
        document.getElementById('medicationId').value = '';
        document.getElementById('medicationModal').classList.remove('hidden');
    };

    window.closeMedicationModal = function() {
        document.getElementById('medicationModal').classList.add('hidden');
        currentEditingItemId = null;
    };

    document.getElementById('medicationForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            patient_id: currentPatient.patient_id,
            medication_name: document.getElementById('medicationName').value,
            dosage: document.getElementById('dosage').value || null,
            frequency: document.getElementById('frequency').value || null,
            start_date: document.getElementById('startDate').value || null,
            status: document.getElementById('medicationStatus').value,
            notes: document.getElementById('medicationNotes').value || null
        };

        try {
            const medicationId = document.getElementById('medicationId').value;
            const url = medicationId ? `/api/doctor/medications/${medicationId}` : '/api/doctor/medications';
            const method = medicationId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save medication');

            showNotification(medicationId ? 'Medication updated successfully' : 'Medication added successfully', 'success');
            window.closeMedicationModal();
            await loadPatientMedicalRecords(currentPatient.patient_id);
        } catch (error) {
            console.error('Error saving medication:', error);
            showNotification('Failed to save medication', 'error');
        }
    });

    // Report Modal Functions
    window.openCreateReportModal = function() {
        document.getElementById('reportForm').reset();
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('reportDate').value = today;
        document.getElementById('reportModal').classList.remove('hidden');
    };

    window.closeReportModal = function() {
        document.getElementById('reportModal').classList.add('hidden');
    };

    document.getElementById('reportForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            patient_id: currentPatient.patient_id,
            report_type: document.getElementById('reportType').value,
            report_date: document.getElementById('reportDate').value,
            diagnosis: document.getElementById('diagnosis').value || null,
            treatment_plan: document.getElementById('treatmentPlan').value || null,
            tests_recommended: document.getElementById('testsRecommended').value || null,
            follow_up_date: document.getElementById('followupDate').value || null,
            notes: document.getElementById('reportNotes').value || null
        };

        try {
            const response = await fetch('/api/doctor/medical-reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to create report');

            showNotification('Medical report created successfully', 'success');
            window.closeReportModal();
            await loadPatientMedicalRecords(currentPatient.patient_id);
        } catch (error) {
            console.error('Error creating report:', error);
            showNotification('Failed to create report', 'error');
        }
    });

    await init();
});
