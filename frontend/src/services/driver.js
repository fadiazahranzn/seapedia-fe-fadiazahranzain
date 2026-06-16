import api from './api'

export const driverApi = {
  getAvailableJobs: () => api.get('/driver/jobs'),
  getJob: (id) => api.get(`/driver/jobs/${id}`),
  takeJob: (id) => api.patch(`/driver/jobs/${id}/take`),
  completeJob: (id) => api.patch(`/driver/jobs/${id}/complete`),
  getMyJobs: () => api.get('/driver/my-jobs'),
  getActiveJob: () => api.get('/driver/active-job'),
}
