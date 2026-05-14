import axios from "axios";

const API_URL = "http://localhost:8081/cargoRoute/auditLogs";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getAllAuditLogs = async () => {
  const res = await axios.get(`${API_URL}/getAllAuditLogs`, {
    headers: authHeader(),
  });
  return Array.isArray(res.data) ? res.data : [];
};
