import axios from "axios";


const AUTH_URL = "http://localhost:8081/cargoRoute/auth";
const USER_URL = "http://localhost:8081/cargoRoute/user";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const loginUser = (data) =>
  axios.post(`${AUTH_URL}/login`, data);

export const signupUser = (data) =>
  axios.post(`${AUTH_URL}/signup`, data);

export const signoutUser = () =>
  axios.post(`${AUTH_URL}/signout`, {}, { headers: authHeader() });

// ── Admin-only user management ────────────────────────────────────────────────

/** Admin: create a new user (including Shipper-linked users) */
export const createAdminUser = (data) =>
  axios.post(`${USER_URL}/register`, data, { headers: authHeader() }).then(r => r.data);

/** Admin: get all users */
export const getAllUsersAdmin = () =>
  axios.get(`${USER_URL}/getAllUsers`, { headers: authHeader() }).then(r => r.data);

/** Admin: get single user by ID */
export const getUserByIdAdmin = (id) =>
  axios.get(`${USER_URL}/${id}`, { headers: authHeader() }).then(r => r.data);

/** Admin: update an existing user */
export const updateAdminUser = (id, data) =>
  axios.put(`${USER_URL}/${id}`, data, { headers: authHeader() }).then(r => r.data);
