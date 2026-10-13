// Configure all API requests through VITE_API_URL with fallback to /api proxy
const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '/api';
const API_BASE = rawApiUrl.replace(/\/+$/, '');

export const isSuperAdmin = (user) => {
  if (!user) return false;
  if (user.isAdmin === true || user.isSuperAdmin === true) return true;
  const rawRole = user.role || user.roles;
  if (!rawRole) return false;
  if (Array.isArray(rawRole)) {
    return rawRole.some((r) => isSuperAdmin({ role: r }));
  }
  if (typeof rawRole !== 'string') return false;
  const role = rawRole.toLowerCase().trim().replace(/[-_\s]/g, '');
  return (
    role === 'superadmin' ||
    role === 'superadministrator' ||
    role === 'admin' ||
    role === 'administrator' ||
    role === 'platformsuperadmin' ||
    role === 'platformadmin' ||
    role === 'platformsuperadministrator' ||
    role === 'platformadministrator' ||
    role === 'sysadmin' ||
    role === 'systemadmin' ||
    role === 'root'
  );
};

export const getAuthToken = () => {
  const token =
    localStorage.getItem('menufy_token') ||
    localStorage.getItem('foodflow_token') ||
    localStorage.getItem('token');
  if (!token) return null;
  return token.replace(/^"(.*)"$/, '$1').trim();
};

export const setAuthToken = (token) => {
  if (token) {
    const cleanToken = typeof token === 'string' ? token.replace(/^"(.*)"$/, '$1').trim() : token;
    localStorage.setItem('menufy_token', cleanToken);
    localStorage.setItem('foodflow_token', cleanToken);
  } else {
    localStorage.removeItem('menufy_token');
    localStorage.removeItem('foodflow_token');
    localStorage.removeItem('token');
  }
};

const getEffectiveApiBase = () => {
  let base = API_BASE;
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname === '127.0.0.1' && base.includes('localhost:5001')) {
      base = base.replace('localhost:5001', '127.0.0.1:5001');
    } else if (window.location.hostname === 'localhost' && base.includes('127.0.0.1:5001')) {
      base = base.replace('127.0.0.1:5001', 'localhost:5001');
    }
  }
  return base;
};

export const apiRequest = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const effectiveBase = getEffectiveApiBase();
  const url =
    endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : `${effectiveBase}${cleanEndpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If direct fetch fails (e.g. cross-origin network failure), fall back to Vite local proxy /api
    if (
      typeof window !== 'undefined' &&
      (url.startsWith('http://localhost:5001') || url.startsWith('http://127.0.0.1:5001'))
    ) {
      try {
        const proxyUrl = url.replace(/^http:\/\/(localhost|127\.0\.0\.1):5001\/api/, '/api');
        const fallbackRes = await fetch(proxyUrl, config);
        const fallbackData = await fallbackRes.json().catch(() => ({}));

        if (!fallbackRes.ok) {
          const errorMsg = fallbackData.message || `Request failed with status ${fallbackRes.status}`;
          const err = new Error(errorMsg);
          err.status = fallbackRes.status;
          err.data = fallbackData;
          throw err;
        }

        return fallbackData;
      } catch {
        // preserve original error
      }
    }
    throw error;
  }
};

export const api = {
  get: (endpoint, headers) => apiRequest(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers) => apiRequest(endpoint, { method: 'POST', body, headers }),
  put: (endpoint, body, headers) => apiRequest(endpoint, { method: 'PUT', body, headers }),
  patch: (endpoint, body, headers) => apiRequest(endpoint, { method: 'PATCH', body, headers }),
  delete: (endpoint, headers) => apiRequest(endpoint, { method: 'DELETE', headers }),
};
