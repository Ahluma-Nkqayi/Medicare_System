let patients = []
let doctors = []
let bookings = []
let filteredBookings = []
let currentEditingId = null

document.addEventListener("DOMContentLoaded", () => {
  loadPatients()
  loadDoctors()
  loadBookings()
  setupEventListeners()
})

function loadPatients() {
  fetch("/api/admin/patients", {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      patients = data
      populatePatientDropdowns()
    })
    .catch((err) => console.error("Error loading patients:", err))
}

function loadDoctors() {
  fetch("/api/admin/doctors", {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      doctors = data
      populateDoctorDropdowns()
    })
    .catch((err) => console.error("Error loading doctors:", err))
}

function loadBookings() {
  fetch("/api/admin/bookings", {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      bookings = data
      filteredBookings = data
      renderBookingsTable()
    })
    .catch((err) => console.error("Error loading bookings:", err))
}

function populatePatientDropdowns() {
  const addSelect = document.getElementById("addPatient")
  const editSelect = document.getElementById("editPatient")

  addSelect.innerHTML = '<option value="">Select Patient</option>'
  editSelect.innerHTML = '<option value="">Select Patient</option>'

  patients.forEach((patient) => {
    const addOption = document.createElement("option")
    addOption.value = patient.patient_id
    addOption.textContent = patient.name
    addSelect.appendChild(addOption)

    const editOption = document.createElement("option")
    editOption.value = patient.patient_id
    editOption.textContent = patient.name
    editSelect.appendChild(editOption)
  })
}

function populateDoctorDropdowns() {
  const addSelect = document.getElementById("addDoctor")
  const editSelect = document.getElementById("editDoctor")

  addSelect.innerHTML = '<option value="">Select Doctor</option>'
  editSelect.innerHTML = '<option value="">Select Doctor</option>'

  doctors.forEach((doctor) => {
    const addOption = document.createElement("option")
    addOption.value = doctor.doctor_id
    addOption.textContent = doctor.name
    addSelect.appendChild(addOption)

    const editOption = document.createElement("option")
    editOption.value = doctor.doctor_id
    editOption.textContent = doctor.name
    editSelect.appendChild(editOption)
  })
}

