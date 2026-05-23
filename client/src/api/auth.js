import api from './axios';

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const register = (data) =>
  api.post('/auth/register', data);

export const getMe = () =>
  api.get('/auth/me');

export const updateMe = (data) =>
  api.patch('/auth/me', data);

export const getSeekerProfile = () =>
  api.get('/auth/me/seeker-profile');

export const updateSeekerProfile = (data) =>
  api.patch('/auth/me/seeker-profile', data);
