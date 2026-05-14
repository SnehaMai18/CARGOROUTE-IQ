import axios from 'axios';

const BASE_URL = process.env.REACT_APP_MANIFEST_URL || 'http://localhost:8081';

// ── Manifests ─────────────────────────────────────────────────────────────────

/** POST /cargoRoute/manifests/createManifest → ManifestDTO (201) */
export const createManifest = (data) =>
  axios.post(`${BASE_URL}/cargoRoute/manifests/createManifest`, data).then((r) => r.data);

/** GET /cargoRoute/manifests/getAllManifest → List<ManifestRequiredResponseDTO> */
export const getAllManifests = () =>
  axios.get(`${BASE_URL}/cargoRoute/manifests/getAllManifest`).then((r) => r.data);

/** GET /cargoRoute/manifests/getByManifestId/:id → ManifestRequiredResponseDTO */
export const getManifestById = (id) =>
  axios.get(`${BASE_URL}/cargoRoute/manifests/getByManifestId/${id}`).then((r) => r.data);

/** GET /cargoRoute/manifests/getByLoadId/:loadID → ManifestRequiredResponseDTO */
export const getManifestByLoad = (loadID) =>
  axios.get(`${BASE_URL}/cargoRoute/manifests/getByLoadId/${loadID}`).then((r) => r.data);

/** GET /cargoRoute/manifests/getByWarehouseId/:warehouseID → List<ManifestRequiredResponseDTO> */
export const getManifestsByWarehouse = (warehouseID) =>
  axios.get(`${BASE_URL}/cargoRoute/manifests/getByWarehouseId/${warehouseID}`).then((r) => r.data);

/** PUT /cargoRoute/manifests/updateManifest/:id → ManifestDTO */
export const updateManifest = (id, data) =>
  axios.put(`${BASE_URL}/cargoRoute/manifests/updateManifest/${id}`, data).then((r) => r.data);

/** Convert file to base64 data URL (used for POD edit where update endpoint is JSON-only) */
export const uploadManifestFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve({ manifestURI: e.target.result });
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

/** POST /cargoRoute/manifests/createManifest (multipart: manifest JSON + file) → { manifestID, manifestURI } */
export const createManifestWithFileApi = (manifestData, file) => {
  const form = new FormData();
  form.append('manifest', new Blob([JSON.stringify(manifestData)], { type: 'application/json' }));
  form.append('file', file);
  return axios.post(`${BASE_URL}/cargoRoute/manifests/createManifest`, form).then((r) => r.data);
};

/** POST /cargoRoute/proof-of-delivery/createProofOfDelivery (multipart: pod JSON + file) → { podID, podURI } */
export const createPodWithImage = (podData, file) => {
  const form = new FormData();
  form.append('pod', new Blob([JSON.stringify(podData)], { type: 'application/json' }));
  form.append('file', file);
  return axios.post(`${BASE_URL}/cargoRoute/proof-of-delivery/createProofOfDelivery`, form).then((r) => r.data);
};

/** DELETE /cargoRoute/manifests/deleteByManifestId/:id → 204 */
export const deleteManifest = (id) =>
  axios.delete(`${BASE_URL}/cargoRoute/manifests/deleteByManifestId/${id}`);

// ── Handovers ─────────────────────────────────────────────────────────────────

/** POST /cargoRoute/handovers/createHandover → HandoverDTO (201) */
export const createHandover = (data) =>
  axios.post(`${BASE_URL}/cargoRoute/handovers/createHandover`, data).then((r) => r.data);

/** GET /cargoRoute/handovers/getAllHandovers → List<HandoverResponseDTO> */
export const getAllHandovers = () =>
  axios.get(`${BASE_URL}/cargoRoute/handovers/getAllHandovers`).then((r) => r.data);

/** GET /cargoRoute/handovers/getByHandoverId/:id → HandoverResponseDTO */
export const getHandoverById = (id) =>
  axios.get(`${BASE_URL}/cargoRoute/handovers/getByHandoverId/${id}`).then((r) => r.data);

