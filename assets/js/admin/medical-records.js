;(() => {
  let allPatients = []
  let filteredPatients = []
  let currentPatient = null
  let doctors = []

  document.addEventListener("DOMContentLoaded", () => {
    loadMedicalRecords()
    loadDoctors()
    setupEventListeners()
  })

  function setupEventListeners() {
    // Search
    document.getElementById("searchInput").addEventListener("input", filterPatients)

    // Close buttons
    document.querySelectorAll(".close").forEach((btn) => {
      btn.addEventListener("click", function () {
        this.closest(".modal").style.display = "none"
      })
    })

    // Cancel buttons
    document.querySelectorAll(".cancel-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        this.closest(".modal").style.display = "none"
      })
    })

    // Click outside modal
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none"
      }
    })

    // Tab switching
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const tab = this.dataset.tab
        switchTab(tab)
      })
    })

    // Form submissions
    document.getElementById("allergyForm").addEventListener("submit", handleAllergySubmit)
    document.getElementById("conditionForm").addEventListener("submit", handleConditionSubmit)
    document.getElementById("medicationForm").addEventListener("submit", handleMedicationSubmit)
    document.getElementById("reportForm").addEventListener("submit", handleReportSubmit)
  }

  async function loadMedicalRecords() {
    try {
      const response = await fetch("/api/admin/medical-records", {
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to fetch medical records")

      allPatients = await response.json()
      filteredPatients = [...allPatients]
      renderPatientsTable()
    } catch (error) {
      console.error("Error loading medical records:", error)
      alert("Failed to load medical records")
    }
  }

  async function loadDoctors() {
    try {
      const response = await fetch("/api/admin/doctors-list", { credentials: "include" })
      if (!response.ok) throw new Error("Failed to fetch doctors")

      doctors = await response.json()
      populateDoctorDropdown()
    } catch (error) {
      console.error("Error loading doctors:", error)
    }
  }

  function populateDoctorDropdown() {
    const select = document.getElementById("reportDoctor")
    select.innerHTML = '<option value="">Select Doctor</option>'
    doctors.forEach((doctor) => {
      const option = document.createElement("option")
      option.value = doctor.doctor_id
      option.textContent = `${doctor.name} - ${doctor.specialization || "General"}`
      select.appendChild(option)
    })
  }

  function renderPatientsTable() {
    const tbody = document.getElementById("patientsTableBody")
    tbody.innerHTML = ""

    if (filteredPatients.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="9" style="text-align:center; padding:40px; color:#95a5a6;">No patients found</td></tr>'
      return
    }

    filteredPatients.forEach((patient) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>#${patient.patient_id}</td>
        <td>${patient.patient_name}</td>
        <td>${patient.email || "N/A"}</td>
        <td>${patient.phone || "N/A"}</td>
        <td><span class="badge badge-conditions">${patient.total_conditions}</span></td>
        <td><span class="badge badge-allergies">${patient.total_allergies}</span></td>
        <td><span class="badge badge-medications">${patient.total_medications}</span></td>
        <td><span class="badge badge-reports">${patient.total_reports}</span></td>
        <td>
          <button class="table-view-btn" onclick="window.viewPatientRecords(${patient.patient_id})">
            <i class="fas fa-eye"></i> View Records
          </button>
        </td>
      `
      tbody.appendChild(row)
    })
  }

  function filterPatients() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase()
    filteredPatients = allPatients.filter(
      (patient) =>
        patient.patient_name.toLowerCase().includes(searchTerm) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm)),
    )
    renderPatientsTable()
  }

  window.viewPatientRecords = (patientId) => {
    currentPatient = allPatients.find((p) => p.patient_id === patientId)
    if (!currentPatient) return

    // Update patient info
    document.getElementById("modalPatientName").textContent = currentPatient.patient_name
    document.getElementById("patientId").textContent = `#${currentPatient.patient_id}`
    document.getElementById("patientEmail").textContent = currentPatient.email || "N/A"
    document.getElementById("patientPhone").textContent = currentPatient.phone || "N/A"
    document.getElementById("patientDOB").textContent = currentPatient.date_of_birth
      ? new Date(currentPatient.date_of_birth).toLocaleDateString()
      : "N/A"

    // Render all tabs
    renderAllergies()
    renderConditions()
    renderMedications()
    renderReports()

    // Show modal
    document.getElementById("recordsModal").style.display = "block"
  }

  function switchTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
    document.querySelectorAll(".tab-pane").forEach((pane) => pane.classList.remove("active"))

    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")
    document.getElementById(tabName).classList.add("active")
  }

  // ALLERGIES
  function renderAllergies() {
    const list = document.getElementById("allergiesList")
    const allergies = currentPatient.allergies || []

    if (allergies.length === 0) {
      list.innerHTML = '<div class="empty-state"><i class="fas fa-allergies"></i><p>No allergies recorded</p></div>'
      return
    }

    list.innerHTML = allergies
      .map(
        (allergy) => `
      <div class="item-card">
        <div class="item-header">
          <h5 class="item-title">${allergy.allergen}</h5>
          <div class="item-actions">
            <button class="item-edit-btn" onclick="editAllergy(${allergy.allergy_id})">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="item-delete-btn" onclick="deleteAllergy(${allergy.allergy_id})">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
        <div class="item-details">
          <div class="item-detail">
            <span class="detail-label">Reaction</span>
            <span class="detail-value">${allergy.reaction || "Not specified"}</span>
          </div>
          <div class="item-detail">
            <span class="detail-label">Severity</span>
            <span class="severity-badge severity-${allergy.severity.toLowerCase()}">${allergy.severity}</span>
          </div>
          <div class="item-detail">
            <span class="detail-label">Diagnosed Date</span>
            <span class="detail-value">${allergy.diagnosed_date ? new Date(allergy.diagnosed_date).toLocaleDateString() : "N/A"}</span>
          </div>
          <div class="item-detail">
            <span class="detail-label">Status</span>
            <span class="status-badge ${allergy.is_active ? "status-active" : "status-resolved"}">${allergy.is_active ? "Active" : "Inactive"}</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("")
  }

  window.openAddAllergyModal = () => {
    document.getElementById("allergyModalTitle").textContent = "Add Allergy"
    document.getElementById("allergyForm").reset()
    document.getElementById("allergyId").value = ""
    document.getElementById("isActive").checked = true
    document.getElementById("allergyModal").style.display = "block"
  }

  window.editAllergy = (allergyId) => {
    const allergy = currentPatient.allergies.find((a) => a.allergy_id === allergyId)
    if (!allergy) return

    document.getElementById("allergyModalTitle").textContent = "Edit Allergy"
    document.getElementById("allergyId").value = allergy.allergy_id
    document.getElementById("allergen").value = allergy.allergen
    document.getElementById("reaction").value = allergy.reaction || ""
    document.getElementById("severity").value = allergy.severity
    document.getElementById("allergyDiagnosedDate").value = allergy.diagnosed_date
      ? allergy.diagnosed_date.split("T")[0]
      : ""
    document.getElementById("isActive").checked = allergy.is_active
    document.getElementById("allergyModal").style.display = "block"
  }

  async function handleAllergySubmit(e) {
    e.preventDefault()
    const allergyId = document.getElementById("allergyId").value
    const data = {
      patient_id: currentPatient.patient_id,
      allergen: document.getElementById("allergen").value,
      reaction: document.getElementById("reaction").value,
      severity: document.getElementById("severity").value,
      diagnosed_date: document.getElementById("allergyDiagnosedDate").value || null,
      is_active: document.getElementById("isActive").checked,
    }

    try {
      const url = allergyId ? `/api/admin/allergies/${allergyId}` : "/api/admin/allergies"
      const method = allergyId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save allergy")

      alert("Allergy saved successfully!")
      document.getElementById("allergyModal").style.display = "none"
      await loadMedicalRecords()
      window.viewPatientRecords(currentPatient.patient_id)
    } catch (error) {
      console.error("Error saving allergy:", error)
      alert("Error: " + error.message)
    }
  }

  window.deleteAllergy = async (allergyId) => {
    if (!confirm("Are you sure you want to delete this allergy?")) return

    try {
      const response = await fetch(`/api/admin/allergies/${allergyId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to delete allergy")

      alert("Allergy deleted successfully!")
      await loadMedicalRecords()
      window.viewPatientRecords(currentPatient.patient_id)
    } catch (error) {
      console.error("Error deleting allergy:", error)
      alert("Error: " + error.message)
    }
  }

  // CONDITIONS
  function renderConditions() {
    const list = document.getElementById("conditionsList")
    const conditions = currentPatient.conditions || []

    if (conditions.length === 0) {
      list.innerHTML = '<div class="empty-state"><i class="fas fa-stethoscope"></i><p>No conditions recorded</p></div>'
      return
    }

    list.innerHTML = conditions
      .map(
        (condition) => `
      <div class="item-card">
        <div class="item-header">
          <h5 class="item-title">${condition.condition_name}</h5>
          <div class="item-actions">
            <button class="item-edit-btn" onclick="editCondition(${condition.condition_id})">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="item-delete-btn" onclick="deleteCondition(${condition.condition_id})">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
        <div class="item-details">
          <div class="item-detail">
            <span class="detail-label">Diagnosed Date</span>
            <span class="detail-value">${condition.diagnosed_date ? new Date(condition.diagnosed_date).toLocaleDateString() : "N/A"}</span>
          </div>
          <div class="item-detail">
            <span class="detail-label">Status</span>
            <span class="status-badge status-${condition.status.toLowerCase()}">${condition.status}</span>
          </div>
          <div class="item-detail">
            <span class="detail-label">Notes</span>
            <span class="detail-value">${condition.notes || "No notes"}</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("")
  }

  window.openAddConditionModal = () => {
    document.getElementById("conditionModalTitle").textContent = "Add Condition"
    document.getElementById("conditionForm").reset()
    document.getElementById("conditionId").value = ""
    document.getElementById("conditionStatus").value = "Active"
    document.getElementById("conditionModal").style.display = "block"
  }

  window.editCondition = (conditionId) => {
    const condition = currentPatient.conditions.find((c) => c.condition_id === conditionId)
    if (!condition) return

    document.getElementById("conditionModalTitle").textContent = "Edit Condition"
    document.getElementById("conditionId").value = condition.condition_id
    document.getElementById("conditionName").value = condition.condition_name
    document.getElementById("conditionDiagnosedDate").value = condition.diagnosed_date
      ? condition.diagnosed_date.split("T")[0]
      : ""
    document.getElementById("conditionStatus").value = condition.status
    document.getElementById("conditionNotes").value = condition.notes || ""
    document.getElementById("conditionModal").style.display = "block"
  }

  async function handleConditionSubmit(e) {
    e.preventDefault()
    const conditionId = document.getElementById("conditionId").value
    const data = {
      patient_id: currentPatient.patient_id,
      condition_name: document.getElementById("conditionName").value,
      diagnosed_date: document.getElementById("conditionDiagnosedDate").value || null,
      status: document.getElementById("conditionStatus").value,
      notes: document.getElementById("conditionNotes").value,
    }

    try {
      const url = conditionId ? `/api/admin/conditions/${conditionId}` : "/api/admin/conditions"
      const method = conditionId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save condition")

      alert("Condition saved successfully!")
      document.getElementById("conditionModal").style.display = "none"
      await loadMedicalRecords()
      window.viewPatientRecords(currentPatient.patient_id)
    } catch (error) {
      console.error("Error saving condition:", error)
      alert("Error: " + error.message)
    }
  }

  window.deleteCondition = async (conditionId) => {
    if (!confirm("Are you sure you want to delete this condition?")) return

    try {
      const response = await fetch(`/api/admin/conditions/${conditionId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to delete condition")

      alert("Condition deleted successfully!")
      await loadMedicalRecords()
      window.viewPatientRecords(currentPatient.patient_id)
    } catch (error) {
      console.error("Error deleting condition:", error)
      alert("Error: " + error.message)
    }
  }

  // MEDICATIONS
  function renderMedications() {
    const list = document.getElementById("medicationsList")
    const medications = currentPatient.medications || []

    if (medications.length === 0) {
      list.innerHTML = '<div class="empty-state"><i class="fas fa-pills"></i><p>No medications recorded</p></div>'
      return
    }

    list.innerHTML = medications
      .map(
        (med) => `
      <div class="item-card">
        <div class="item-header">
          <h5 class="item-title">${med.medication_name}</h5>
          <div class="item-actions">
            <button class="item-edit-btn" onclick="editMedication(${med.patient_medicine_id})">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="item-delete-btn" onclick="deleteMedication(${med.patient_medicine_id})">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
        <div class="item-details">
          <div class="item-detail">
            <span class="detail-label">Dosage</span>
            <span class="detail-value">${med.dosage || "N/A"}</span>
          </div>
          <div class="item-detail">
            <span class="detail-label">Frequency</span>
            <span class="detail-value">${med.frequency || "N/A"}</span>
          </div>
          <div class="item-detail">
            <span class="detail-label">Start Date</span>
            <span class="detail-value">${med.start_date ? new Date(med.start_date).toLocaleDateString() : "N/A"}</span>
          </div>
          <div class="item-detail">
            <span class="detail-label">Status</span>
            <span class="status-badge status-${med.status.toLowerCase()}">${med.status}</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("")
  }

  window.openAddMedicationModal = () => {
    document.getElementById("medicationModalTitle").textContent = "Add Medication"
    document.getElementById("medicationForm").reset()
    document.getElementById("medicationId").value = ""
    document.getElementById("medicationStatus").value = "Active"
    populateMedicationConditions()
    document.getElementById("medicationModal").style.display = "block"
  }

  window.editMedication = (medicationId) => {
    const med = currentPatient.medications.find((m) => m.patient_medicine_id === medicationId)
    if (!med) return

    document.getElementById("medicationModalTitle").textContent = "Edit Medication"
    document.getElementById("medicationId").value = med.patient_medicine_id
    document.getElementById("medicationName").value = med.medication_name
    document.getElementById("dosage").value = med.dosage || ""
    document.getElementById("frequency").value = med.frequency || ""
    document.getElementById("startDate").value = med.start_date ? med.start_date.split("T")[0] : ""
    document.getElementById("medicationStatus").value = med.status
    populateMedicationConditions(med.condition_id)
    document.getElementById("medicationModal").style.display = "block"
  }

  function populateMedicationConditions(selectedConditionId = null) {
    const select = document.getElementById("medicationCondition")
    select.innerHTML = '<option value="">Select a condition</option>'

    const conditions = currentPatient.conditions || []
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

  async function handleMedicationSubmit(e) {
    e.preventDefault()
    const medicationId = document.getElementById("medicationId").value
    const data = {
      patient_id: currentPatient.patient_id,
      medication_name: document.getElementById("medicationName").value,
      dosage: document.getElementById("dosage").value,
      frequency: document.getElementById("frequency").value,
      start_date: document.getElementById("startDate").value || null,
      status: document.getElementById("medicationStatus").value,
      condition_id: document.getElementById("medicationCondition").value || null,
    }

    try {
      const url = medicationId ? `/api/admin/medications/${medicationId}` : "/api/admin/medications"
      const method = medicationId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save medication")

      alert("Medication saved successfully!")
      document.getElementById("medicationModal").style.display = "none"
      await loadMedicalRecords()
      window.viewPatientRecords(currentPatient.patient_id)
    } catch (error) {
      console.error("Error saving medication:", error)
      alert("Error: " + error.message)
    }
  }

  window.deleteMedication = async (medicationId) => {
    if (!confirm("Are you sure you want to delete this medication?")) return

    try {
      const response = await fetch(`/api/admin/medications/${medicationId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to delete medication")

      alert("Medication deleted successfully!")
      await loadMedicalRecords()
      window.viewPatientRecords(currentPatient.patient_id)
    } catch (error) {
      console.error("Error deleting medication:", error)
      alert("Error: " + error.message)
    }
  }

  // REPORTS
  function renderReports() {
    const list = document.getElementById("reportsList")
    const reports = currentPatient.reports || []

    if (reports.length === 0) {
      list.innerHTML = '<div class="empty-state"><i class="fas fa-file-medical"></i><p>No reports recorded</p></div>'
      return
    }

    list.innerHTML = reports
      .map(
        (report) => `
      <div class="item-card">
        <div class="item-header">
          <h5 class="item-title">${report.report_type} - ${report.doctor_name || "Unknown Doctor"}</h5>
          <div class="item-actions">
            <button class="item-edit-btn" onclick="editReport(${report.report_id})">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="item-delete-btn" onclick="deleteReport(${report.report_id})">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
        <div class="item-details">
          <div class="item-detail">
            <span class="detail-label">Report Date</span>
            <span class="detail-value">${new Date(report.report_date).toLocaleDateString()}</span>
          </div>
          <div class="item-detail">
            <span class="detail-label">Diagnosis</span>
            <span class="detail-value">${report.diagnosis}</span>
          </div>
          <div class="item-detail">
            <span class="detail-label">Treatment Plan</span>
            <span class="detail-value">${report.treatment_plan || "N/A"}</span>
          </div>
          <div class="item-detail">
            <span class="detail-label">Follow-up Date</span>
            <span class="detail-value">${report.followup_date ? new Date(report.followup_date).toLocaleDateString() : "Not scheduled"}</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("")
  }

  window.openAddReportModal = () => {
    document.getElementById("reportModalTitle").textContent = "Add Medical Report"
    document.getElementById("reportForm").reset()
    document.getElementById("reportId").value = ""
    document.getElementById("reportDate").valueAsDate = new Date()
    document.getElementById("reportModal").style.display = "block"
  }

  window.editReport = (reportId) => {
    const report = currentPatient.reports.find((r) => r.report_id === reportId)
    if (!report) return

    document.getElementById("reportModalTitle").textContent = "Edit Medical Report"
    document.getElementById("reportId").value = report.report_id
    document.getElementById("reportDoctor").value = report.doctor_id || ""
    document.getElementById("reportType").value = report.report_type
    document.getElementById("reportDate").value = report.report_date ? report.report_date.split("T")[0] : ""
    document.getElementById("diagnosis").value = report.diagnosis
    document.getElementById("testsRecommended").value = report.tests_recommended || ""
    document.getElementById("treatmentPlan").value = report.treatment_plan || ""
    document.getElementById("followupDate").value = report.followup_date ? report.followup_date.split("T")[0] : ""
    document.getElementById("reportNotes").value = report.notes || ""
    document.getElementById("reportModal").style.display = "block"
  }

  async function handleReportSubmit(e) {
    e.preventDefault()
    const reportId = document.getElementById("reportId").value
    const data = {
      patient_id: currentPatient.patient_id,
      doctor_id: document.getElementById("reportDoctor").value,
      report_type: document.getElementById("reportType").value,
      report_date: document.getElementById("reportDate").value,
      diagnosis: document.getElementById("diagnosis").value,
      symptoms: document.getElementById("testsRecommended").value,
      treatment_plan: document.getElementById("treatmentPlan").value,
      follow_up_date: document.getElementById("followupDate").value || null,
      notes: document.getElementById("reportNotes").value,
    }

    try {
      const url = reportId ? `/api/admin/medical-records/${reportId}` : "/api/admin/medical-records"
      const method = reportId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save report")

      alert("Report saved successfully!")
      document.getElementById("reportModal").style.display = "none"
      await loadMedicalRecords()
      window.viewPatientRecords(currentPatient.patient_id)
    } catch (error) {
      console.error("Error saving report:", error)
      alert("Error: " + error.message)
    }
  }

  window.deleteReport = async (reportId) => {
    if (!confirm("Are you sure you want to delete this report?")) return

    try {
      const response = await fetch(`/api/admin/medical-records/${reportId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to delete report")

      alert("Report deleted successfully!")
      await loadMedicalRecords()
      window.viewPatientRecords(currentPatient.patient_id)
    } catch (error) {
      console.error("Error deleting report:", error)
      alert("Error: " + error.message)
    }
  }
})()
