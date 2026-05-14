import axios from "axios";

const API_URL = "http://localhost:8081/cargoRoute/tasks";

// Entity mapping: number to name
const ENTITY_MAP = {
  1: "User",
  2: "AuditLog",
  3: "Shipper",
  4: "Booking",
  5: "Vehicle",
  6: "Driver",
  7: "VehicleAvailability",
  8: "Load",
  9: "Route",
  10: "RoutingRule",
  11: "Dispatch",
  12: "DriverAck",
  13: "Manifest",
  14: "Handover",
  15: "ProofOfDelivery",
  16: "Tariff",
  17: "BillingLine",
  18: "Invoice",
  19: "Exception",
  20: "Claim",
  21: "Report",
  22: "KPI",
  23: "Notification",
  24: "Task",
};

export const getEntityName = (entityId) => {
  if (entityId == null) return "-";
  const num = Number(entityId);
  if (Number.isFinite(num) && ENTITY_MAP[num]) {
    return ENTITY_MAP[num];
  }
  return String(entityId);
};

export const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const normalizeTask = (item = {}) => ({
  taskID: item.taskID ?? item.taskId ?? item.id ?? null,
  assignedTo: item.assignedTo ?? item.assignee ?? null,
  relatedEntityID: item.relatedEntityID ?? item.relatedEntityId ?? null,
  relatedCode: item.relatedCode ?? item.relatedRef ?? item.referenceCode ?? null,
  description: item.description ?? "",
  dueDate: item.dueDate ?? item.dueAt ?? null,
  status: String(item.status ?? "PENDING").toUpperCase(),
  priority: item.priority ?? null,
});

export const getAllTasks = () =>
  axios
    .get(`${API_URL}/getAllTasks`, {
      headers: authHeader(),
    })
    .then((res) => ({ ...res, data: toArray(res.data).map(normalizeTask) }));

export const getTaskById = (taskId) =>
  axios
    .get(`${API_URL}/${taskId}`, {
      headers: authHeader(),
    })
    .then((res) => ({ ...res, data: normalizeTask(res.data) }));

export const createTask = (payload) => {
  const relatedEntityValue = payload.relatedEntityID;
  const normalizedRelatedEntity =
    relatedEntityValue === "" || relatedEntityValue == null
      ? null
      : Number.isNaN(Number(relatedEntityValue))
        ? String(relatedEntityValue)
        : Number(relatedEntityValue);

  const body = {
    assignedTo: Number(payload.assignedTo),
    relatedEntityID: normalizedRelatedEntity,
    description: payload.description,
    dueDate: payload.dueDate,
    status: payload.status,
  };

  return axios
    .post(`${API_URL}/create`, body, {
      headers: authHeader(),
    })
    .then((res) => ({ ...res, data: normalizeTask(res.data) }));
};

export const updateTask = (taskId, payload) => {
  const body = {
    description: payload.description,
    status: payload.status,
    dueDate: payload.dueDate,
  };

  return axios
    .put(`${API_URL}/update/${taskId}`, body, {
      headers: authHeader(),
    })
    .then((res) => ({ ...res, data: normalizeTask(res.data) }));
};
