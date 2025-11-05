const API_BASE_URL = window.location.origin;

async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', 
    };

    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (response.status === 401) {
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }

        if (response.status === 404) {
            throw new Error('Resource not found');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

const DoctorAPI = {
    getDashboard: () => apiRequest('/api/doctor/dashboard'),

    getAppointments: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/api/doctor/appointments${queryString ? '?' + queryString : ''}`);
    },

    getAppointmentById: (id) => apiRequest(`/api/doctor/appointments/${id}`),

    updateAppointmentStatus: (id, status) =>
        apiRequest(`/api/doctor/appointments/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),

    getSchedule: (startDate, endDate) => {
        const params = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/api/doctor/schedule${queryString ? '?' + queryString : ''}`);
    },

    getPatients: () => apiRequest('/api/doctor/patients'),

    getPatientMedicalRecords: (patientId) =>
        apiRequest(`/api/doctor/patients/${patientId}/medical-records`),

    getPatientPrescriptions: (patientId) =>
        apiRequest(`/api/doctor/patients/${patientId}/prescriptions`),

    getProfile: () => apiRequest('/api/doctor/profile'),

    updateProfile: (profileData) =>
        apiRequest('/api/doctor/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        }),

    updatePassword: (passwordData) =>
        apiRequest('/api/doctor/profile/password', {
            method: 'PUT',
            body: JSON.stringify(passwordData),
        }),
};

const AuthAPI = {
    login: (credentials) =>
        apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),

    register: (userData) =>
        apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

    logout: () =>
        apiRequest('/api/auth/logout', {
            method: 'POST',
        }),

    getCurrentUser: () => apiRequest('/api/auth/me'),
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DoctorAPI, AuthAPI, apiRequest };
}
