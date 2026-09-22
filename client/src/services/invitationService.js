import api from './api';

export const invitationService = {
  getAll: (params = {}) => api.get('/invitations', { params }),
  getById: (id) => api.get(`/invitations/${id}`),
  create: (data) => api.post('/invitations', data),
  approve: (id, data = {}) => api.patch(`/invitations/${id}/approve`, data),
  reject: (id, data = {}) => api.patch(`/invitations/${id}/reject`, data),
  preApprove: (data) => api.post('/invitations/pre-approve', data),
};
