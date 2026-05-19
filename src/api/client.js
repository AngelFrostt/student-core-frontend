/**
 * Единый axios-клиент для всего приложения.
 *
 * Особенности:
 *  - withCredentials: true — браузер будет слать httpOnly cookie с JWT и
 *    csrftoken cookie вместе с каждым запросом;
 *  - перед модифицирующими запросами (POST/PUT/PATCH/DELETE) клиент
 *    прокладывает CSRF-токен из csrftoken cookie в заголовок X-CSRFToken;
 *  - на 401 один раз пробует обновить токены через /api/auth/refresh/ и
 *    повторяет исходный запрос; если refresh упал — эмитит событие
 *    "auth:logout", которое слушает AuthContext.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function readCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// CSRF: axios сам подставит X-CSRFToken из csrftoken cookie благодаря
// xsrfCookieName/xsrfHeaderName, но cookie должен быть выставлен. Делаем это
// один раз при старте приложения через ensureCsrf().
let csrfPromise = null;
export function ensureCsrf() {
  if (readCookie('csrftoken')) return Promise.resolve();
  if (!csrfPromise) {
    csrfPromise = api.get('/auth/csrf/').finally(() => {
      csrfPromise = null;
    });
  }
  return csrfPromise;
}

// --- Refresh logic ---------------------------------------------------------

let refreshPromise = null;
const authEvents = new EventTarget();
export const authBus = authEvents;

function refreshAccess() {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh/', null, { _skipAuthRefresh: true })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry && !original._skipAuthRefresh) {
      original._retry = true;
      try {
        await refreshAccess();
        return api(original);
      } catch (refreshError) {
        authEvents.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      }
    }

    if (status === 403 && error.response?.data?.detail?.includes?.('CSRF')) {
      // CSRF cookie мог истечь — попробуем перевыпустить и повторить запрос.
      if (original && !original._csrfRetry) {
        original._csrfRetry = true;
        await api.get('/auth/csrf/');
        return api(original);
      }
    }

    return Promise.reject(error);
  },
);

// --- Helpers ---------------------------------------------------------------

export const MEDIA_BASE_URL = BASE_URL;

export function mediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default api;
