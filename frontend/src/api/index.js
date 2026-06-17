import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
//  const token = localStorage.getItem('placify_token');
const token = sessionStorage.getItem('placify_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
//      localStorage.removeItem('placify_token');
//      localStorage.removeItem('placify_user');
        sessionStorage.removeItem('placify_token');
        sessionStorage.removeItem('placify_user');
      window.location.replace('/login');
    }
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;

// ── Auth ────────────────────────────────────────────
export const login = (body) => api.post('/auth/login', body);
export const register = (body) => api.post('/auth/register', body);
export const getMe = () => api.get('/auth/me');

// ── Companies ────────────────────────────────────────
export const getCompanies = () => api.get('/companies');
export const createCompany = (body) => api.post('/companies', body);

// ── Jobs ────────────────────────────────────────────
export const getJobs = (params) => api.get('/jobs', { params });
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const createJob = (body) => api.post('/jobs', body);
export const updateJob = (id, body) => api.put(`/jobs/${id}`, body);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
export const toggleJobActive = (id) => api.patch(`/jobs/${id}/toggle`);

// ── Applications ─────────────────────────────────────
export const getMyApplications = () => api.get('/applications/my');
export const getAllApplications = () => api.get('/applications');
export const getApplicationsByJob = (jobId) => api.get(`/applications/job/${jobId}`);
export const createApplication = (body) => api.post('/applications', body);
export const updateApplicationStatus = (id, status) =>
  api.patch(`/applications/${id}/status`, { status });

// ── Student ──────────────────────────────────────────
export const getMyStudentProfile = () => api.get('/students/me');
export const updateMyStudentProfile = (body) => api.put('/students/me', body);
export const uploadResume = (formData) =>
  api.post('/students/me/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getSavedJobIds = () => api.get('/students/me/saved-jobs/ids');
export const getSavedJobs = () => api.get('/students/me/saved-jobs');
export const saveJob = (jobId) => api.post(`/students/me/saved-jobs/${jobId}`);
export const unsaveJob = (jobId) => api.delete(`/students/me/saved-jobs/${jobId}`);

// ── Recruiter ────────────────────────────────────────
export const getMyRecruiterProfile = () => api.get('/recruiters/me');
export const updateMyRecruiterProfile = (body) => api.put('/recruiters/me', body);

// ── Notifications ────────────────────────────────────
export const getNotifications = () => api.get('/notifications');
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markAllRead = () => api.patch('/notifications/read-all');

// ── Admin ─────────────────────────────────────────────
export const getAdminStats = () => api.get('/admin/stats');
export const getPendingRecruiters = () =>
  api.get('/admin/recruiters/pending');

export const approveRecruiter = (id) =>
  api.put(`/admin/recruiters/${id}/approve`);

export const rejectRecruiter = (id) =>
  api.put(`/admin/recruiters/${id}/reject`);

// ── Password reset ────────────────────────────────────
export const forgotPassword = (body) => api.post('/auth/forgot-password', body);
export const resetPassword = (body) => api.post('/auth/reset-password', body);

//--otp--
export const verifyOtp = (body) => api.post('/auth/verify-otp', body);
export const resendOtp = (email) => api.post('/auth/resend-otp', { email });
