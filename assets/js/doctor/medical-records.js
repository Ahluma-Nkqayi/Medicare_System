// Medical Records Page JavaScript
document.addEventListener("DOMContentLoaded", () => {
  initializePage()
})

let currentPatientId = null
let allPatients = []
let currentPatientData = null
const setActiveNav = null // Declare setActiveNav variable
const handleReportSubmit = null // Declare handleReportSubmit variable
window.html2canvas = null // Declare html2canvas variable

function initializePage() {
  loadPatients()
  setupEventListeners()

  if (typeof setActiveNav === "function") {
    setActiveNav("medical-records")
  }
}

function setupEventListeners() {
  const searchInput = document.getElementById("patientSearch")
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch)
  }

  const toastClose = document.querySelector(".toast-close")
  if (toastClose) {
    toastClose.addEventListener("click", hideToast)
  }

  // Form submissions
  const allergyForm = document.getElementById("allergyForm")
  if (allergyForm) {
    allergyForm.addEventListener("submit", handleAllergySubmit)
  }

  const conditionForm = document.getElementById("conditionForm")
  if (conditionForm) {
    conditionForm.addEventListener("submit", handleConditionSubmit)
  }

  const medicationForm = document.getElementById("medicationForm")
  if (medicationForm) {
    medicationForm.addEventListener("submit", handleMedicationSubmit)
  }

  const reportForm = document.getElementById("reportForm")
  if (reportForm) {
    reportForm.addEventListener("submit", handleReportSubmit)
  }
}

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim()

  if (!searchTerm) {
    renderPatientsTable(allPatients)
    return
  }

  const filteredPatients = allPatients.filter((patient) => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase()
    const email = (patient.email || "").toLowerCase()
    const phone = (patient.phone_number || "").toLowerCase()
    const patientId = patient.patient_id.toString()

    return (
      fullName.includes(searchTerm) ||
      email.includes(searchTerm) ||
      phone.includes(searchTerm) ||
      patientId.includes(searchTerm)
    )
  })

  renderPatientsTable(filteredPatients)
}

async function loadPatients() {
  try {
    const response = await fetch("/api/doctor/patients", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to load patients")
    }

    const patients = await response.json()
    allPatients = patients
    renderPatientsTable(patients)
  } catch (error) {
    console.error("Error loading patients:", error)
    showToast("Failed to load patients. Please refresh the page.", "error")
    renderPatientsTableError()
  }
}

