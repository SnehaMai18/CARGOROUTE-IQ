import axios from "axios";

const API_URL = "http://localhost:8081/cargoRoute/notifications";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`
  };
};

export const getAllNotifications = () =>
  axios.get(`${API_URL}/getAllNotifications`, {
    headers: authHeader()
  });

export const getMyNotifications = () =>
  axios.get(`${API_URL}/my`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

export const markNotificationRead = (notificationId) =>
  axios.put(`${API_URL}/${notificationId}/read`, {}, {
    headers: authHeader()
  });

export const markAllNotificationsRead = () =>
  axios.put(`${API_URL}/my/read-all`, {}, {
    headers: authHeader()
  });

export const clearMyNotifications = () =>
  axios.delete(`${API_URL}/my`, {
    headers: authHeader()
  });

export const markOneReadAndReturn = async (notificationId) => {
  const res = await markNotificationRead(notificationId);
  return res?.data;
};