function renderBookingsTable() {
  const tbody = document.getElementById("bookingsTableBody")
  tbody.innerHTML = ""

  if (filteredBookings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-table">
          <i class="fas fa-calendar-times"></i>
          <p>No bookings found</p>
        </td>
      </tr>
    `
    return
  }

  filteredBookings.forEach((booking) => {
    const row = document.createElement("tr")

    // Format date
    const date = new Date(booking.booking_date)
    const formattedDate = date.toLocaleDateString("en-GB")

    // Format time
    const time = booking.booking_time ? booking.booking_time.substring(0, 5) : "N/A"

    // Get status class
    const statusClass = `status-${booking.status.replace(/\s+/g, "-")}`

    row.innerHTML = `
      <td>#${booking.booking_id}</td>
      <td>${booking.patient_name || "N/A"}</td>
      <td>${booking.doctor_name || "N/A"}</td>
      <td>${formattedDate}</td>
      <td>${time}</td>
      <td>${booking.reason_for_visit || "N/A"}</td>
      <td><span class="table-status ${statusClass}">${booking.status}</span></td>
      <td>
        <div class="table-actions">
          <button class="table-edit-btn" onclick="openEditModal(${booking.booking_id})">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="table-delete-btn" onclick="deleteBooking(${booking.booking_id})">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </td>
    `

    tbody.appendChild(row)
  })
}

function filterBookings() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()
  const statusFilter = document.getElementById("statusFilter").value

  filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      (booking.patient_name && booking.patient_name.toLowerCase().includes(searchTerm)) ||
      (booking.doctor_name && booking.doctor_name.toLowerCase().includes(searchTerm)) ||
      (booking.reason_for_visit && booking.reason_for_visit.toLowerCase().includes(searchTerm))

    const matchesStatus = !statusFilter || booking.status === statusFilter

    return matchesSearch && matchesStatus
  })

  renderBookingsTable()
}

function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("input", filterBookings)
  }

  // Status filter
  const statusFilter = document.getElementById("statusFilter")
  if (statusFilter) {
    statusFilter.addEventListener("change", filterBookings)
  }

  // Modal controls
  setupModalControls()

  // Form submissions
  document.getElementById("addForm").addEventListener("submit", handleAddBooking)
  document.getElementById("editForm").addEventListener("submit", handleEditBooking)
}

function setupModalControls() {
  const addModal = document.getElementById("addModal")
  const editModal = document.getElementById("editModal")

  // Close buttons
  const closeButtons = document.querySelectorAll(".close")
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      addModal.style.display = "none"
      editModal.style.display = "none"
    })
  })

  // Cancel buttons
  const cancelButtons = document.querySelectorAll(".cancel-btn")
  cancelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      addModal.style.display = "none"
      editModal.style.display = "none"
    })
  })

  // Click outside modal
  window.addEventListener("click", (event) => {
    if (event.target === addModal) {
      addModal.style.display = "none"
    }
    if (event.target === editModal) {
      editModal.style.display = "none"
    }
  })
}

function openAddModal() {
  document.getElementById("addForm").reset()
  document.getElementById("addModal").style.display = "block"
}

function openEditModal(bookingId) {
  const booking = bookings.find((b) => b.booking_id === bookingId)
  if (!booking) return

  currentEditingId = bookingId

  // Format date for input (YYYY-MM-DD)
  const date = new Date(booking.booking_date)
  const formattedDate = date.toISOString().split("T")[0]

  document.getElementById("editPatient").value = booking.patient_id
  document.getElementById("editDoctor").value = booking.doctor_id
  document.getElementById("editBookingDate").value = formattedDate
  document.getElementById("editBookingTime").value = booking.booking_time
  document.getElementById("editDuration").value = booking.duration || "30"
  document.getElementById("editReason").value = booking.reason_for_visit || ""
  document.getElementById("editStatus").value = booking.status

  document.getElementById("editModal").style.display = "block"
}

function handleAddBooking(e) {
  e.preventDefault()

  const bookingTime = document.getElementById("addBookingTime").value
  const duration = Number.parseInt(document.getElementById("addDuration").value)

  const [hours, minutes] = bookingTime.split(":")
  let endHour = Number.parseInt(hours)
  let endMin = Number.parseInt(minutes) + duration
  if (endMin >= 60) {
    endHour += Math.floor(endMin / 60)
    endMin = endMin % 60
  }
  const end_time = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}:00`

  const formData = {
    patient_id: document.getElementById("addPatient").value,
    doctor_id: document.getElementById("addDoctor").value,
    booking_date: document.getElementById("addBookingDate").value,
    booking_time: document.getElementById("addBookingTime").value,
    end_time: end_time,
    reason_for_visit: document.getElementById("addReason").value,
    payment_method: "Cash",
  }

  fetch("/api/admin/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        alert("Error: " + data.error)
      } else {
        alert("Booking added successfully!")
        document.getElementById("addModal").style.display = "none"
        loadBookings()
      }
    })
    .catch((err) => {
      console.error("Error adding booking:", err)
      alert("Failed to add booking")
    })
}

function handleEditBooking(e) {
  e.preventDefault()

  const bookingTime = document.getElementById("editBookingTime").value
  const duration = Number.parseInt(document.getElementById("editDuration").value)

  const [hours, minutes] = bookingTime.split(":")
  let endHour = Number.parseInt(hours)
  let endMin = Number.parseInt(minutes) + duration
  if (endMin >= 60) {
    endHour += Math.floor(endMin / 60)
    endMin = endMin % 60
  }
  const end_time = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}:00`

  const formData = {
    patient_id: document.getElementById("editPatient").value,
    doctor_id: document.getElementById("editDoctor").value,
    booking_date: document.getElementById("editBookingDate").value,
    booking_time: document.getElementById("editBookingTime").value,
    end_time: end_time,
    reason_for_visit: document.getElementById("editReason").value,
    status: document.getElementById("editStatus").value,
    payment_method: "Cash",
  }

  fetch(`/api/admin/bookings/${currentEditingId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        alert("Error: " + data.error)
      } else {
        alert("Booking updated successfully!")
        document.getElementById("editModal").style.display = "none"
        loadBookings()
      }
    })
    .catch((err) => {
      console.error("Error updating booking:", err)
      alert("Failed to update booking")
    })
}

function deleteBooking(bookingId) {
  if (!confirm("Are you sure you want to delete this booking?")) {
    return
  }

  fetch(`/api/admin/bookings/${bookingId}`, {
    method: "DELETE",
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        alert("Error: " + data.error)
      } else {
        alert("Booking deleted successfully!")
        loadBookings()
      }
    })
    .catch((err) => {
      console.error("Error deleting booking:", err)
      alert("Failed to delete booking")
    })
}