function renderPatientsTable(patients) {
  const tbody = document.getElementById("patientsTableBody")
  if (!tbody) return

  tbody.innerHTML = ""

  if (patients.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">
                    <i class="fas fa-user-slash"></i>
                    <p>No patients found</p>
                </td>
            </tr>
        `
    return
  }

  patients.forEach((patient) => {
    const row = document.createElement("tr")
    row.dataset.patientId = patient.patient_id

    row.innerHTML = `
            <td>${escapeHtml(patient.patient_id)}</td>
            <td><strong>${escapeHtml(patient.first_name)} ${escapeHtml(patient.last_name)}</strong></td>
            <td>${escapeHtml(patient.email || "-")}</td>
            <td>${escapeHtml(patient.phone_number || "-")}</td>
            <td>${patient.last_visit ? formatDate(patient.last_visit) : "Never"}</td>
            <td>
                <button class="btn-view" onclick="handleViewRecords(${patient.patient_id})">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `

    row.addEventListener("click", (e) => {
      if (e.target.closest(".btn-view")) return
      handleViewRecords(patient.patient_id)
    })

    tbody.appendChild(row)
  })
}

function renderPatientsTableError() {
  const tbody = document.getElementById("patientsTableBody")
  if (!tbody) return

  tbody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-row">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load patients. Please refresh the page.</p>
            </td>
        </tr>
    `
}

async function handleViewRecords(patientId) {
  document.querySelectorAll(".patients-table tbody tr").forEach((row) => {
    row.classList.remove("selected")
  })

  const selectedRow = document.querySelector(`tr[data-patient-id="${patientId}"]`)
  if (selectedRow) {
    selectedRow.classList.add("selected")
  }

  currentPatientId = patientId

  const modal = document.getElementById("medicalRecordsModal")
  const loadingState = document.getElementById("modalLoadingState")
  const recordsContent = document.getElementById("medicalRecordsContent")

  if (modal) modal.classList.remove("hidden")
  if (loadingState) loadingState.classList.remove("hidden")
  if (recordsContent) recordsContent.classList.add("hidden")

  try {
    await loadMedicalRecords(patientId)
  } catch (error) {
    console.error("Error loading medical records:", error)
    showToast("Failed to load medical records. Please try again.", "error")
    closeMedicalRecordsModal()
  }
}

window.handleViewRecords = handleViewRecords

async function loadMedicalRecords(patientId) {
  try {
    const response = await fetch(`/api/doctor/patients/${patientId}/medical-records`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to load medical records")
    }

    const data = await response.json()
    currentPatientData = data
    displayMedicalRecords(data)

    const loadingState = document.getElementById("modalLoadingState")
    const recordsContent = document.getElementById("medicalRecordsContent")

    if (loadingState) loadingState.classList.add("hidden")
    if (recordsContent) recordsContent.classList.remove("hidden")

    showToast("Medical records loaded successfully", "success")
  } catch (error) {
    throw error
  }
}

function displayMedicalRecords(data) {
  const { patient, conditions, allergies, currentMedications, reports } = data

  displayPatientInfo(patient)
  displayAllergies(allergies)
  displayConditions(conditions)
  displayMedications(currentMedications)
  displayReports(reports || [])
}

function displayPatientInfo(patient) {
  const avatar = document.getElementById("patientAvatar")
  if (avatar && patient.first_name && patient.last_name) {
    const initials = `${patient.first_name.charAt(0)}${patient.last_name.charAt(0)}`.toUpperCase()
    avatar.textContent = initials
  }

  const nameEl = document.getElementById("patientName")
  if (nameEl) {
    nameEl.textContent = `${patient.first_name || ""} ${patient.last_name || ""}`.trim()
  }

  const idEl = document.getElementById("patientId")
  if (idEl) idEl.textContent = patient.patient_id || "-"

  const dobEl = document.getElementById("patientDob")
  if (dobEl && patient.date_of_birth) {
    dobEl.textContent = formatDate(patient.date_of_birth)
  }

  const genderEl = document.getElementById("patientGender")
  if (genderEl) genderEl.textContent = patient.gender || "-"

  const bloodTypeEl = document.getElementById("patientBloodType")
  if (bloodTypeEl) bloodTypeEl.textContent = patient.blood_type || "-"

  const emailEl = document.getElementById("patientEmail")
  if (emailEl) emailEl.textContent = patient.email || "-"

  const phoneEl = document.getElementById("patientPhone")
  if (phoneEl) phoneEl.textContent = patient.phone_number || "-"
}

function displayAllergies(allergies) {
  const container = document.getElementById("allergiesContent")
  const countBadge = document.getElementById("allergiesCount")

  if (!container) return

  if (countBadge) countBadge.textContent = allergies.length

  container.innerHTML = ""

  if (allergies.length === 0) {
    container.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-check-circle"></i>
                <p>No known allergies</p>
            </div>
        `
    return
  }

  allergies.forEach((allergy) => {
    const allergyEl = document.createElement("div")
    allergyEl.className = "info-item"

    const severityClass = allergy.severity ? `severity-${allergy.severity.toLowerCase()}` : "severity-moderate"

    allergyEl.innerHTML = `
            <div class="info-item-header">
                <div class="info-item-title">${escapeHtml(allergy.allergen)}</div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${allergy.severity ? `<span class="severity-badge ${severityClass}">${escapeHtml(allergy.severity)}</span>` : ""}
                    <div class="info-item-actions">
                        <button class="btn-edit-item" onclick='editAllergy(${JSON.stringify(allergy)})' title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete-item" onclick="deleteAllergy(${allergy.allergy_id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
            ${allergy.reaction ? `<div class="info-item-content">${escapeHtml(allergy.reaction)}</div>` : ""}
            <div class="info-item-meta">
                ${allergy.diagnosed_date ? `<span><i class="fas fa-calendar"></i> Diagnosed: ${formatDate(allergy.diagnosed_date)}</span>` : ""}
                ${allergy.notes ? `<span><i class="fas fa-sticky-note"></i> ${escapeHtml(allergy.notes)}</span>` : ""}
            </div>
        `

    container.appendChild(allergyEl)
  })
}

function displayConditions(conditions) {
  const container = document.getElementById("conditionsContent")
  const countBadge = document.getElementById("conditionsCount")

  if (!container) return

  if (countBadge) countBadge.textContent = conditions.length

  container.innerHTML = ""

  if (conditions.length === 0) {
    container.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-check-circle"></i>
                <p>No medical conditions</p>
            </div>
        `
    return
  }

  conditions.forEach((condition) => {
    const conditionEl = document.createElement("div")
    conditionEl.className = "info-item"

    const statusClass = condition.status
      ? `status-${condition.status.toLowerCase().replace(" ", "-")}`
      : "status-active"

    conditionEl.innerHTML = `
            <div class="info-item-header">
                <div class="info-item-title">${escapeHtml(condition.condition_name)}</div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${condition.status ? `<span class="status-badge ${statusClass}">${escapeHtml(condition.status)}</span>` : ""}
                    <div class="info-item-actions">
                        <button class="btn-edit-item" onclick='editCondition(${JSON.stringify(condition)})' title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete-item" onclick="deleteCondition(${condition.condition_id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
            ${condition.notes ? `<div class="info-item-content">${escapeHtml(condition.notes)}</div>` : ""}
            <div class="info-item-meta">
                ${condition.diagnosed_date ? `<span><i class="fas fa-calendar"></i> Diagnosed: ${formatDate(condition.diagnosed_date)}</span>` : ""}
                ${condition.medications ? `<span><i class="fas fa-pills"></i> ${escapeHtml(condition.medications)}</span>` : ""}
            </div>
        `

    container.appendChild(conditionEl)
  })
}

function displayMedications(medications) {
  const container = document.getElementById("medicationsContent")
  const countBadge = document.getElementById("medicationsCount")

  if (!container) return

  if (countBadge) countBadge.textContent = medications.length

  container.innerHTML = ""

  if (medications.length === 0) {
    container.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-check-circle"></i>
                <p>No current medications</p>
            </div>
        `
    return
  }

  medications.forEach((medication) => {
    const medicationEl = document.createElement("div")
    medicationEl.className = "info-item"

    const statusClass = medication.status ? `status-${medication.status.toLowerCase()}` : "status-active"

    medicationEl.innerHTML = `
            <div class="info-item-header">
                <div class="info-item-title">${escapeHtml(medication.medication_name)}</div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${medication.status ? `<span class="status-badge ${statusClass}">${escapeHtml(medication.status)}</span>` : ""}
                    <div class="info-item-actions">
                        <button class="btn-edit-item" onclick='editMedication(${JSON.stringify(medication)})' title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete-item" onclick="deleteMedication(${medication.patient_medicine_id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="info-item-content">
                ${medication.dosage ? `<strong>Dosage:</strong> ${escapeHtml(medication.dosage)}` : ""}
                ${medication.frequency ? ` | <strong>Frequency:</strong> ${escapeHtml(medication.frequency)}` : ""}
            </div>
            <div class="info-item-meta">
                ${medication.start_date ? `<span><i class="fas fa-calendar"></i> Started: ${formatDate(medication.start_date)}</span>` : ""}
                ${medication.notes ? `<span><i class="fas fa-sticky-note"></i> ${escapeHtml(medication.notes)}</span>` : ""}
            </div>
        `

    container.appendChild(medicationEl)
  })
}

function displayReports(reports) {
  const container = document.getElementById("reportsContent")
  const countBadge = document.getElementById("reportsCount")

  if (!container) return

  if (countBadge) countBadge.textContent = reports.length

  container.innerHTML = ""

  if (reports.length === 0) {
    container.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-file-medical"></i>
                <p>No medical reports yet</p>
            </div>
        `
    return
  }

  reports.forEach((report) => {
    const reportEl = document.createElement("div")
    reportEl.className = "info-item"

    reportEl.innerHTML = `
            <div class="info-item-header">
                <div class="info-item-title">
                    <i class="fas fa-file-medical-alt"></i> ${escapeHtml(report.report_type)}
                </div>
                <div>
                    <span class="status-badge status-active">${formatDate(report.report_date)}</span>
                </div>
            </div>
            ${report.diagnosis ? `<div class="info-item-content"><strong>Diagnosis:</strong> ${escapeHtml(report.diagnosis)}</div>` : ""}
            ${report.treatment_plan ? `<div class="info-item-content"><strong>Treatment Plan:</strong> ${escapeHtml(report.treatment_plan)}</div>` : ""}
            ${report.tests_recommended ? `<div class="info-item-content"><strong>Tests Recommended:</strong> ${escapeHtml(report.tests_recommended)}</div>` : ""}
            <div class="info-item-meta">
                ${report.doctor_name ? `<span><i class="fas fa-user-md"></i> Dr. ${escapeHtml(report.doctor_name)}</span>` : ""}
                ${report.doctor_specialization ? `<span><i class="fas fa-stethoscope"></i> ${escapeHtml(report.doctor_specialization)}</span>` : ""}
                ${report.followup_date ? `<span><i class="fas fa-calendar-check"></i> Follow-up: ${formatDate(report.followup_date)}</span>` : ""}
            </div>
            ${report.notes ? `<div class="info-item-content" style="margin-top: 10px; font-style: italic;"><i class="fas fa-sticky-note"></i> ${escapeHtml(report.notes)}</div>` : ""}
        `

    container.appendChild(reportEl)
  })
}

function closeMedicalRecordsModal() {
  const modal = document.getElementById("medicalRecordsModal")
  if (modal) modal.classList.add("hidden")
  currentPatientId = null
}

window.closeMedicalRecordsModal = closeMedicalRecordsModal

function printMedicalRecord() {
  if (!currentPatientId) {
    showToast("No medical record selected", "error")
    return
  }

  window.print()
}

window.printMedicalRecord = printMedicalRecord

async function downloadMedicalRecordPDF() {
  if (!currentPatientId || !currentPatientData) {
    showToast("No medical record selected", "error")
    return
  }

  try {
    showToast("Generating PDF...", "info")

    const modalContent = document.getElementById("medicalRecordsContent")

    const actionButtons = modalContent.querySelectorAll(".info-item-actions, .btn-icon, .report-card")
    actionButtons.forEach((btn) => (btn.style.display = "none"))

    const canvas = await window.html2canvas(modalContent, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    })

    actionButtons.forEach((btn) => (btn.style.display = ""))

    const imgData = canvas.toDataURL("image/png")

    const { jsPDF } = window.jspdf
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    const patientName = currentPatientData.patient
      ? `${currentPatientData.patient.first_name}_${currentPatientData.patient.last_name}`.replace(/\s+/g, "_")
      : "Patient"
    const date = new Date().toISOString().split("T")[0]
    const filename = `Medical_Record_${patientName}_${date}.pdf`

    pdf.save(filename)

    showToast("PDF downloaded successfully", "success")
  } catch (error) {
    console.error("Error generating PDF:", error)
    showToast("Failed to generate PDF. Please try again.", "error")
  }
}

window.downloadMedicalRecordPDF = downloadMedicalRecordPDF

function openAddAllergyModal() {
  document.getElementById("allergyModalTitle").innerHTML = '<i class="fas fa-exclamation-triangle"></i> Add Allergy'
  document.getElementById("allergyForm").reset()
  document.getElementById("allergyId").value = ""
  document.getElementById("allergyModal").classList.remove("hidden")
}

window.openAddAllergyModal = openAddAllergyModal

function editAllergy(allergy) {
  document.getElementById("allergyModalTitle").innerHTML = '<i class="fas fa-exclamation-triangle"></i> Edit Allergy'
  document.getElementById("allergyId").value = allergy.allergy_id
  document.getElementById("allergen").value = allergy.allergen || ""
  document.getElementById("reaction").value = allergy.reaction || ""
  document.getElementById("severity").value = allergy.severity || "Moderate"
  document.getElementById("allergyDiagnosedDate").value = allergy.diagnosed_date
    ? allergy.diagnosed_date.split("T")[0]
    : ""
  document.getElementById("allergyNotes").value = allergy.notes || ""
  document.getElementById("allergyModal").classList.remove("hidden")
}

window.editAllergy = editAllergy

function closeAllergyModal() {
  document.getElementById("allergyModal").classList.add("hidden")
}

window.closeAllergyModal = closeAllergyModal

async function handleAllergySubmit(e) {
  e.preventDefault()

  const allergyId = document.getElementById("allergyId").value
  const data = {
    patient_id: currentPatientId,
    allergen: document.getElementById("allergen").value,
    reaction: document.getElementById("reaction").value,
    severity: document.getElementById("severity").value,
    diagnosed_date: document.getElementById("allergyDiagnosedDate").value,
    notes: document.getElementById("allergyNotes").value,
    is_active: true,
  }

  try {
    const url = allergyId
      ? `/api/doctor/patients/${currentPatientId}/allergies/${allergyId}`
      : `/api/doctor/patients/${currentPatientId}/allergies`

    const method = allergyId ? "PUT" : "POST"

    const response = await fetch(url, {
      method: method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to save allergy")
    }

    closeAllergyModal()
    showToast(allergyId ? "Allergy updated successfully" : "Allergy added successfully", "success")
    await loadMedicalRecords(currentPatientId)
  } catch (error) {
    console.error("Error saving allergy:", error)
    showToast("Failed to save allergy. Please try again.", "error")
  }
}

async function deleteAllergy(allergyId) {
  if (!confirm("Are you sure you want to delete this allergy?")) return

  try {
    const response = await fetch(`/api/doctor/patients/${currentPatientId}/allergies/${allergyId}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to delete allergy")
    }

    showToast("Allergy deleted successfully", "success")
    await loadMedicalRecords(currentPatientId)
  } catch (error) {
    console.error("Error deleting allergy:", error)
    showToast("Failed to delete allergy. Please try again.", "error")
  }
}

window.deleteAllergy = deleteAllergy

function openAddConditionModal() {
  document.getElementById("conditionModalTitle").innerHTML = '<i class="fas fa-heartbeat"></i> Add Condition'
  document.getElementById("conditionForm").reset()
  document.getElementById("conditionId").value = ""
  document.getElementById("conditionModal").classList.remove("hidden")
}

window.openAddConditionModal = openAddConditionModal

function editCondition(condition) {
  document.getElementById("conditionModalTitle").innerHTML = '<i class="fas fa-heartbeat"></i> Edit Condition'
  document.getElementById("conditionId").value = condition.condition_id
  document.getElementById("conditionName").value = condition.condition_name || ""
  document.getElementById("conditionStatus").value = condition.status || "Active"
  document.getElementById("conditionDiagnosedDate").value = condition.diagnosed_date
    ? condition.diagnosed_date.split("T")[0]
    : ""
  document.getElementById("conditionNotes").value = condition.notes || ""
  document.getElementById("conditionModal").classList.remove("hidden")
}

window.editCondition = editCondition

function closeConditionModal() {
  document.getElementById("conditionModal").classList.add("hidden")
}

window.closeConditionModal = closeConditionModal

async function handleConditionSubmit(e) {
  e.preventDefault()

  const conditionId = document.getElementById("conditionId").value
  const data = {
    patient_id: currentPatientId,
    condition_name: document.getElementById("conditionName").value,
    status: document.getElementById("conditionStatus").value,
    diagnosed_date: document.getElementById("conditionDiagnosedDate").value,
    notes: document.getElementById("conditionNotes").value,
  }

  try {
    const url = conditionId
      ? `/api/doctor/patients/${currentPatientId}/conditions/${conditionId}`
      : `/api/doctor/patients/${currentPatientId}/conditions`

    const method = conditionId ? "PUT" : "POST"

    const response = await fetch(url, {
      method: method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to save condition")
    }

    closeConditionModal()
    showToast(conditionId ? "Condition updated successfully" : "Condition added successfully", "success")
    await loadMedicalRecords(currentPatientId)
  } catch (error) {
    console.error("Error saving condition:", error)
    showToast("Failed to save condition. Please try again.", "error")
  }
}

async function deleteCondition(conditionId) {
  if (!confirm("Are you sure you want to delete this condition?")) return

  try {
    const response = await fetch(`/api/doctor/patients/${currentPatientId}/conditions/${conditionId}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to delete condition")
    }

    showToast("Condition deleted successfully", "success")
    await loadMedicalRecords(currentPatientId)
  } catch (error) {
    console.error("Error deleting condition:", error)
    showToast("Failed to delete condition. Please try again.", "error")
  }
}

window.deleteCondition = deleteCondition

function openAddMedicationModal() {
  document.getElementById("medicationModalTitle").innerHTML = '<i class="fas fa-pills"></i> Add Medication'
  document.getElementById("medicationForm").reset()
  document.getElementById("medicationId").value = ""
  document.getElementById("medicationModal").classList.remove("hidden")
  populateMedicationConditions()
}

window.openAddMedicationModal = openAddMedicationModal

function editMedication(medication) {
  document.getElementById("medicationModalTitle").innerHTML = '<i class="fas fa-pills"></i> Edit Medication'
  document.getElementById("medicationId").value = medication.patient_medicine_id
  document.getElementById("medicationName").value = medication.medication_name || ""
  document.getElementById("dosage").value = medication.dosage || ""
  document.getElementById("frequency").value = medication.frequency || ""
  document.getElementById("startDate").value = medication.start_date ? medication.start_date.split("T")[0] : ""
  document.getElementById("medicationStatus").value = medication.status || "Active"
  document.getElementById("medicationNotes").value = medication.notes || ""
  populateMedicationConditions(medication.condition_id)
  document.getElementById("medicationModal").classList.remove("hidden")
}

window.editMedication = editMedication

function populateMedicationConditions(selectedConditionId = null) {
  const select = document.getElementById("medicationCondition")
  select.innerHTML = '<option value="">Select a condition</option>'

  if (!currentPatientData || !currentPatientData.conditions) return

  const conditions = currentPatientData.conditions || []
  conditions.forEach((condition) => {
    const option = document.createElement("option")
    option.value = condition.condition_id
    option.textContent = condition.condition_name
    if (selectedConditionId && condition.condition_id === selectedConditionId) {
      option.selected = true
    }
    select.appendChild(option)
  })
}

function closeMedicationModal() {
  document.getElementById("medicationModal").classList.add("hidden")
}

window.closeMedicationModal = closeMedicationModal

async function handleMedicationSubmit(e) {
  e.preventDefault()

  const medicationId = document.getElementById("medicationId").value
  const data = {
    patient_id: currentPatientId,
    medication_name: document.getElementById("medicationName").value,
    dosage: document.getElementById("dosage").value,
    frequency: document.getElementById("frequency").value,
    start_date: document.getElementById("startDate").value,
    status: document.getElementById("medicationStatus").value,
    notes: document.getElementById("medicationNotes").value,
    condition_id: document.getElementById("medicationCondition").value || null,
  }

  try {
    const url = medicationId
      ? `/api/doctor/patients/${currentPatientId}/medications/${medicationId}`
      : `/api/doctor/patients/${currentPatientId}/medications`

    const method = medicationId ? "PUT" : "POST"

    const response = await fetch(url, {
      method: method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to save medication")
    }

    closeMedicationModal()
    showToast(medicationId ? "Medication updated successfully" : "Medication added successfully", "success")
    await loadMedicalRecords(currentPatientId)
  } catch (error) {
    console.error("Error saving medication:", error)
    showToast("Failed to save medication. Please try again.", "error")
  }
}

function formatDate(dateString) {
  if (!dateString) return "-"

  const date = new Date(dateString)
  const options = { year: "numeric", month: "short", day: "numeric" }
  return date.toLocaleDateString("en-US", options)
}

function escapeHtml(text) {
  if (!text) return ""
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.toString().replace(/[&<>"']/g, (m) => map[m])
}

function showToast(message, type = "info") {
  const toast = document.getElementById("notificationToast")
  const toastMessage = toast.querySelector(".toast-message")

  if (!toast || !toastMessage) return

  toast.classList.remove("success", "error", "info")
  toast.classList.add(type)

  toastMessage.textContent = message

  toast.classList.remove("hidden")

  setTimeout(() => {
    hideToast()
  }, 5000)
}

function hideToast() {
  const toast = document.getElementById("notificationToast")
  if (toast) {
    toast.classList.add("hidden")
  }
}
