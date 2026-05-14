
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_ROUTING_API_URL || 'http://localhost:8081';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiClient = axios.create({
  baseURL: `${BASE_URL}/cargoRoute`,
  headers: { 'Content-Type': 'application/json' },
});

const directApiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const proxyApiClient = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

[apiClient, directApiClient, proxyApiClient].forEach((client) => {
  client.interceptors.request.use((config) => ({
    ...config,
    headers: {
      ...(config.headers || {}),
      ...authHeader(),
    },
  }));
});

const normalizeListResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
};

const tryGet = async (pathCandidates) => {
  let lastError;

  for (const path of pathCandidates) {
    try {
      if (path.startsWith('/cargoRoute/')) {
        const proxied = await proxyApiClient.get(path);
        return proxied.data;
      }

      const response = await apiClient.get(path);
      return response.data;
    } catch (err) {
      lastError = err;
      try {
        if (path.startsWith('/cargoRoute/')) {
          const fallback = await directApiClient.get(path);
          return fallback.data;
        }
      } catch (fallbackErr) {
        lastError = fallbackErr;
      }
    }
  }

  throw lastError;
};

// ── Routes ──────────────────────────────────────────────────────────

export const getAllRoutes = async () => {
  const response = await apiClient.get('/routes/getAllRoutes');
  return response.data;
};

export const getRouteById = async (id) => {
  const response = await apiClient.get(`/routes/getRoute/${id}`);
  return response.data;
};

export const createRoute = async (routeData) => {
  const response = await apiClient.post('/routes/createNewRoute', routeData);
  return response.data;
};

export const updateRoute = async (id, routeData) => {
  const response = await apiClient.put(`/routes/updateRoute/${id}`, routeData);
  return response.data;
};

export const deleteRoute = async (id) => {
  await apiClient.delete(`/routes/deleteRoute/${id}`);
};

export const getRoutesByVehicle = async (vehicleId) => {
  const response = await apiClient.get(`/routes/vehicle/${vehicleId}`);
  return response.data;
};

export const getRoutesByLoad = async (loadId) => {
  const response = await apiClient.get(`/routes/load/${loadId}`);
  return response.data;
};

// ── Loads ────────────────────────────────────────────────────────────

export const getAllLoads = async () => {
  const response = await apiClient.get('/loads/getAllLoads');
  return normalizeListResponse(response.data);
};

export const getLoadById = async (id) => {
  const response = await apiClient.get(`/loads/getLoad/${id}`);
  return response.data;
};

export const createLoad = async (loadData) => {
  const response = await apiClient.post('/loads/createNewLoad', loadData);
  return response.data;
};

export const updateLoad = async (id, loadData) => {
  const response = await apiClient.put(`/loads/updateLoad/${id}`, loadData);
  return response.data;
};

export const deleteLoad = async (id) => {
  await apiClient.delete(`/loads/deleteLoad/${id}`);
};

// ── Routing Rules ─────────────────────────────────────────────────────

export const getAllRoutingRules = async () => {
  const data = await tryGet([
    '/routingRules/getAllRoutingRules',
    '/cargoRoute/routingRules/getAllRoutingRules',
  ]);
  return normalizeListResponse(data);
};

export const getRoutingRuleById = async (id) => {
  return tryGet([
    `/routingRules/getRoutingRule/${id}`,
    `/cargoRoute/routingRules/getRoutingRule/${id}`,
  ]);
};

export const createRoutingRule = async (ruleData) => {
  const response = await apiClient.post('/routingRules/createNewRoutingRule', ruleData);
  return response.data;
};

export const updateRoutingRule = async (id, ruleData) => {
  const response = await apiClient.put(`/routingRules/updateRoutingRule/${id}`, ruleData);
  return response.data;
};

export const deleteRoutingRule = async (id) => {
  await apiClient.delete(`/routingRules/deleteRoutingRule/${id}`);
};

export const getActiveRoutingRules = async () => {
  const data = await tryGet([
    '/routingRules/active',
    '/cargoRoute/routingRules/active',
  ]);
  return normalizeListResponse(data);
};