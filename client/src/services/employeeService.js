import api from './api';

export const employeeService = {
  getAll: (search = '') => api.get('/employees', { params: { search } }),
  getById: (id) => api.get(`/employees/${id}`),
};
