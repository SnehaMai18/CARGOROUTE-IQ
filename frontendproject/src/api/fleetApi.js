

import axios from 'axios';
 
// FleetService runs on port 8083
const BASE_URL = process.env.REACT_APP_FLEET_API_URL || 'http://localhost:8081';
 
// Configure axios instance with CORS headers
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});
 
// DispatchService runs on port 7001
const DISPATCH_BASE_URL = process.env.REACT_APP_DISPATCH_API_URL || 'http://localhost:8081';
 
const dispatchClient = axios.create({
  baseURL: DISPATCH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
 
/**
 * GET /cargoRoute/vehicles/getAllVehicles
 * Fetch all vehicles with driver info and availability
 */
export const getAllVehicles = async () => {
  try {
    const response = await apiClient.get('/cargoRoute/vehicles/getAllVehicles', { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('API Error fetching vehicles:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};
 
/**
 * GET /cargoRoute/vehicles/getVehicle/:id
 * Fetch a specific vehicle by ID
 */
export const getVehicleById = (id) =>
  apiClient.get(`/cargoRoute/vehicles/getVehicle/${id}`, { headers: authHeader() }).then(r => r.data);
 
/**
 * POST /cargoRoute/vehicles/createNewVehicle
 * Create a new vehicle
 */
export const createVehicle = (vehicleData) =>
  apiClient.post(`/cargoRoute/vehicles/createNewVehicle`, vehicleData, { headers: authHeader() }).then(r => r.data);
 
/**
 * PUT /cargoRoute/vehicles/updateVehicle/:id
 * Update vehicle information
 */
export const updateVehicle = (id, vehicleData) =>
  apiClient.put(`/cargoRoute/vehicles/updateVehicle/${id}`, vehicleData, { headers: authHeader() }).then(r => r.data);
 
/**
 * DELETE /cargoRoute/vehicles/deleteVehicle/:id
 * Delete a vehicle
 */
export const deleteVehicle = (id) =>
  apiClient.delete(`/cargoRoute/vehicles/deleteVehicle/${id}`, { headers: authHeader() }).then(r => r.data);
 
/**
 * GET /cargoRoute/vehicleAvailability/getAvailabilityByVehicle/:vehicleId
 * Get vehicle availability information
 */
export const getVehicleAvailability = (vehicleId) =>
  apiClient.get(`/cargoRoute/vehicleAvailability/vehicle/${vehicleId}`, { headers: authHeader() }).then(r => r.data);
 
/**
 * GET /drivers
 * Fetch available drivers from DispatchService
 */
export const getAvailableDrivers = async () => {
  const endpoints = [
    '/drivers',
    '/drivers/getAllDrivers',
    '/cargoRoute/drivers',
    '/cargoRoute/drivers/getAllDrivers',
  ];
 
  let lastError;
  for (const endpoint of endpoints) {
    try {
      const response = await dispatchClient.get(endpoint);
      const drivers = Array.isArray(response.data) ? response.data : [];
      return drivers.filter((d) => (d.status || '').toUpperCase() === 'AVAILABLE');
    } catch (error) {
      lastError = error;
    }
  }
 
  throw lastError;
};
 
 