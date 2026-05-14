import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getRouteById, createRoute, updateRoute, getAllLoads, getAllRoutes } from '../../api/routingApi';
import '../../styles/Routing.css';
import '../../styles/Bookings.css';

const createEmptyStop = () => ({
  stopID: '',
  location: '',
  eta: '',
  action: '',
});

const parseStopsFromSequenceJSON = (sequenceJSON) => {
  if (!sequenceJSON || !sequenceJSON.trim()) return [createEmptyStop()];

  try {
    const parsed = JSON.parse(sequenceJSON);
    const stops = Array.isArray(parsed?.stops) ? parsed.stops : [];
    if (stops.length === 0) return [createEmptyStop()];

    return stops.map((stop) => ({
      stopID: stop?.stopID ?? '',
      location: stop?.location ?? '',
      eta: stop?.eta ? String(stop.eta).slice(0, 16) : '',
      action: stop?.action ?? '',
    }));
  } catch {
    return [createEmptyStop()];
  }
};

export default function RouteForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [availableLoads, setAvailableLoads] = useState([]);
  const [loadsLoading, setLoadsLoading] = useState(false);
  const [sequenceStops, setSequenceStops] = useState([createEmptyStop()]);
  const [formData, setFormData] = useState({
    loadID: '',
    distanceKm: '',
    estimatedDurationMin: '',
    costEstimate: '',
    status: 'PLANNED',
    sequenceJSON: '',
  });

  const normalizeLoad = useCallback((item) => {
    if (!item) return null;

    const raw = item?.load
      ? { ...item.load, vehicle: item.vehicle || null }
      : item?.loadDto
      ? item.loadDto
      : item;

    const loadID = raw?.loadID ?? raw?.id ?? raw?.loadId;
    if (loadID === null || loadID === undefined) return null;

    return {
      ...raw,
      loadID,
      loadCode: raw.loadCode || raw.loadName || `LOAD-${loadID}`,
      status: raw.status || raw.loadStatus || 'UNKNOWN',
    };
  }, []);

  const isLoadAvailable = useCallback((load) => {
    const status = (load?.status || '').toUpperCase();
    return status !== 'DELIVERED' && status !== 'COMPLETED';
  }, []);

  const fetchRoute = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRouteById(id);
      setFormData({
        loadID: data.load?.loadID || '',
        distanceKm: data.distanceKm || '',
        estimatedDurationMin: data.estimatedDurationMin || '',
        costEstimate: data.costEstimate || '',
        status: (data.status || 'PLANNED').toUpperCase(),
        sequenceJSON: data.sequenceJSON || '',
      });
      setSequenceStops(parseStopsFromSequenceJSON(data.sequenceJSON || ''));
    } catch (err) {
      console.error('Error fetching route:', err);
      setError('Failed to load route data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAvailableLoads = useCallback(async () => {
    try {
      setLoadsLoading(true);
      const loads = await getAllLoads();
      const rawLoads = Array.isArray(loads)
        ? loads
        : Array.isArray(loads?.data)
        ? loads.data
        : Array.isArray(loads?.data?.content)
        ? loads.data.content
        : Array.isArray(loads?.data?.value)
        ? loads.data.value
        : Array.isArray(loads?.content)
        ? loads.content
        : Array.isArray(loads?.value)
        ? loads.value
        : [];
      const normalizedLoads = rawLoads.map(normalizeLoad).filter(Boolean);
      setAvailableLoads(normalizedLoads);
    } catch (err) {
      console.error('Error fetching loads:', err);
      try {
        const routes = await getAllRoutes();
        const routeList = Array.isArray(routes)
          ? routes
          : Array.isArray(routes?.data)
          ? routes.data
          : Array.isArray(routes?.data?.content)
          ? routes.data.content
          : Array.isArray(routes?.data?.value)
          ? routes.data.value
          : Array.isArray(routes?.content)
          ? routes.content
          : Array.isArray(routes?.value)
          ? routes.value
          : [];
        const uniqueLoads = new Map();

        routeList.forEach((route) => {
          const load = normalizeLoad(route?.load);
          if (load?.loadID !== null && load?.loadID !== undefined && !uniqueLoads.has(load.loadID)) {
            uniqueLoads.set(load.loadID, load);
          }
        });

        setAvailableLoads(Array.from(uniqueLoads.values()));
      } catch (fallbackErr) {
        console.error('Error fetching fallback loads from routes:', fallbackErr);
        setAvailableLoads([]);
      }
    } finally {
      setLoadsLoading(false);
    }
  }, [normalizeLoad]);

  useEffect(() => {
    if (isEdit && id) fetchRoute();
    fetchAvailableLoads();
  }, [id, isEdit, fetchRoute, fetchAvailableLoads]);

  const validators = {
    loadID: (val) => {
      if (!val || val === '') return 'Load is required.';
      if (!availableLoads.some((load) => String(load.loadID) === String(val))) {
        return 'Please select a valid load from the list.';
      }
      return '';
    },
    distanceKm: (val) => {
      if (val === '' || val === null) return 'Distance is required.';
      if (isNaN(val) || Number(val) < 0) return 'Distance must be a positive number.';
      return '';
    },
    estimatedDurationMin: (val) => {
      if (val === '' || val === null) return 'Duration is required.';
      if (isNaN(val) || Number(val) < 0) return 'Duration must be a positive number.';
      return '';
    },
    costEstimate: (val) => {
      if (val === '' || val === null) return 'Cost estimate is required.';
      if (isNaN(val) || Number(val) < 0) return 'Cost must be a positive number.';
      return '';
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validators[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: validators[name](value) }));
    }
  };

  const handleStopChange = (index, field, value) => {
    setSequenceStops((prev) =>
      prev.map((stop, i) => (i === index ? { ...stop, [field]: value } : stop))
    );
  };

  const addStopRow = () => {
    setSequenceStops((prev) => [...prev, createEmptyStop()]);
  };

  const removeStopRow = (index) => {
    setSequenceStops((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [createEmptyStop()];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    Object.keys(validators).forEach(field => {
      const msg = validators[field](formData[field]);
      if (msg) errors[field] = msg;
    });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setSubmitting(true);
    setError(null);

    const normalizedStops = sequenceStops
      .filter((stop) => stop.stopID || stop.location || stop.eta || stop.action)
      .map((stop) => ({
        stopID: stop.stopID === '' ? null : Number(stop.stopID),
        location: stop.location || null,
        eta: stop.eta ? `${stop.eta}:00` : null,
        action: stop.action || null,
      }));

    const dataToSubmit = {
      load: { loadID: parseInt(formData.loadID, 10) },
      distanceKm: parseFloat(formData.distanceKm),
      estimatedDurationMin: parseInt(formData.estimatedDurationMin),
      costEstimate: parseFloat(formData.costEstimate),
      status: formData.status.toUpperCase(),
      sequenceJSON: normalizedStops.length > 0 ? JSON.stringify({ stops: normalizedStops }) : '',
    };
    try {
      if (isEdit && id) {
        await updateRoute(id, dataToSubmit);
      } else {
        await createRoute(dataToSubmit);
      }
      navigate('/routing/routes');
    } catch (err) {
      console.error('Error saving route:', err);
      setError(err.response?.data?.message || 'Failed to save route. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="routing-container">
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
          <button className="back-btn" onClick={() => navigate('/routing/routes')}>←</button>
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Route' : 'Create Route'}</h1>
            <p className="page-subtitle">
              {isEdit ? 'Update route details and sequence' : 'Plan a new transportation route'}
            </p>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Load */}
          <div className="form-group">
            <label htmlFor="loadID">Load *</label>
            <select
              id="loadID"
              name="loadID"
              value={formData.loadID}
              onChange={handleChange}
              required
              className={`form-input ${fieldErrors.loadID ? 'input-error' : ''}`}
            >
              <option value="">Select a load</option>
              {loadsLoading && <option value="" disabled>Loading loads...</option>}
              {!loadsLoading && availableLoads.length === 0 && (
                <option value="" disabled>No available loads found</option>
              )}
              {!loadsLoading && availableLoads.map((load) => {
                const disabled = !isLoadAvailable(load);
                return (
                  <option key={load.loadID} value={load.loadID} disabled={disabled}>
                    {load.loadCode || `LOAD-${load.loadID}`} (ID: {load.loadID}){load.status ? ` — ${load.status}` : ''}
                    {disabled ? ' (Not routable)' : ''}
                  </option>
                );
              })}
            </select>
            {fieldErrors.loadID && <span className="field-error">{fieldErrors.loadID}</span>}
          </div>

          {/* Distance */}
          <div className="form-group">
            <label htmlFor="distanceKm">Distance (km) *</label>
            <input
              type="number"
              id="distanceKm"
              name="distanceKm"
              value={formData.distanceKm}
              onChange={handleChange}
              placeholder="e.g., 250.5"
              step="0.1"
              className={`form-input ${fieldErrors.distanceKm ? 'input-error' : ''}`}
            />
            {fieldErrors.distanceKm && <span className="field-error">{fieldErrors.distanceKm}</span>}
          </div>

          {/* Duration */}
          <div className="form-group">
            <label htmlFor="estimatedDurationMin">Estimated Duration (minutes) *</label>
            <input
              type="number"
              id="estimatedDurationMin"
              name="estimatedDurationMin"
              value={formData.estimatedDurationMin}
              onChange={handleChange}
              placeholder="e.g., 180"
              className={`form-input ${fieldErrors.estimatedDurationMin ? 'input-error' : ''}`}
            />
            {fieldErrors.estimatedDurationMin && <span className="field-error">{fieldErrors.estimatedDurationMin}</span>}
          </div>

          {/* Cost Estimate */}
          <div className="form-group">
            <label htmlFor="costEstimate">Cost Estimate (₹) *</label>
            <input
              type="number"
              id="costEstimate"
              name="costEstimate"
              value={formData.costEstimate}
              onChange={handleChange}
              placeholder="e.g., 5000"
              step="0.01"
              className={`form-input ${fieldErrors.costEstimate ? 'input-error' : ''}`}
            />
            {fieldErrors.costEstimate && <span className="field-error">{fieldErrors.costEstimate}</span>}
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
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Sequence Stops */}
          <div className="form-group sequence-form-group">
            <label>Sequence Stops (Optional)</label>
            <div className="sequence-card">
              <div className="sequence-table-wrap">
                <table className="sequence-table">
                  <thead>
                    <tr>
                      <th>Stop ID</th>
                      <th>Location</th>
                      <th>ETA</th>
                      <th>Action</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sequenceStops.map((stop, index) => (
                      <tr key={`stop-${index}`}>
                        <td>
                          <input
                            type="number"
                            value={stop.stopID}
                            onChange={(e) => handleStopChange(index, 'stopID', e.target.value)}
                            className="sequence-input"
                            placeholder="1"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={stop.location}
                            onChange={(e) => handleStopChange(index, 'location', e.target.value)}
                            className="sequence-input"
                            placeholder="HYD01"
                          />
                        </td>
                        <td>
                          <input
                            type="datetime-local"
                            value={stop.eta}
                            onChange={(e) => handleStopChange(index, 'eta', e.target.value)}
                            className="sequence-input"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={stop.action}
                            onChange={(e) => handleStopChange(index, 'action', e.target.value)}
                            className="sequence-input"
                            placeholder="Pickup / Delivery"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="sequence-remove-btn"
                            onClick={() => removeStopRow(index)}
                            title="Remove stop"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button type="button" className="sequence-add-btn" onClick={addStopRow}>
                + Add Stop
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="form-footer">
            <div className="form-footer-spacer" />
            <div className="form-footer-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (isEdit) {
                    // Reset to original
                    window.location.reload();
                  } else {
                    setFormData({
                      loadID: '',
                      distanceKm: '',
                      estimatedDurationMin: '',
                      costEstimate: '',
                      status: 'PLANNED',
                      sequenceJSON: '',
                    });
                    setSequenceStops([createEmptyStop()]);
                    setFieldErrors({});
                  }
                }}
                disabled={submitting}
              >
                Reset
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : isEdit ? 'Update Route' : 'Create Route'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </Layout>
  );
}
