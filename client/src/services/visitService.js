import api from './api';

export const visitService = {
  getAll: (params = {}) => api.get('/visits', { params }),
  getById: (id) => api.get(`/visits/${id}`),
  checkIn: (visitIdOrNull, data = {}) => {
    if (visitIdOrNull) {
      return api.post(`/visits/${visitIdOrNull}/check-in`, data);
    }
    return api.post('/visits/check-in', data);
  },
  checkOut: (visitId, data = {}) => api.post(`/visits/${visitId}/check-out`, data),
};
