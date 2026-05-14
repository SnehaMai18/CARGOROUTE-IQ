import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { createLoad, getLoadById, updateLoad } from '../../api/routingApi';
import { getAllVehicles } from '../../api/fleetApi';
import '../../styles/Fleet.css';
import '../../styles/Routing.css';
import '../../styles/Bookings.css';
 
export default function LoadForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const createEmptyBooking = () => ({
    bookingID: '',
    shipperID: '',
    originSiteID: '',
    destinationSiteID: '',
    pickupWindowStart: '',
    pickupWindowEnd: '',
    deliveryWindowStart: '',
    deliveryWindowEnd: '',
    weightKg: '',
    volumeM3: '',
    pieces: '',
    commodity: '',
    specialHandlingFlags: '',
    status: 'PENDING',
  });
 
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [formData, setFormData] = useState({
    loadCode: '',
    vehicleId: '',
    totalWeightKg: '',
    totalVolumeM3: '',
    plannedStart: '',
    plannedEnd: '',
    status: 'PENDING',
    bookingItems: [createEmptyBooking()],
  });
 
  const fetchVehicles = useCallback(async () => {
    try {
      setVehiclesLoading(true);
      const data = await getAllVehicles();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setVehicles([]);
    } finally {
      setVehiclesLoading(false);
    }
  }, []);
 
  const fetchLoad = useCallback(async () => {
    if (!isEdit || !id) return;
    try {
      setLoading(true);
      const raw = await getLoadById(id);
      const data = raw?.load ? raw.load : raw;
      const normalized = {
        loadCode: data.loadCode || '',
        vehicleId: data.vehicleID || '',
        totalWeightKg: data.totalWeightKg || '',
        totalVolumeM3: data.totalVolumeM3 || '',
        plannedStart: data.plannedStart ? data.plannedStart.slice(0, 16) : '',
        plannedEnd: data.plannedEnd ? data.plannedEnd.slice(0, 16) : '',
        status: data.status || 'PENDING',
        bookingItems: data.bookingsJSON ? JSON.parse(data.bookingsJSON) : [createEmptyBooking()],
      };
      setFormData(normalized);
    } catch (err) {
      console.error('Error fetching load:', err);
      setError('Failed to load load data');
    } finally {
      setLoading(false);
    }
  }, [isEdit, id]);

  useEffect(() => {
    fetchVehicles();
    if (isEdit) {
      fetchLoad();
    }
  }, [fetchVehicles, fetchLoad, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validators[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validators[name](value, { ...formData, [name]: value }) }));
    }
  };

  const handleBookingChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      bookingItems: prev.bookingItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addBookingRow = () => {
    setFormData((prev) => ({
      ...prev,
      bookingItems: [...prev.bookingItems, createEmptyBooking()],
    }));
  };
 
  const removeBookingRow = (index) => {
    setFormData((prev) => {
      const nextItems = prev.bookingItems.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...prev,
        bookingItems: nextItems.length > 0 ? nextItems : [createEmptyBooking()],
      };
    });
  };
 
  const isBookingRowBlank = (item) => {
    if (!item) return true;
    return Object.entries(item).every(([key, value]) => {
      if (key === 'status') return !value || value === 'PENDING';
      return value === '' || value === null || value === undefined;
    });
  };
 
  const toNumberOrNull = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };
 
  const validators = {
    loadCode: (val) => {
      if (!val || !val.trim()) return 'Load code is required.';
      if (val.trim().length < 3) return 'Load code must be at least 3 characters.';
      return '';
    },
    vehicleId: (val) => {
      if (val === '' || val === null) return 'Vehicle is required.';
      if (!Number.isInteger(Number(val)) || Number(val) <= 0) return 'Please select a valid vehicle.';
      return '';
    },
    totalWeightKg: (val) => {
      if (val === '' || val === null) return 'Total weight is required.';
      if (isNaN(val) || Number(val) <= 0) return 'Total weight must be greater than 0.';
      return '';
    },
    totalVolumeM3: (val) => {
      if (val === '' || val === null) return 'Total volume is required.';
      if (isNaN(val) || Number(val) <= 0) return 'Total volume must be greater than 0.';
      return '';
    },
    plannedEnd: (val, data) => {
      if (!val || !data.plannedStart) return '';
      return new Date(val) < new Date(data.plannedStart) ? 'Planned end cannot be before planned start.' : '';
    },
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    const errors = {};
    Object.keys(validators).forEach((field) => {
      const msg = validators[field](formData[field], formData);
      if (msg) errors[field] = msg;
    });
 
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please correct the highlighted fields.');
      return;
    }
 
    try {
      setSubmitting(true);
      setError(null);
 
      const bookingItems = (formData.bookingItems || [])
        .filter((item) => !isBookingRowBlank(item))
        .map((item) => ({
          bookingID: toNumberOrNull(item.bookingID),
          shipperID: toNumberOrNull(item.shipperID),
          originSiteID: toNumberOrNull(item.originSiteID),
          destinationSiteID: toNumberOrNull(item.destinationSiteID),
          pickupWindowStart: item.pickupWindowStart || null,
          pickupWindowEnd: item.pickupWindowEnd || null,
          deliveryWindowStart: item.deliveryWindowStart || null,
          deliveryWindowEnd: item.deliveryWindowEnd || null,
          weightKg: toNumberOrNull(item.weightKg),
          volumeM3: toNumberOrNull(item.volumeM3),
          pieces: toNumberOrNull(item.pieces),
          commodity: item.commodity?.trim() || null,
          specialHandlingFlags: item.specialHandlingFlags?.trim() || null,
          status: item.status || 'PENDING',
        }));
 
      const payload = {
        loadCode: formData.loadCode.trim(),
        vehicleID: Number(formData.vehicleId),
        totalWeightKg: Number(formData.totalWeightKg),
        totalVolumeM3: Number(formData.totalVolumeM3),
        plannedStart: formData.plannedStart || null,
        plannedEnd: formData.plannedEnd || null,
        status: formData.status,
        bookingsJSON: bookingItems.length > 0 ? JSON.stringify(bookingItems) : '',
      };
 
      if (isEdit && id) {
        await updateLoad(id, payload);
      } else {
        await createLoad(payload);
      }
      navigate('/routing/load-planning');
    } catch (err) {
      const apiMessage = err?.response?.data?.message || err?.response?.data?.error || err?.response?.data;
      setError(typeof apiMessage === 'string' ? apiMessage : isEdit ? 'Failed to update load. Please try again.' : 'Failed to create load. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="routing-container">
          <div className="loading-spinner">Loading load details...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="booking-form-page">

        {/* ── Page Header ── */}
        <div className="form-page-header">
          <button className="back-btn" onClick={() => navigate('/routing/load-planning')}>←</button>
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Load' : 'Create New Load'}</h1>
            <p className="page-subtitle">
              {isEdit ? 'Update load details and booking assignments' : 'Plan a new load with vehicle assignment and booking items'}
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
            <label htmlFor="loadCode">Load Code *</label>
            <input
              id="loadCode"
              name="loadCode"
              className={`form-input ${fieldErrors.loadCode ? 'input-error' : ''}`}
              type="text"
              value={formData.loadCode}
              onChange={handleChange}
              placeholder="e.g., LOAD-1001"
              required
            />
            {fieldErrors.loadCode && <span className="field-error">{fieldErrors.loadCode}</span>}
          </div>
 
          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              className="form-input"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="PLANNED">Planned</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
 
          <div className="form-group">
            <label htmlFor="vehicleId">Vehicle *</label>
            <select
              id="vehicleId"
              name="vehicleId"
              className={`form-input ${fieldErrors.vehicleId ? 'input-error' : ''}`}
              value={formData.vehicleId}
              onChange={handleChange}
              disabled={vehiclesLoading}
              required
            >
              <option value="">{vehiclesLoading ? 'Loading vehicles...' : 'Select a vehicle'}</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.vehicleID} value={vehicle.vehicleID}>
                  {vehicle.regNumber || `Vehicle ${vehicle.vehicleID}`} - {vehicle.type || 'N/A'}
                </option>
              ))}
            </select>
            {!vehiclesLoading && vehicles.length === 0 && (
              <span className="field-error">No vehicles available. Please add a vehicle first.</span>
            )}
            {fieldErrors.vehicleId && <span className="field-error">{fieldErrors.vehicleId}</span>}
          </div>
 
          <div className="form-group">
            <label htmlFor="totalWeightKg">Total Weight (kg) *</label>
            <input
              id="totalWeightKg"
              name="totalWeightKg"
              className={`form-input ${fieldErrors.totalWeightKg ? 'input-error' : ''}`}
              type="number"
              min="0.1"
              step="0.1"
              value={formData.totalWeightKg}
              onChange={handleChange}
              required
            />
            {fieldErrors.totalWeightKg && <span className="field-error">{fieldErrors.totalWeightKg}</span>}
          </div>
 
          <div className="form-group">
            <label htmlFor="totalVolumeM3">Total Volume (m³) *</label>
            <input
              id="totalVolumeM3"
              name="totalVolumeM3"
              className={`form-input ${fieldErrors.totalVolumeM3 ? 'input-error' : ''}`}
              type="number"
              min="0.01"
              step="0.01"
              value={formData.totalVolumeM3}
              onChange={handleChange}
              required
            />
            {fieldErrors.totalVolumeM3 && <span className="field-error">{fieldErrors.totalVolumeM3}</span>}
          </div>
 
          <div className="form-group">
            <label htmlFor="plannedStart">Planned Start</label>
            <input
              id="plannedStart"
              name="plannedStart"
              className="form-input"
              type="datetime-local"
              value={formData.plannedStart}
              onChange={handleChange}
            />
          </div>
 
          <div className="form-group">
            <label htmlFor="plannedEnd">Planned End</label>
            <input
              id="plannedEnd"
              name="plannedEnd"
              className={`form-input ${fieldErrors.plannedEnd ? 'input-error' : ''}`}
              type="datetime-local"
              value={formData.plannedEnd}
              onChange={handleChange}
            />
            {fieldErrors.plannedEnd && <span className="field-error">{fieldErrors.plannedEnd}</span>}
          </div>
 
          <div className="detail-card bookings-card" style={{ gridColumn: '1 / -1' }}>
            <h3>Bookings</h3>
            <div className="vehicle-availability-header" style={{ marginBottom: '12px' }}>
              <span className="label">Add booking rows</span>
              <button type="button" className="btn-add-inline" onClick={addBookingRow}>+ Add Booking</button>
            </div>
 
            <div className="booking-table-wrap">
              <table className="booking-mini-table booking-form-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Shipper ID</th>
                    <th>Origin Site ID</th>
                    <th>Destination Site ID</th>
                    <th>Pickup Start</th>
                    <th>Pickup End</th>
                    <th>Delivery Start</th>
                    <th>Delivery End</th>
                    <th>Weight Kg</th>
                    <th>Volume m3</th>
                    <th>Pieces</th>
                    <th>Commodity</th>
                    <th>Special Handling Flags</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.bookingItems.map((item, index) => (
                    <tr key={`booking-input-${index}`}>
                      <td><input className="form-input booking-cell-input" type="number" placeholder="1001" value={item.bookingID} onChange={(e) => handleBookingChange(index, 'bookingID', e.target.value)} /></td>
                      <td><input className="form-input booking-cell-input" type="number" placeholder="501" value={item.shipperID} onChange={(e) => handleBookingChange(index, 'shipperID', e.target.value)} /></td>
                      <td><input className="form-input booking-cell-input" type="number" placeholder="21" value={item.originSiteID} onChange={(e) => handleBookingChange(index, 'originSiteID', e.target.value)} /></td>
                      <td><input className="form-input booking-cell-input" type="number" placeholder="45" value={item.destinationSiteID} onChange={(e) => handleBookingChange(index, 'destinationSiteID', e.target.value)} /></td>
                      <td><input className="form-input booking-cell-input" type="datetime-local" title="Example: 2026-04-21T09:00" value={item.pickupWindowStart} onChange={(e) => handleBookingChange(index, 'pickupWindowStart', e.target.value)} /></td>
                      <td><input className="form-input booking-cell-input" type="datetime-local" title="Example: 2026-04-21T12:00" value={item.pickupWindowEnd} onChange={(e) => handleBookingChange(index, 'pickupWindowEnd', e.target.value)} /></td>
                      <td><input className="form-input booking-cell-input" type="datetime-local" title="Example: 2026-04-22T10:00" value={item.deliveryWindowStart} onChange={(e) => handleBookingChange(index, 'deliveryWindowStart', e.target.value)} /></td>
                      <td><input className="form-input booking-cell-input" type="datetime-local" title="Example: 2026-04-22T16:00" value={item.deliveryWindowEnd} onChange={(e) => handleBookingChange(index, 'deliveryWindowEnd', e.target.value)} /></td>
                      <td><input className="form-input booking-cell-input" type="number" step="0.01" placeholder="1250.50" value={item.weightKg} onChange={(e) => handleBookingChange(index, 'weightKg', e.target.value)} /></td>
                      <td><input className="form-input booking-cell-input" type="number" step="0.01" placeholder="8.75" value={item.volumeM3} onChange={(e) => handleBookingChange(index, 'volumeM3', e.target.value)} /></td>
                      <td><input className="form-input booking-cell-input" type="number" placeholder="24" value={item.pieces} onChange={(e) => handleBookingChange(index, 'pieces', e.target.value)} /></td>
                      <td><input className="form-input booking-cell-input" type="text" placeholder="Electronics" value={item.commodity} onChange={(e) => handleBookingChange(index, 'commodity', e.target.value)} /></td>
                      <td><input className="form-input booking-cell-input" type="text" placeholder="FRAGILE,TEMPERATURE_CONTROLLED" value={item.specialHandlingFlags} onChange={(e) => handleBookingChange(index, 'specialHandlingFlags', e.target.value)} /></td>
                      <td>
                        <select className="form-input booking-cell-input" value={item.status} onChange={(e) => handleBookingChange(index, 'status', e.target.value)}>
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button type="button" className="btn-remove-inline" onClick={() => removeBookingRow(index)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
 
          <div className="form-footer">
            <div className="form-footer-spacer" />
            <div className="form-footer-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setFormData({
                    loadCode: '',
                    vehicleId: '',
                    totalWeightKg: '',
                    totalVolumeM3: '',
                    plannedStart: '',
                    plannedEnd: '',
                    status: 'PENDING',
                    bookingItems: [createEmptyBooking()],
                  });
                  setFieldErrors({});
                  setError(null);
                }}
                disabled={submitting}
              >
                Reset
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create Load'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
 
 