/** GET /cargoRoute/handovers/getByManifestId/:manifestID → HandoverResponseDTO */
export const getHandoverByManifest = (manifestID) =>
  axios.get(`${BASE_URL}/cargoRoute/handovers/getByManifestId/${manifestID}`).then((r) => r.data);

/** GET /cargoRoute/handovers/getHanded-by/:handedBy → List<HandoverResponseDTO> */
export const getHandoversByHandedBy = (handedBy) =>
  axios.get(`${BASE_URL}/cargoRoute/handovers/getHanded-by/${handedBy}`).then((r) => r.data);

/** PUT /cargoRoute/handovers/updateHandover/:id → HandoverDTO */
export const updateHandover = (id, data) =>
  axios.put(`${BASE_URL}/cargoRoute/handovers/updateHandover/${id}`, data).then((r) => r.data);

/** DELETE /cargoRoute/handovers/deleteByHandoverId/:id → 204 */
export const deleteHandover = (id) =>
  axios.delete(`${BASE_URL}/cargoRoute/handovers/deleteByHandoverId/${id}`);

// ── Proof of Delivery ─────────────────────────────────────────────────────────

/** POST /cargoRoute/proof-of-delivery/createProofOfDelivery → ProofOfDeliveryDTO (201) */
export const createPod = (data) =>
  axios.post(`${BASE_URL}/cargoRoute/proof-of-delivery/createProofOfDelivery`, data).then((r) => r.data);

/** GET /cargoRoute/proof-of-delivery/getAllProofOfDeliveries → List<ProofOfDeliveryResponseDTO> */
export const getAllPods = () =>
  axios.get(`${BASE_URL}/cargoRoute/proof-of-delivery/getAllProofOfDeliveries`).then((r) => r.data);

/** GET /cargoRoute/proof-of-delivery/getById/:podId → ProofOfDeliveryResponseDTO */
export const getPodById = (podId) =>
  axios.get(`${BASE_URL}/cargoRoute/proof-of-delivery/getById/${podId}`).then((r) => r.data);

/** GET /cargoRoute/proof-of-delivery/getByBookingId/:bookingId → ProofOfDeliveryResponseDTO */
export const getPodByBooking = (bookingId) =>
  axios.get(`${BASE_URL}/cargoRoute/proof-of-delivery/getByBookingId/${bookingId}`).then((r) => r.data);

/** GET /cargoRoute/proof-of-delivery/getByType/:podType → List<ProofOfDeliveryResponseDTO> */
export const getPodsByType = (podType) =>
  axios.get(`${BASE_URL}/cargoRoute/proof-of-delivery/getByType/${podType}`).then((r) => r.data);

/** GET /cargoRoute/proof-of-delivery/getByStatus/:status → List<ProofOfDeliveryResponseDTO> */
export const getPodsByStatus = (status) =>
  axios.get(`${BASE_URL}/cargoRoute/proof-of-delivery/getByStatus/${status}`).then((r) => r.data);

/** PUT /cargoRoute/proof-of-delivery/updateProofOfDelivery/:podId → ProofOfDeliveryDTO */
export const updatePod = (podId, data) =>
  axios.put(`${BASE_URL}/cargoRoute/proof-of-delivery/updateProofOfDelivery/${podId}`, data).then((r) => r.data);

/** DELETE /cargoRoute/proof-of-delivery/deleteById/:podId → 204 */
export const deletePod = (podId) =>
  axios.delete(`${BASE_URL}/cargoRoute/proof-of-delivery/deleteById/${podId}`);


/** GET /cargoRoute/proof-of-delivery/getByDriverId/:driverId → List<ProofOfDeliveryResponseDTO> */
export const getPodsByDriver = (driverId) =>
  axios.get(`${BASE_URL}/cargoRoute/proof-of-delivery/getByDriverId/${driverId}`).then((r) => r.data);