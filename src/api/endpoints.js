/**
 * Типизированные обёртки над api-клиентом — чтобы компоненты не знали
 * деталей путей и формата запросов.
 */
import api, { ensureCsrf } from './client';

// --- Auth ------------------------------------------------------------------

export async function login(username, password) {
  await ensureCsrf();
  const { data } = await api.post('/auth/login/', { username, password });
  return data.user;
}

export async function register(username, email, password) {
  await ensureCsrf();
  const { data } = await api.post('/auth/register/', { username, email, password });
  return data;
}

export async function logout() {
  await ensureCsrf();
  await api.post('/auth/logout/');
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/auth/me/');
  return data;
}

// --- Profile ---------------------------------------------------------------

export async function getProfile() {
  const { data } = await api.get('/profile/me/');
  return data;
}

export async function updateProfile(patch) {
  const { data } = await api.patch('/profile/me/', patch);
  return data;
}

export async function changePassword(oldPassword, newPassword) {
  await ensureCsrf();
  const { data } = await api.post('/profile/change_password/', {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return data;
}

export async function deleteAccount(password) {
  await ensureCsrf();
  const { data } = await api.post('/profile/delete_account/', { password });
  return data;
}

// --- Subjects -------------------------------------------------------------

export async function listSubjects() {
  const { data } = await api.get('/subjects/');
  return Array.isArray(data) ? data : data.results || [];
}

export async function createSubject(payload) {
  const { data } = await api.post('/subjects/', payload);
  return data;
}

export async function updateSubject(id, payload) {
  const { data } = await api.patch(`/subjects/${id}/`, payload);
  return data;
}

export async function deleteSubject(id) {
  await api.delete(`/subjects/${id}/`);
}

// --- Tasks -----------------------------------------------------------------

export async function listTasks(params = {}) {
  const { data } = await api.get('/tasks/', { params });
  return Array.isArray(data) ? data : data.results || [];
}

function buildTaskFormData(payload, files = [], resources = null, replaceResources = true) {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    fd.append(key, value);
  });
  if (resources !== null) {
    fd.append('resources', JSON.stringify(resources));
  }
  fd.append('replace_resources', String(replaceResources));
  files.forEach((file) => fd.append('files', file));
  return fd;
}

export async function createTask(payload, { files = [], resources = null } = {}) {
  const body = (files.length || resources !== null)
    ? buildTaskFormData(payload, files, resources)
    : payload;
  const { data } = await api.post('/tasks/', body);
  return data;
}

export async function updateTask(id, payload, { files = [], resources = null, replaceResources = true } = {}) {
  const body = (files.length || resources !== null)
    ? buildTaskFormData(payload, files, resources, replaceResources)
    : payload;
  const { data } = await api.patch(`/tasks/${id}/`, body);
  return data;
}

export async function deleteTask(id) {
  await api.delete(`/tasks/${id}/`);
}

// --- Resources -------------------------------------------------------------

export async function deleteResource(id) {
  await api.delete(`/resources/${id}/`);
}

// --- Analytics -------------------------------------------------------------

export async function getWeeklyAnalytics() {
  const { data } = await api.get('/analytics/weekly/');
  return data;
}

export async function getMonthlyEfficiency() {
  const { data } = await api.get('/analytics/monthly/');
  return data;
}

export async function getInProgressCount() {
  const { data } = await api.get('/analytics/in-progress-count/');
  return data;
}
