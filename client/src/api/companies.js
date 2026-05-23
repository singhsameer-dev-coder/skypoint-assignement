import api from './axios';

export const createCompany = (data) =>
  api.post('/companies', data);

export const getCompanies = () =>
  api.get('/companies');

export const getCompany = (id) =>
  api.get(`/companies/${id}`);

export const updateCompany = (id, data) =>
  api.patch(`/companies/${id}`, data);

export const getMyCompanies = () =>
  api.get('/companies/my/companies');
