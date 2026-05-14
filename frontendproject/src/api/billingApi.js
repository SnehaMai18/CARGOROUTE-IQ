import axios from 'axios';

// BillingService runs on port 9098
const BASE_URL = process.env.REACT_APP_BILLING_API_URL || 'http://localhost:8081';

const getErrorMessage = (error, fallback) => {
  if (typeof error?.response?.data === 'string') return error.response.data;
  return error?.response?.data?.message || fallback;
};

/* ── TARIFFS ────────────────────────────────────────────────────── */

/** GET /cargoRoute/tariffs/getAll */
export const getAllTariffs = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/cargoRoute/tariffs/getAll`);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not load tariffs. Is BillingService running on port 9097?'));
  }
};

/** GET /cargoRoute/tariffs/getBy/:id */
export const getTariffById = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}/cargoRoute/tariffs/getBy/${id}`);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, `Could not load tariff #${id}.`));
  }
};

/** POST /cargoRoute/tariffs/create */
export const createTariff = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/cargoRoute/tariffs/create`, data);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not create tariff.'));
  }
};

/** PUT /cargoRoute/tariffs/update/:id */
export const updateTariff = async (id, data) => {
  try {
    const res = await axios.put(`${BASE_URL}/cargoRoute/tariffs/update/${id}`, data);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not update tariff.'));
  }
};

/** DELETE /cargoRoute/tariffs/delete/:id */
export const deleteTariff = async (id) => {
  try {
    const res = await axios.delete(`${BASE_URL}/cargoRoute/tariffs/delete/${id}`);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not delete tariff.'));
  }
};

/* ── BILLING LINES ──────────────────────────────────────────────── */

/** GET /cargoRoute/billing-lines/getAll */
export const getAllBillingLines = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/cargoRoute/billing-lines/getAll`);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not load billing lines.'));
  }
};

/** GET /cargoRoute/billing-lines/getBy/:id */
export const getBillingLineById = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}/cargoRoute/billing-lines/getBy/${id}`);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, `Could not load billing line #${id}.`));
  }
};

/** POST /cargoRoute/billing-lines/create */
export const createBillingLine = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/cargoRoute/billing-lines/create`, data);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not create billing line.'));
  }
};

/** PUT /cargoRoute/billing-lines/update/:id */
export const updateBillingLine = async (id, data) => {
  try {
    const res = await axios.put(`${BASE_URL}/cargoRoute/billing-lines/update/${id}`, data);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not update billing line.'));
  }
};

/** DELETE /cargoRoute/billing-lines/delete/:id */
export const deleteBillingLine = async (id) => {
  try {
    const res = await axios.delete(`${BASE_URL}/cargoRoute/billing-lines/delete/${id}`);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not delete billing line.'));
  }
};

/* ── INVOICES ───────────────────────────────────────────────────── */

/** GET /cargoRoute/invoices/getAll  → List<InvoiceRequiredResponseDTO> */
export const getAllInvoices = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/cargoRoute/invoices/getAll`);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not load invoices.'));
  }
};

/** GET /cargoRoute/invoices/getBy/:id  → InvoiceRequiredResponseDTO */
export const getInvoiceById = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}/cargoRoute/invoices/getBy/${id}`);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, `Could not load invoice #${id}.`));
  }
};

/** POST /cargoRoute/invoices/create */
export const createInvoice = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/cargoRoute/invoices/create`, data);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not create invoice.'));
  }
};

/** PUT /cargoRoute/invoices/update/:id */
export const updateInvoice = async (id, data) => {
  try {
    const res = await axios.put(`${BASE_URL}/cargoRoute/invoices/update/${id}`, data);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not update invoice.'));
  }
};

/** DELETE /cargoRoute/invoices/delete/:id */
export const deleteInvoice = async (id) => {
  try {
    const res = await axios.delete(`${BASE_URL}/cargoRoute/invoices/delete/${id}`);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not delete invoice.'));
  }
};
