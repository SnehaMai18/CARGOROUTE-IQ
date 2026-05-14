import axios from 'axios';


// KpiReportService runs on port 2003
const BASE_URL = process.env.REACT_APP_REPORT_API_URL || 'http://localhost:8081';



const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const getErrorMessage = (err, fallback) => {
  if (typeof err?.response?.data === 'string') return err.response.data;
  return err?.response?.data?.message || fallback;
};

/**
 * POST /cargoRoute/kpis/compute
 * { name, target, reportingPeriod }
 */
export const computeKpi = async ({ name, target, reportingPeriod }) => {
  try {
    console.log('Computing KPI:', { name, target, reportingPeriod });
    const res = await axios.post(
      `${BASE_URL}/cargoRoute/kpis/compute`,
      { name, target, reportingPeriod },
      authHeaders()
    );
    console.log('Compute API response:', res.data);
    return res.data;
  } catch (err) {
    console.error('Compute API error:', err);
    throw new Error(getErrorMessage(err, 'Could not compute KPI. Is KpiReportService running on port 2003?'));
  }
};

/** POST /cargoRoute/kpis/create → KpiDTO */
export const createKpi = async (data) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/cargoRoute/kpis/create`,
      data,
      authHeaders()
    );
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not create KPI.'));
  }
};

/** GET /cargoRoute/kpis/getAll */
export const getAllKpis = async () => {
  try {
    console.log('Fetching all KPIs...');
    const res = await axios.get(`${BASE_URL}/cargoRoute/kpis/getAll`, authHeaders());
    console.log('Get all KPIs response:', res.data);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    // 404 means no KPIs in DB yet — return empty array instead of throwing
    if (err?.response?.status === 404) return [];
    console.error('Get all KPIs error:', err);
    throw new Error(getErrorMessage(err, 'Could not load KPIs. Is KpiReportService running on port 2003?'));
  }
};

/** GET /cargoRoute/kpis/getBy/:id */
export const getKpiById = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}/cargoRoute/kpis/getBy/${id}`, authHeaders());
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not load KPI.'));
  }
};

/** DELETE /cargoRoute/kpis/delete/:id */
export const deleteKpi = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/cargoRoute/kpis/delete/${id}`, authHeaders());
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not delete KPI.'));
  }
};

/** PUT /cargoRoute/kpis/update/:id */
export const updateKpi = async (id, data) => {
  try {
    const res = await axios.put(
      `${BASE_URL}/cargoRoute/kpis/update/${id}`,
      data,
      authHeaders()
    );
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not update KPI.'));
  }
};

/** GET /cargoRoute/kpis/export  → blob */
export const exportKpis = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/cargoRoute/kpis/export`, {
      ...authHeaders(),
      responseType: 'blob',
    });
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not export KPIs.'));
  }
};

/** GET /cargoRoute/kpis/definition/:name */
export const getKpiDefinition = async (name) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/cargoRoute/kpis/definition/${encodeURIComponent(name)}`,
      authHeaders()
    );
    return res.data; // plain string
  } catch (err) {
    return '';
  }
};
