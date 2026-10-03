import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

// Attach JWT token on every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('sp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sp_token');
      localStorage.removeItem('sp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me:       ()     => API.get('/auth/me'),
};

// ─── Dashboard ───────────────────────────────────────────────────
export const dashboardAPI = {
  summary:  ()    => API.get('/dashboard/summary'),
  farmer:   (id)  => API.get(`/dashboard/farmer/${id}`),
  buyer:    (id)  => API.get(`/dashboard/buyer/${id}`),
};

// ─── Forecasts ───────────────────────────────────────────────────
export const forecastAPI = {
  all:      (params) => API.get('/forecasts', { params }),
  county:   (county) => API.get(`/forecasts/county/${encodeURIComponent(county)}`),
  riskMap:  ()       => API.get('/forecasts/risk-map'),
  today:    ()       => API.get('/forecasts/today'),
};

// ─── Farmers ─────────────────────────────────────────────────────
export const farmerAPI = {
  list:       (params) => API.get('/farmers', { params }),
  get:        (id)     => API.get(`/farmers/${id}`),
  create:     (data)   => API.post('/farmers', data),
  update:     (id, d)  => API.put(`/farmers/${id}`, d),
  plots:      (id)     => API.get(`/farmers/${id}/plots`),
  createPlot: (id, d)  => API.post(`/farmers/${id}/plots`, d),
};

// ─── Yields ──────────────────────────────────────────────────────
export const yieldAPI = {
  list:    (params)  => API.get('/yields', { params }),
  get:     (id)      => API.get(`/yields/${id}`),
  create:  (data)    => API.post('/yields', data),
  confirm: (id, qty) => API.patch(`/yields/${id}/confirm`, { confirmed_qty_kg: qty }),
  byFarmer:(fid)     => API.get(`/yields/farmer/${fid}`),
};

// ─── Marketplace ─────────────────────────────────────────────────
export const marketplaceAPI = {
  listings: (params) => API.get('/marketplace', { params }),
  match:    (data)   => API.post('/marketplace/match', data),
  matches:  (bId)    => API.get(`/marketplace/matches/${bId}`),
  accept:   (mId)    => API.patch(`/marketplace/matches/${mId}/accept`),
};

// ─── Logistics ───────────────────────────────────────────────────
export const logisticsAPI = {
  list:         ()           => API.get('/logistics'),
  book:         (data)       => API.post('/logistics', data),
  updateStatus: (id, status, proof) => API.patch(`/logistics/${id}/status`, { status, delivery_proof: proof }),
  get:          (id)         => API.get(`/logistics/${id}`),
};

// ─── Alerts ──────────────────────────────────────────────────────
export const alertAPI = {
  list:      (params)   => API.get('/alerts', { params }),
  byFarmer:  (fid)      => API.get(`/alerts/farmer/${fid}`),
  send:      (data)     => API.post('/alerts', data),
  broadcast: (data)     => API.post('/alerts/broadcast', data),
};

// ─── Pilot Applications ──────────────────────────────────────────
export const pilotAPI = {
  apply: (data) => API.post('/alerts/pilot', data),   // reusing alerts router path
  list:  (params) => API.get('/alerts/pilot', { params }),
};

export default API;
