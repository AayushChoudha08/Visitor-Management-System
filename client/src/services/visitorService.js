import api from './api';

export const visitorService = {
  getAll: (search = '') => api.get('/visitors', { params: { search } }),
  getById: (id) => api.get(`/visitors/${id}`),
  create: (data) => api.post('/visitors', data),
  update: (id, data) => api.patch(`/visitors/${id}`, data),
};
