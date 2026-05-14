import axios from 'axios';

// All requests routed through API Gateway on port 8081
const BASE_URL = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8081';

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/** GET /cargoRoute/booking/getBookings */
export const getAllBookings = () =>
  axios.get(`${BASE_URL}/cargoRoute/booking/getBookings`, { headers: authHeader() }).then(r => r.data);

/** GET /cargoRoute/booking/getBookingById/:id */
export const getBookingById = (id) =>
  axios.get(`${BASE_URL}/cargoRoute/booking/getBookingById/${id}`, { headers: authHeader() }).then(r => r.data);

/** POST /cargoRoute/booking/addBooking */
export const createBooking = (data) =>
  axios.post(`${BASE_URL}/cargoRoute/booking/addBooking`, data, { headers: authHeader() }).then(r => r.data);

/** PATCH /cargoRoute/booking/updateBookingStatus/:id  { status } */
export const updateBookingStatus = (id, status) =>
  axios.patch(`${BASE_URL}/cargoRoute/booking/updateBookingStatus/${id}`, { status }, { headers: authHeader() }).then(r => r.data);

/** PUT /cargoRoute/booking/updateBooking/:id */
export const updateBooking = (id, data) =>
  axios.put(`${BASE_URL}/cargoRoute/booking/updateBooking/${id}`, data, { headers: authHeader() }).then(r => r.data);

/** GET /cargoRoute/booking/getBookingsByStatus/:status */
export const getBookingsByStatus = (status) =>
  axios.get(`${BASE_URL}/cargoRoute/booking/getBookingsByStatus/${status}`, { headers: authHeader() }).then(r => r.data);

/** GET /cargoRoute/booking/getBookingsByShipperID/:shipperId */
export const getBookingsByShipper = (shipperId) =>
  axios.get(`${BASE_URL}/cargoRoute/booking/getBookingsByShipperID/${shipperId}`, { headers: authHeader() }).then(r => r.data);

/* ── Shippers ───────────────────────────────────────────────────── */

/** GET /cargoRoute/shipper/getShippers */
export const getAllShippers = () =>
  axios.get(`${BASE_URL}/cargoRoute/shipper/getShippers`, { headers: authHeader() }).then(r => r.data);

/** GET /cargoRoute/shipper/getShipper/:id */
export const getShipperById = (id) =>
  axios.get(`${BASE_URL}/cargoRoute/shipper/getShipper/${id}`, { headers: authHeader() }).then(r => r.data);

/** POST /cargoRoute/shipper/addShipper */
export const createShipper = (data) =>
  axios.post(`${BASE_URL}/cargoRoute/shipper/addShipper`, data, { headers: authHeader() }).then(r => r.data);

/** PUT /cargoRoute/shipper/updateShipper/:id */
export const updateShipper = (id, data) =>
  axios.put(`${BASE_URL}/cargoRoute/shipper/updateShipper/${id}`, data, { headers: authHeader() }).then(r => r.data);

/** POST /cargoRoute/importBookings – multipart CSV upload */
export const importBookingsCsv = (file) => {
  const form = new FormData();
  form.append('file', file);
  return axios.post(`${BASE_URL}/cargoRoute/booking/importBookings`, form, {
    headers: { 'Content-Type': 'multipart/form-data', ...authHeader() },
  }).then(r => r.data);
};