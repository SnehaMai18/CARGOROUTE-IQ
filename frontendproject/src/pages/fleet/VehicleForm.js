import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getVehicleById, createVehicle, updateVehicle, getAvailableDrivers } from '../../api/fleetApi';
import '../../styles/Fleet.css';
import '../../styles/Bookings.css';
 
export default function VehicleForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [formData, setFormData] = useState({
    regNumber: '',
    type: 'TRUCK',
    maxWeightKg: '',
    maxVolumeM3: '',
    status: 'ACTIVE',
    driverID: '',
    lastMaintenanceAt: '',
    availabilities: [],
  });
 
  const toDateInputValue = (value) => {
    if (!value) return '';
    const raw = String(value);
    const datePart = raw.includes('T') ? raw.split('T')[0] : raw.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : '';
  };
 
  const toDateTimeInputValue = (value) => {
    if (!value) return '';
    const raw = String(value).replace(' ', 'T');
    return raw.length >= 16 ? raw.slice(0, 16) : '';
  };
 
  const toLocalDateTime = (value) => {
    if (!value) return null;
    return value.length === 16 ? `${value}:00` : value;
  };
 
  const isAvailabilityRowBlank = (row) => {
    if (!row) return true;
    return !row.date && !row.startTime && !row.endTime && !row.status && !row.reasonNote;
  };
 
  const fetchAvailableDrivers = useCallback(async () => {
    try {
      setDriversLoading(true);
      const drivers = await getAvailableDrivers();
      setAvailableDrivers(drivers);
    } catch (err) {
      console.error('Error fetching available drivers:', err);
      setAvailableDrivers([]);
    } finally {
      setDriversLoading(false);
    }
  }, []);
 
  const fetchVehicle = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getVehicleById(id);
      setFormData({
        regNumber: data.regNumber || '',
        type: data.type || 'TRUCK',
        maxWeightKg: data.maxWeightKg || '',
        maxVolumeM3: data.maxVolumeM3 || '',
        status: (data.status || 'ACTIVE').toUpperCase(),
        driverID: data.driverID || '',
        lastMaintenanceAt: data.lastMaintenanceAt ? data.lastMaintenanceAt.slice(0, 10) : '',
        availabilities: Array.isArray(data.availabilities)
          ? data.availabilities.map((av) => ({
              date: toDateInputValue(av.date || av.startTime),
              startTime: toDateTimeInputValue(av.startTime),
              endTime: toDateTimeInputValue(av.endTime),
              status: (av.status || 'AVAILABLE').toUpperCase(),
              reasonNote: av.reasonNote || '',
            }))
          : [],
      });
    } catch (err) {
      console.error('Error fetching vehicle:', err);
      setError('Failed to load vehicle data');
    } finally {
      setLoading(false);
    }
  }, [id]);
 
  useEffect(() => {
    if (isEdit && id) fetchVehicle();
  }, [id, isEdit, fetchVehicle]);
 
  useEffect(() => {
    fetchAvailableDrivers();
  }, [fetchAvailableDrivers]);
 
  const validators = {
    regNumber: (val) => {
      if (!val.trim()) return 'Registration number is required.';
      if (!/^[A-Za-z0-9-]+$/.test(val))
        return `Invalid character detected. Only letters, numbers and hyphens (-) are allowed.`;
      if (val.length < 3) return 'Must be at least 3 characters.';
      if (val.length > 20) return 'Cannot exceed 20 characters.';
      return '';
    },
    maxWeightKg: (val) => {
      if (val === '' || val === null) return 'Max weight is required.';
      if (isNaN(val) || Number(val) < 100) return 'Weight must be at least 100 kg.';
      if (Number(val) > 100000) return 'Weight cannot exceed 100,000 kg.';
      return '';
    },
    maxVolumeM3: (val) => {
      if (val === '' || val === null) return 'Max volume is required.';
      if (isNaN(val) || Number(val) < 1) return 'Volume must be at least 1 m³.';
      if (Number(val) > 1000) return 'Volume cannot exceed 1,000 m³.';
      return '';
    },
    driverID: (val) => {
      if (val === '' || val === null) return '';
      if (isNaN(val) || !Number.isInteger(Number(val)) || Number(val) <= 0)
        return 'Driver ID must be a positive whole number.';
      return '';
    },
  };
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
     if (name === 'driverID' && value === '') {
      alert('Assign a driver first');
    }
    if (validators[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: validators[name](value) }));
    }
  };
 
  const handleAvailabilityChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      availabilities: prev.availabilities.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      ),
    }));
 
    const key = `availability-${index}`;
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };
 
  const addAvailabilityRow = () => {
    setFormData((prev) => ({
      ...prev,
      availabilities: [
        ...prev.availabilities,
        {
          date: '',
          startTime: '',
          endTime: '',
          status: 'AVAILABLE',
          reasonNote: '',
        },
      ],
    }));
  };
 
  const removeAvailabilityRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      availabilities: prev.availabilities.filter((_, rowIndex) => rowIndex !== index),
    }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[`availability-${index}`];
      return next;
    });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Run all validations
    const errors = {};
    Object.keys(validators).forEach(field => {
      const msg = validators[field](formData[field]);
      if (msg) errors[field] = msg;
    });
 
    const validAvailabilities = [];
    (formData.availabilities || []).forEach((row, index) => {
      if (isAvailabilityRowBlank(row)) return;
      if (!row.date || !row.startTime || !row.endTime || !row.status) {
        errors[`availability-${index}`] = 'Date, start, end and status are required.';
        return;
      }
      if (new Date(row.endTime) < new Date(row.startTime)) {
        errors[`availability-${index}`] = 'End time must be later than start time.';
        return;
      }
      validAvailabilities.push({
        date: `${row.date}T00:00:00`,
        startTime: toLocalDateTime(row.startTime),
        endTime: toLocalDateTime(row.endTime),
        status: row.status.toUpperCase(),
        reasonNote: row.reasonNote?.trim() || null,
      });
    });
 
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setSubmitting(true);
    setError(null);
    const dataToSubmit = {
      regNumber: formData.regNumber.trim(),
      type: formData.type,
      maxWeightKg: parseFloat(formData.maxWeightKg),
      maxVolumeM3: parseFloat(formData.maxVolumeM3),
      status: formData.status.toUpperCase(),
      driverID: formData.driverID ? parseInt(formData.driverID) : null,
      lastMaintenanceAt: formData.lastMaintenanceAt ? `${formData.lastMaintenanceAt}T00:00:00` : null,
      availabilities: validAvailabilities,
    };
    try {
      if (isEdit && id) {
        await updateVehicle(id, dataToSubmit);
      } else {
        await createVehicle(dataToSubmit);
      }
      navigate('/fleet/vehicles');
    } catch (err) {
      console.error('Error saving vehicle:', err);
      setError(err.response?.data?.message || 'Failed to save vehicle. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
 
  if (loading) {
    return (
      <Layout>
        <div className="fleet-container">
          <div className="loading">Loading...</div>
        </div>
      </Layout>
    );
  }
 
  return (
    <Layout>
      <div className="booking-form-page">

        {/* ── Page Header ── */}
        <div className="form-page-header">
          <button className="back-btn" onClick={() => navigate('/fleet/vehicles')}>←</button>
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h1>
            <p className="page-subtitle">
              {isEdit ? 'Update vehicle details and availability' : 'Register a new vehicle in the fleet'}
            </p>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="regNumber">Registration Number *</label>
            <input
              type="text"
              id="regNumber"
              name="regNumber"
              value={formData.regNumber}
              onChange={handleChange}
              placeholder="e.g., TN-01-AB-1234"
              className={`form-input ${fieldErrors.regNumber ? 'input-error' : ''}`}
            />
            {fieldErrors.regNumber && <span className="field-error">{fieldErrors.regNumber}</span>}
          </div>
 
          {/* Vehicle Type */}
          <div className="form-group">
            <label htmlFor="type">Vehicle Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="VAN">Van</option>
              <option value="TRUCK">Truck</option>
              <option value="TRAILER">Trailer</option>
            </select>
          </div>
 
          {/* Max Weight */}
          <div className="form-group">
            <label htmlFor="maxWeightKg">Max Weight (kg) *</label>
            <input
              type="number"
              id="maxWeightKg"
              name="maxWeightKg"
              value={formData.maxWeightKg}
              onChange={handleChange}
              placeholder="e.g., 5000"
              min="100"
              className={`form-input ${fieldErrors.maxWeightKg ? 'input-error' : ''}`}
            />
            {fieldErrors.maxWeightKg && <span className="field-error">{fieldErrors.maxWeightKg}</span>}
          </div>
 
          {/* Max Volume */}
          <div className="form-group">
            <label htmlFor="maxVolumeM3">Max Volume (m³) *</label>
            <input
              type="number"
              id="maxVolumeM3"
              name="maxVolumeM3"
              value={formData.maxVolumeM3}
              onChange={handleChange}
              placeholder="e.g., 40"
              min="1"
              className={`form-input ${fieldErrors.maxVolumeM3 ? 'input-error' : ''}`}
            />
            {fieldErrors.maxVolumeM3 && <span className="field-error">{fieldErrors.maxVolumeM3}</span>}
          </div>
 
          {/* Status */}
          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="ACTIVE">Active</option>
              <option value="UNAVAILABLE">Unavailable</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
 
          {/* Last Maintenance Date */}
          <div className="form-group">
            <label htmlFor="lastMaintenanceAt">Last Maintenance Date</label>
            <input
              type="date"
              id="lastMaintenanceAt"
              name="lastMaintenanceAt"
              value={formData.lastMaintenanceAt}
              onChange={handleChange}
              className="form-input"
            />
          </div>
 
          {/* Driver ID */}
          <div className="form-group">
            <label htmlFor="driverID">Assigned Driver</label>
            <select
              id="driverID"
              name="driverID"
              value={formData.driverID}
              onChange={handleChange}
              className={`form-input ${fieldErrors.driverID ? 'input-error' : ''}`}
            >
              <option value="">Unassigned</option>
              {driversLoading && <option value="">Loading available drivers...</option>}
              {!driversLoading && formData.driverID && !availableDrivers.some((d) => String(d.driverID) === String(formData.driverID)) && (
                <option value={formData.driverID}>Current Driver (ID: {formData.driverID})</option>
              )}
              {!driversLoading && availableDrivers.map((driver) => (
                <option key={driver.driverID} value={driver.driverID}>
                  {driver.name} (ID: {driver.driverID})
                </option>
              ))}
            </select>
            {fieldErrors.driverID && <span className="field-error">{fieldErrors.driverID}</span>}
          </div>
 
          <div className="form-group vehicle-availability-form-group">
            <div className="vehicle-availability-header">
              <label>Vehicle Availabilities</label>
              <button
                type="button"
                className="btn-add-inline"
                onClick={addAvailabilityRow}
              >
                + Add Availability
              </button>
            </div>
 
            {formData.availabilities.length > 0 ? (
              <div className="avail-table-wrap">
                <table className="avail-mini-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Status</th>
                      <th>Reason</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.availabilities.map((row, index) => (
                      <tr key={`availability-row-${index}`}>
                        <td>
                          <input
                            type="date"
                            className="form-input table-input"
                            value={row.date}
                            onChange={(e) => handleAvailabilityChange(index, 'date', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="datetime-local"
                            className="form-input table-input"
                            value={row.startTime}
                            onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="datetime-local"
                            className="form-input table-input"
                            value={row.endTime}
                            onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)}
                          />
                        </td>
                        <td>
                          <select
                            className="form-input table-input"
                            value={row.status}
                            onChange={(e) => handleAvailabilityChange(index, 'status', e.target.value)}
                          >
                            <option value="AVAILABLE">Available</option>
                            <option value="UNAVAILABLE">Unavailable</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="PENDING">Pending</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-input table-input"
                            placeholder="Optional note"
                            value={row.reasonNote}
                            onChange={(e) => handleAvailabilityChange(index, 'reasonNote', e.target.value)}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-remove-inline"
                            onClick={() => removeAvailabilityRow(index)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="availability-hint">No availabilities added yet.</p>
            )}
 
            {Object.entries(fieldErrors)
              .filter(([key, value]) => key.startsWith('availability-') && value)
              .map(([key, value]) => (
                <span key={key} className="field-error">{value}</span>
              ))}
          </div>
 
          {/* Actions - full width */}
          <div className="form-footer">
            <div className="form-footer-spacer" />
            <div className="form-footer-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  // Reset form logic here
                  if (isEdit) {
                    // For edit, maybe reload data or reset to original
                    window.location.reload();
                  } else {
                    setFormData({
                      regNumber: '',
                      type: 'TRUCK',
                      maxWeightKg: '',
                      maxVolumeM3: '',
                      status: 'ACTIVE',
                      driverID: '',
                      lastMaintenanceAt: '',
                      availabilities: [],
                    });
                    setFieldErrors({});
                  }
                }}
                disabled={submitting}
              >
                Reset
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : isEdit ? 'Save' : 'Add'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </Layout>
  );
}
 
 