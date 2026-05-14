import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8081';

// ── Dispatches ───────────────────────────────────────────────────────────────

/** GET /cargoRoute/dispatches/getAllDispatches → List<DispatchResponseDTO> */
export const getAllDispatches = () =>
  axios.get(`${BASE_URL}/cargoRoute/dispatches/getAllDispatches`).then((r) => r.data);

/** GET /cargoRoute/dispatches/getDispatchById/:id → DispatchResponseDTO */
export const getDispatchById = (id) =>
  axios.get(`${BASE_URL}/cargoRoute/dispatches/getDispatchById/${id}`).then((r) => r.data);

/** GET /cargoRoute/dispatches/getDispatchByStatus/:status → List<DispatchResponseDTO> */
export const getDispatchesByStatus = (status) =>
  axios.get(`${BASE_URL}/cargoRoute/dispatches/getDispatchByStatus/${status}`).then((r) => r.data);

/** GET /cargoRoute/dispatches/getAssigned-by/:assignedBy → List<DispatchResponseDTO> */
export const getDispatchesByAssignedBy = (assignedBy) =>
  axios.get(`${BASE_URL}/cargoRoute/dispatches/getAssigned-by/${assignedBy}`).then((r) => r.data);

/** POST /cargoRoute/dispatches/createDispatch → DispatchDTO (201) */
export const createDispatch = (data) =>
  axios.post(`${BASE_URL}/cargoRoute/dispatches/createDispatch`, data).then((r) => r.data);

/** PUT /cargoRoute/dispatches/updateDispatch/:id → DispatchDTO */
export const updateDispatch = (id, data) =>
  axios.put(`${BASE_URL}/cargoRoute/dispatches/updateDispatch/${id}`, data).then((r) => r.data);

/** DELETE /cargoRoute/dispatches/deleteDispatch/:id → 204 */
export const deleteDispatch = (id) =>
  axios.delete(`${BASE_URL}/cargoRoute/dispatches/deleteDispatch/${id}`);

// ── Drivers ──────────────────────────────────────────────────────────────────

/** GET /cargoRoute/drivers/getAllDrivers → List<DriverDTO> */
export const getAllDrivers = () =>
  axios.get(`${BASE_URL}/cargoRoute/drivers/getAllDrivers`).then((r) => r.data);

/** GET /cargoRoute/drivers/getDriverByDriverId/:id → DriverDTO */
export const getDriverById = (id) =>
  axios.get(`${BASE_URL}/cargoRoute/drivers/getDriverByDriverId/${id}`).then((r) => r.data);

/** GET /cargoRoute/drivers/getDriverByStatus/:status → List<DriverDTO> */
export const getDriversByStatus = (status) =>
  axios.get(`${BASE_URL}/cargoRoute/drivers/getDriverByStatus/${status}`).then((r) => r.data);

/** POST /cargoRoute/drivers/createDriver → DriverDTO (201) */
export const createDriver = (data) =>
  axios.post(`${BASE_URL}/cargoRoute/drivers/createDriver`, data).then((r) => r.data);

/** PUT /cargoRoute/drivers/updateDriver/:id → DriverDTO */
export const updateDriver = (id, data) =>
  axios.put(`${BASE_URL}/cargoRoute/drivers/updateDriver/${id}`, data).then((r) => r.data);

/** DELETE /cargoRoute/drivers/deleteById/:id → 204 */
export const deleteDriver = (id) =>
  axios.delete(`${BASE_URL}/cargoRoute/drivers/deleteById/${id}`);

// ── Driver Acknowledgements ───────────────────────────────────────────────────

/** GET /cargoRoute/driver-acknowledgement/getAllDriverAcknowledgement → List<DriverAckResponseDTO> */
export const getAllAcknowledgements = () =>
  axios.get(`${BASE_URL}/cargoRoute/driver-acknowledgement/getAllDriverAcknowledgement`).then((r) => r.data);

/** GET /cargoRoute/driver-acknowledgement/getByAckId/:id → DriverAckResponseDTO */
export const getAcknowledgementById = (id) =>
  axios.get(`${BASE_URL}/cargoRoute/driver-acknowledgement/getByAckId/${id}`).then((r) => r.data);

/** GET /cargoRoute/driver-acknowledgement/getByDispatchId/:dispatchId → DriverAckResponseDTO */
export const getAcknowledgementByDispatch = (dispatchId) =>
  axios.get(`${BASE_URL}/cargoRoute/driver-acknowledgement/getByDispatchId/${dispatchId}`).then((r) => r.data);

/** GET /cargoRoute/driver-acknowledgement/getByDriverId/:driverId → DriverAckResponseDTO */
export const getAcknowledgementByDriver = (driverId) =>
  axios.get(`${BASE_URL}/cargoRoute/driver-acknowledgement/getByDriverId/${driverId}`).then((r) => r.data);

/** POST /cargoRoute/driver-acknowledgement/createDriverAcknowledgement → DriverAckDTO (201) */
export const createAcknowledgement = (data) =>
  axios.post(`${BASE_URL}/cargoRoute/driver-acknowledgement/createDriverAcknowledgement`, data).then((r) => r.data);

/** PUT /cargoRoute/driver-acknowledgement/updateDriverAcknowledgement/:id → DriverAckDTO */
export const updateAcknowledgement = (id, data) =>
  axios.put(`${BASE_URL}/cargoRoute/driver-acknowledgement/updateDriverAcknowledgement/${id}`, data).then((r) => r.data);

/** DELETE /cargoRoute/driver-acknowledgement/deleteDriverAck/:id → 204 */
export const deleteAcknowledgement = (id) =>
  axios.delete(`${BASE_URL}/cargoRoute/driver-acknowledgement/deleteDriverAck/${id}`);
