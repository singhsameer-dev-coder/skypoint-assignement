import api from './axios';

export const getJobs = (params) =>
  api.get('/jobs', { params });

export const getJob = (id) =>
  api.get(`/jobs/${id}`);

export const createJob = (data) =>
  api.post('/jobs', data);

export const updateJob = (id, data) =>
  api.patch(`/jobs/${id}`, data);

export const deleteJob = (id) =>
  api.delete(`/jobs/${id}`);

export const getMyJobs = () =>
  api.get('/jobs/my-jobs');

export const applyToJob = (id, data) =>
  api.post(`/jobs/${id}/apply`, data);

export const getJobApplications = (jobId) =>
  api.get(`/jobs/${jobId}/applications`);

export const updateApplication = (id, data) =>
  api.patch(`/jobs/applications/${id}`, data);

export const withdrawApplication = (id) =>
  api.delete(`/jobs/applications/${id}`);

export const getMyApplications = () =>
  api.get('/jobs/my-applications');

export const saveJob = (id) =>
  api.post(`/jobs/${id}/save`);

export const unsaveJob = (id) =>
  api.delete(`/jobs/${id}/save`);

export const getSavedJobs = () =>
  api.get('/jobs/saved');

export const getSkills = () =>
  api.get('/skills');

export const getCategories = () =>
  api.get('/categories');
