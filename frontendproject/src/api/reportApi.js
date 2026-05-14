import axios from 'axios';

// KpiReportService runs on port 2003
const BASE_URL = process.env.REACT_APP_REPORT_API_URL || 'http://localhost:8081';

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const getErrorMessage = (error, fallback) => {
  if (typeof error?.response?.data === 'string') return error.response.data;
  return error?.response?.data?.message || fallback;
};

/** POST /cargoRoute/reports/generate/ontime */
export const generateOnTimeReport = async ({ dateFrom, dateTo, userName, userRole }) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/cargoRoute/reports/generate/ontime`,
      { dateFrom, dateTo },
      {
        headers: {
          ...authHeaders().headers,
          'X-User-Name': userName || '',
          'X-User-Role': userRole || '',
        },
      }
    );
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not generate report. Is KpiReportService running on port 2003?'));
  }
};

/** POST /cargoRoute/reports/generate/utilization */
export const generateUtilizationReport = async ({ dateFrom, dateTo, userName, userRole }) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/cargoRoute/reports/generate/utilization`,
      { dateFrom, dateTo },
      {
        headers: {
          ...authHeaders().headers,
          'X-User-Name': userName || '',
          'X-User-Role': userRole || '',
        },
      }
    );
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not generate utilization report. Is KpiReportService running on port 2003?'));
  }
};

/** POST /cargoRoute/reports/generate/revenue */
export const generateRevenueReport = async ({ dateFrom, dateTo, userName, userRole }) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/cargoRoute/reports/generate/revenue`,
      { dateFrom, dateTo },
      {
        headers: {
          ...authHeaders().headers,
          'X-User-Name': userName || '',
          'X-User-Role': userRole || '',
        },
      }
    );
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not generate revenue report. Is KpiReportService running on port 2003?'));
  }
};

/** POST /cargoRoute/reports/generate/exceptions */
export const generateExceptionReport = async ({ dateFrom, dateTo, userName, userRole }) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/cargoRoute/reports/generate/exceptions`,
      { dateFrom, dateTo },
      {
        headers: {
          ...authHeaders().headers,
          'X-User-Name': userName || '',
          'X-User-Role': userRole || '',
        },
      }
    );
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not generate exceptions report. Is KpiReportService running on port 2003?'));
  }
};

/** GET /cargoRoute/reports/getAll */
export const getAllReports = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/cargoRoute/reports/getAll`, authHeaders());
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not load reports.'));
  }
};

/** GET /cargoRoute/reports/getBy/:id */
export const getReportById = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}/cargoRoute/reports/getBy/${id}`, authHeaders());
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not load report.'));
  }
};

/** GET /cargoRoute/reports/export → blob (CSV) */
export const exportReports = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/cargoRoute/reports/export`, {
      ...authHeaders(),
      responseType: 'blob',
    });
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not export reports.'));
  }
};

/** POST /cargoRoute/reports/create → ReportDTO */
export const createReport = async (data, userName, userRole) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/cargoRoute/reports/create`,
      data,
      {
        headers: {
          ...authHeaders().headers,
          'X-User-Name': userName || '',
          'X-User-Role': userRole || '',
        },
      }
    );
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not create report.'));
  }
};

/** PUT /cargoRoute/reports/update/:id → ReportDTO */
export const updateReport = async (id, data, userName, userRole) => {
  try {
    const res = await axios.put(
      `${BASE_URL}/cargoRoute/reports/update/${id}`,
      data,
      {
        headers: {
          ...authHeaders().headers,
          'X-User-Name': userName || '',
          'X-User-Role': userRole || '',
        },
      }
    );
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not update report.'));
  }
};

/** DELETE /cargoRoute/reports/delete/:id */
export const deleteReport = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/cargoRoute/reports/delete/${id}`, authHeaders());
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not delete report.'));
  }
};
