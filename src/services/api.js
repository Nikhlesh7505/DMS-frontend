

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
// const API_URL = import.meta.env.VITE_API_URL || 'https://nikhil-dms-backend.onrender.com/api'



const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// ── Request interceptor — attach JWT token ────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — handle 401 ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth API ──────────────────────────────────────────────────────
export const authAPI = {
  login:          (email, password) => api.post('/auth/login', { email, password }),
  register:       (data)            => api.post('/auth/register', data),
  sendOtp:        (data)            => api.post('/auth/send-otp', data),
  getMe:          ()                => api.get('/auth/me'),
  updatePassword: (data)            => api.put('/auth/password', data),
  logout:         ()                => api.post('/auth/logout'),
}

// ── User API ──────────────────────────────────────────────────────
export const userAPI = {
  // FIXED: added getAll alias (component calls userAPI.getAll())
  getAll:               (params)       => api.get('/users', { params }),
  getUsers:             (params)       => api.get('/users', { params }), // keep old name too
  getUser:              (id)           => api.get(`/users/${id}`),
  updateProfile:        (data)         => api.put('/users/profile', data),
  update:               (id, data)     => api.put(`/users/${id}`, data),
  getPendingApprovals:  ()             => api.get('/users/pending-approvals'),
  approveUser:          (id, data)     => api.put(`/users/${id}/approve`, data),
  deactivate:           (id)           => api.put(`/users/${id}/deactivate`),
  getAvailableRescueTeams: (params)    => api.get('/users/rescue-teams/available', { params }),
  getNearbyVolunteers: (params)        => api.get('/users/volunteers/nearby', { params }),
  getByRole:            (role, params) => api.get(`/users/by-role/${role}`, { params }),
  deleteUser:           (id)           => api.delete(`/users/${id}`),
}

// ── Alert API — FIXED: added all missing methods ──────────────────
export const alertAPI = {
  // Fetch alerts — supports ?forUser=ID, ?sentByAdmin=true, filters
  getAll:         (params)     => api.get('/alerts', { params }),

  // Specific named routes (must match backend route order)
  getActive:      ()           => api.get('/alerts/active'),
  getCritical:    ()           => api.get('/alerts/critical'),
  getMyAlerts:    ()           => api.get('/alerts/my-alerts'),
  getUnreadCount: ()           => api.get('/alerts/unread-count'),
  getStatistics:  ()           => api.get('/alerts/statistics/overview'),
  markRead:       (id)         => api.patch(`/alerts/${id}/read`),

  // Single alert
  getById:        (id)         => api.get(`/alerts/${id}`),

  // FIXED: added create — admin broadcasts alert to users
  create:         (data)       => api.post('/alerts', data),

  // FIXED: added update + patch — mark alert as read
  update:         (id, data)   => api.put(`/alerts/${id}`, data),
  patch:          (id, data)   => api.patch(`/alerts/${id}`, data),

  // Alert lifecycle
  acknowledge:    (id, data)   => api.put(`/alerts/${id}/acknowledge`, data),
  resolve:        (id)         => api.put(`/alerts/${id}/resolve`),
  cancel:         (id, data)   => api.put(`/alerts/${id}/cancel`, data),
  cleanupDuplicates: (data)    => api.post('/alerts/cleanup-duplicates', data),
  delete:         (id)         => api.delete(`/alerts/${id}`),
  
}

export const notificationAPI = {
  getMine:        (params)     => api.get('/notifications/my', { params }),
  getUnreadCount: ()           => api.get('/notifications/unread-count'),
  markRead:       (id)         => api.patch(`/notifications/${id}/read`),
  markAllRead:    ()           => api.patch('/notifications/read-all'),
}

export const shelterAPI = {
  getAll:         (params)     => api.get('/shelters', { params }),
  getNearby:      (params)     => api.get('/shelters/nearby', { params }),
  getById:        (id)         => api.get(`/shelters/${id}`),
  create:         (data)       => api.post('/shelters', data),
  update:         (id, data)   => api.put(`/shelters/${id}`, data),
  delete:         (id)         => api.delete(`/shelters/${id}`),
}

// ── Weather API ───────────────────────────────────────────────────
export const weatherAPI = {
  getCurrent:   (params)        => api.get('/weather/current', { params }),
  getAll:       ()              => api.get('/weather/all'),
  getHistory:   (city, hours)   => api.get(`/weather/history/${city}`, { params: { hours } }),
  getCities:    ()              => api.get('/weather/cities'),
  getExtreme:   ()              => api.get('/weather/extreme'),
  getStatistics: ()             => api.get('/weather/statistics'),
}

// ── Disaster API ──────────────────────────────────────────────────
export const disasterAPI = {
  getAll:       (params)        => api.get('/disasters', { params }),
  getActive:    ()              => api.get('/disasters/active'),
  getById:      (id)            => api.get(`/disasters/${id}`),
  create:       (data)          => api.post('/disasters', data),
  update:       (id, data)      => api.put(`/disasters/${id}`, data),
  updateStatus: (id, status)    => api.put(`/disasters/${id}/status`, { status }),
  addUpdate:    (id, data)      => api.post(`/disasters/${id}/updates`, data),
  getStatistics: ()             => api.get('/disasters/statistics/overview'),
}

export const donationAPI = {
  create:           (data)          => api.post('/donations', data),
  getMy:            (params = {})   => api.get('/donations/my', { params }),
  getAll:           (params = {})   => api.get('/donations', { params }),
  getPending:       ()              => api.get('/donations/pending'),
  getFlagged:       ()              => api.get('/donations', { params: { flagged: true } }),
  getById:          (id)            => api.get(`/donations/${id}`),
  update:           (id, data)      => api.put(`/donations/${id}`, data),
  updateStatus:     (id, status, notes) => api.patch(`/donations/${id}/status`, { status, notes }),
  accept:           (id)            => api.post(`/donations/${id}/accept`),
  assignVolunteer:  (id, data)      => api.post(`/donations/${id}/assign-volunteer`, data),
  cancelAcceptance: (id)            => api.post(`/donations/${id}/cancel-acceptance`),
  getVolunteerTasks: (params)       => api.get('/donations/volunteer-tasks', { params }),
  respondToTask:    (id, action, feedback) => api.patch(`/donations/${id}/respond-task`, { action, feedback }),
  completeTask:     (id)            => api.patch(`/donations/${id}/complete-task`),
  adminDelete:      (id, feedback)  => api.delete(`/donations/${id}/admin`, { data: { feedback } }),
  delete:           (id)            => api.delete(`/donations/${id}`),
}
// ── Emergency Request API ─────────────────────────────────────────
export const emergencyAPI = {
  getAll:        (params)              => api.get('/emergency', { params }),
  getPending:    ()                    => api.get('/emergency/pending'),
  getById:       (id)                  => api.get(`/emergency/${id}`),
  create:        (data)                => api.post('/emergency', data),
  acknowledge:   (id)                  => api.put(`/emergency/${id}/acknowledge`),
  deleteMine:    (id)                  => api.delete(`/emergency/${id}`),
  cancel:        (id)                  => api.put(`/emergency/${id}/cancel`),
  delete:        (id)                  => api.delete(`/emergency/${id}`),
  updateStatus:  (id, status, note)    => api.put(`/emergency/${id}/status`, { status, note }),
  assign:        (id, data)            => api.put(`/emergency/${id}/assign`, data),
  resolve:       (id, data)            => api.put(`/emergency/${id}/resolve`, data),
  getMyRequests: ()                    => api.get('/emergency/my-requests'),
  getAssigned:   ()                    => api.get('/emergency/assigned-to-me'),
  getStatistics: ()                    => api.get('/emergency/statistics/overview'),
}

// ── Resource API ──────────────────────────────────────────────────
export const resourceAPI = {
  getAll:        (params)                  => api.get('/resources', { params }),
  getById:       (id)                      => api.get(`/resources/${id}`),
  create:        (data)                    => api.post('/resources', data),
  update:        (id, data)                => api.put(`/resources/${id}`, data),
  allocate:      (id, quantity, disasterId) => api.post(`/resources/${id}/allocate`, { quantity, disasterId }),
  getMyResources: ()                       => api.get('/resources/my-resources'),
  getAvailable:  (category, city)          => api.get(`/resources/available/${category}`, { params: { city } }),
  getLowStock:   ()                        => api.get('/resources/low-stock'),
  getStatistics: ()                        => api.get('/resources/statistics/overview'),
}

// ── Rescue Task API ───────────────────────────────────────────────
export const taskAPI = {
  getAll:        (params)               => api.get('/rescue-tasks', { params }),
  getActive:     ()                     => api.get('/rescue-tasks/active'),
  getById:       (id)                   => api.get(`/rescue-tasks/${id}`),
  create:        (data)                 => api.post('/rescue-tasks', data),
  update:        (id, data)             => api.put(`/rescue-tasks/${id}`, data),
  updateStatus:  (id, status, note)     => api.put(`/rescue-tasks/${id}/status`, { status, note }),
  addProgress:   (id, percentage, note) => api.post(`/rescue-tasks/${id}/progress`, { percentage, note }),
  complete:      (id, outcome, summary) => api.put(`/rescue-tasks/${id}/complete`, { outcome, summary }),
  getMyTasks:    ()                     => api.get('/rescue-tasks/my-tasks'),
  getPending:    ()                     => api.get('/rescue-tasks/pending-for-me'),
  getByDisaster: (disasterId)           => api.get(`/rescue-tasks/disaster/${disasterId}`),
  getStatistics: ()                     => api.get('/rescue-tasks/statistics/overview'),
}

// ── Dashboard API ─────────────────────────────────────────────────
export const dashboardAPI = {
  getPublic:    () => api.get('/dashboard/public'),
  getAdmin:     () => api.get('/dashboard/admin'),
  getResponder: () => api.get('/dashboard/responder'),
  getCitizen:   () => api.get('/dashboard/citizen'),
  getAnalytics: () => api.get('/dashboard/analytics'),
  getMapData:   () => api.get('/dashboard/map-data'),
}

export const utilsAPI = {
  getCountries: () => api.get('/utils/geo/countries'),
  getStates: (country) => api.post('/utils/geo/states', { country }),
  getCities: (country, state) => api.post('/utils/geo/cities', { country, state }),
}

export default api
