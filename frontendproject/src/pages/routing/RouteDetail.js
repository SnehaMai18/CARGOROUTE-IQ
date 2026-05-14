import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import ScheduleCard from '../../components/ScheduleCard';
import { getRouteById, updateRoute, deleteRoute } from '../../api/routingApi';
import { getVehicleById, getVehicleAvailability } from '../../api/fleetApi';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/Fleet.css';
import '../../styles/Routing.css';
 
const createEmptyStop = () => ({
  stopID: '',
  location: '',
  eta: '',
  action: '',
});
 
const parseStopsFromSequenceJSON = (sequenceJSON) => {
  if (!sequenceJSON || !sequenceJSON.trim()) return [createEmptyStop()];
 
  try {
    const parsed = typeof sequenceJSON === 'string' ? JSON.parse(sequenceJSON) : sequenceJSON;
    const stops = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.stops) ? parsed.stops : []);
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
 
export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [sequenceStops, setSequenceStops] = useState([createEmptyStop()]);
  const [vehicle, setVehicle] = useState(null);
  const [vehicleAvailabilities, setVehicleAvailabilities] = useState([]);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false });
 
  const fetchRoute = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getRouteById(id);
      const normalized = {
        id: data.routeID,
        routeId: data.routeID,
        loadId: data.load?.loadID || '',
        loadCode: data.load?.loadCode || '-',
        vehicleId: data.load?.vehicleID || '-',
        status: data.status || 'PLANNED',
        totalDistance: data.distanceKm || 0,
        estimatedDuration: data.estimatedDurationMin || 0,
        costEstimate: data.costEstimate || 0,
        sequenceJSON: data.sequenceJSON || '',
        plannedStart: data.load?.plannedStart || null,
        plannedEnd: data.load?.plannedEnd || null,
        totalWeightKg: data.load?.totalWeightKg || 0,
        totalVolumeM3: data.load?.totalVolumeM3 || 0,
      };
      setRoute(normalized);
      setFormData(normalized);
      setSequenceStops(parseStopsFromSequenceJSON(normalized.sequenceJSON || ''));
    } catch (err) {
      setError('Failed to load route details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);
 
  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);
 
  useEffect(() => {
    const vehicleId = route?.vehicleId;
    const numericVehicleId = Number(vehicleId);
 
    if (!vehicleId || vehicleId === '-' || !Number.isFinite(numericVehicleId)) {
      setVehicle(null);
      setVehicleAvailabilities([]);
      setVehicleLoading(false);
      return;
    }
 
    let cancelled = false;
 
    const fetchVehicle = async () => {
      setVehicleLoading(true);
      try {
        const [vehicleData, availabilityData] = await Promise.all([
          getVehicleById(numericVehicleId),
          getVehicleAvailability(numericVehicleId).catch(() => []),
        ]);
 
        const embeddedAvailabilities = Array.isArray(vehicleData?.availabilities) ? vehicleData.availabilities : [];
        const apiAvailabilities = Array.isArray(availabilityData) ? availabilityData : [];
 
        if (!cancelled) {
          setVehicle(vehicleData || null);
          setVehicleAvailabilities(apiAvailabilities.length > 0 ? apiAvailabilities : embeddedAvailabilities);
        }
      } catch (err) {
        if (!cancelled) {
          setVehicle(null);
          setVehicleAvailabilities([]);
        }
        console.warn('Could not fetch vehicle details for route:', err);
      } finally {
        if (!cancelled) {
          setVehicleLoading(false);
        }
      }
    };
 
    fetchVehicle();
 
    return () => {
      cancelled = true;
    };
  }, [route?.vehicleId]);
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
 
  const doSubmit = async () => {
    try {
      const distanceKm =
        formData.totalDistance === '' || formData.totalDistance === null || formData.totalDistance === undefined
          ? Number(route.totalDistance || 0)
          : Number(formData.totalDistance);
      const estimatedDurationMin =
        formData.estimatedDuration === '' || formData.estimatedDuration === null || formData.estimatedDuration === undefined
          ? Number(route.estimatedDuration || 0)
          : Number(formData.estimatedDuration);
      const costEstimate =
        formData.costEstimate === '' || formData.costEstimate === null || formData.costEstimate === undefined
          ? Number(route.costEstimate || 0)
          : Number(formData.costEstimate);
 
      const normalizedStops = sequenceStops
        .filter((stop) => stop.stopID || stop.location || stop.eta || stop.action)
        .map((stop) => ({
          stopID: stop.stopID === '' ? null : Number(stop.stopID),
          location: stop.location || null,
          eta: stop.eta ? `${stop.eta}:00` : null,
          action: stop.action || null,
        }));
 
      const payload = {
        routeID: route.id,
        sequenceJSON: normalizedStops.length > 0 ? JSON.stringify({ stops: normalizedStops }) : '',
        distanceKm: Number.isFinite(distanceKm) ? distanceKm : Number(route.totalDistance || 0),
        estimatedDurationMin: Number.isFinite(estimatedDurationMin) ? estimatedDurationMin : Number(route.estimatedDuration || 0),
        costEstimate: Number.isFinite(costEstimate) ? costEstimate : Number(route.costEstimate || 0),
        status: formData.status || route.status || 'PLANNED',
      };
      await updateRoute(id, payload);
      await fetchRoute();
      setIsEditing(false);
      setError('');
    } catch (err) {
      const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
      setError(apiMessage || 'Failed to update route.');
      console.error(err);
    }
  };
 
  const handleSubmit = (e) => {
    e?.preventDefault();
    setConfirmModal({ open: true, type: 'edit', title: 'Confirm Save', message: 'Do you want to save changes to this route?', onConfirm: doSubmit });
  };
 
  const handleDelete = async () => {
    if (!route?.id) return;
    try {
      await deleteRoute(route.id);
      navigate('/routing/routes');
    } catch (err) {
      setError('Failed to delete route.');
      console.error(err);
    }
  };
 
  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'in_progress' || s === 'in progress') return 'status-available';
    if (s === 'completed') return 'status-available';
    if (s === 'planned') return 'status-maintenance';
    return 'status-inuse';
  };
 
  const getAvailabilityStatusClass = (status) => {
    const upper = (status || '').toUpperCase();
    if (['AVAILABLE', 'OPEN', 'CONFIRMED', 'ACTIVE'].includes(upper)) return 'avail-status-positive';
    if (['UNAVAILABLE', 'CLOSED', 'CANCELLED', 'BLOCKED'].includes(upper)) return 'avail-status-negative';
    if (['MAINTENANCE', 'PENDING', 'ON_HOLD'].includes(upper)) return 'avail-status-warning';
    return 'avail-status-neutral';
  };
 
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };
 
  const parseStops = (sequenceJSON) => {
    if (!sequenceJSON) return [];
    try {
      const parsed = typeof sequenceJSON === 'string' ? JSON.parse(sequenceJSON) : sequenceJSON;
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed?.stops)) return parsed.stops;
      if (Array.isArray(parsed?.data?.stops)) return parsed.data.stops;
      return [];
    } catch {
      return [];
    }
  };
 
  const scheduleData = {
    plannedStart: route?.plannedStart,
    plannedEnd: route?.plannedEnd,
    stops: parseStops(route?.sequenceJSON),
  };
 
  if (loading) {
    return (
      <Layout>
        <div className="fleet-container">
          <div className="loading">Loading route details...</div>
        </div>
      </Layout>
    );
  }
 
  if (error && !route) {
    return (
      <Layout>
        <div className="fleet-container">
          <div className="error-message">
            <span>{error || 'Route not found'}</span>
            <button onClick={() => navigate('/routing/routes')}>Back to Routes</button>
          </div>
        </div>
      </Layout>
    );
  }
 
  if (!route) {
    return (
      <Layout>
        <div className="fleet-container">
          <div className="error-message">
            <span>Route not found</span>
            <button onClick={() => navigate('/routing/routes')}>Back to Routes</button>
          </div>
        </div>
      </Layout>
    );
  }
 
  return (
    <Layout>
      <div className="fleet-container route-detail-page">
        {/* HEADER */}
        <div className="detail-header">
          <div className="detail-header-left">
            <button className="back-btn" onClick={() => navigate('/routing/routes')}>←</button>
            <div>
              <h1 className="detail-title">Route ID: {route.routeId}</h1>
            </div>
          </div>
          <div className="detail-header-right">
            {!isEditing ? (
              <>
                <button className="btn-delete icon-btn" onClick={() => setConfirmModal({ open: true, type: 'delete', title: 'Confirm Delete', message: 'Are you sure you want to delete this route? This action cannot be undone.', onConfirm: handleDelete })}>
                  <span className="icon-btn-icon"><FiTrash2 size={18} /></span>
                  <span className="icon-btn-label">Delete</span>
                </button>
                <button className="btn-edit icon-btn" onClick={() => setIsEditing(true)}>
                  <span className="icon-btn-icon"><FiEdit2 size={16} /></span>
                  <span className="icon-btn-label">Edit</span>
                </button>
              </>
            ) : (
              <>
                <button className="btn-back icon-btn create-back-icon-btn" onClick={() => { setIsEditing(false); setFormData(route); }}>
                  <span className="icon-btn-icon">←</span>
                  <span className="icon-btn-label">Back</span>
                </button>
                <button className="btn-edit icon-btn" onClick={handleSubmit}>
                  <span className="icon-btn-icon">✓</span>
                  <span className="icon-btn-label">Save</span>
                </button>
              </>
            )}
          </div>
        </div>
 
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            <span>⚠</span> {error}
          </div>
        )}
 
        {/* VIEW MODE */}
        {!isEditing ? (
          <div className="detail-cards">
            <div className="detail-card info-card">
              <h3>Route Information</h3>
              <div className="detail-row">
                <span className="label">Route ID:</span>
                <span className="value reg-number-value">{route.routeId}</span>
              </div>
              <div className="detail-row">
                <span className="label">Load Code:</span>
                <span className="value">{route.loadCode}</span>
              </div>
              <div className="detail-row">
                <span className="label">Vehicle ID:</span>
                <span className="value">{route.vehicleId || 'Not assigned'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={"status-badge " + getStatusClass(route.status)}>
                  {route.status || 'PLANNED'}
                </span>
              </div>
            </div>
 
            <div className="detail-card capacity-card">
              <h3>Route Metrics</h3>
              <div className="detail-row">
                <span className="label">Total Distance:</span>
                <span className="value">{route.totalDistance ? Number(route.totalDistance).toFixed(2) + ' km' : '-'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Est. Duration:</span>
                <span className="value">{route.estimatedDuration ? route.estimatedDuration + ' min' : '-'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Cost Estimate:</span>
                <span className="value">Rs. {route.costEstimate ? Number(route.costEstimate).toFixed(2) : '-'}</span>
              </div>
            </div>
 
            <div className="detail-card assignment-card">
              <h3>Load Details</h3>
              <div className="detail-row">
                <span className="label">Load ID:</span>
                <span className="value">{route.loadId || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total Weight:</span>
                <span className="value">{route.totalWeightKg ? Number(route.totalWeightKg).toLocaleString() + ' kg' : '-'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total Volume:</span>
                <span className="value">{route.totalVolumeM3 ? route.totalVolumeM3 + ' m3' : '-'}</span>
              </div>
            </div>
 
            <div className="detail-card assignment-card">
              <h3>Vehicle & Driver</h3>
              <div className="detail-row">
                <span className="label">Vehicle ID:</span>
                <span className="value">{route.vehicleId || 'Not assigned'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Registration:</span>
                <span className="value">{vehicleLoading ? 'Loading...' : (vehicle?.regNumber || '-')}</span>
              </div>
              <div className="detail-row">
                <span className="label">Vehicle Type:</span>
                <span className="value">{vehicleLoading ? 'Loading...' : (vehicle?.type || '-')}</span>
              </div>
              <div className="detail-row">
                <span className="label">Driver:</span>
                <span className="value">{vehicleLoading ? 'Loading...' : (vehicle?.driver?.name || 'Unassigned')}</span>
              </div>
              <div className="detail-row">
                <span className="label">LicenseNo</span>
                <span className="value">{vehicleLoading ? 'Loading...' : (vehicle?.driver.licenseNo || 'None')}</span>
              </div>
              <div className="detail-row">
                <span className="label">Contact</span>
                <span className="value">{vehicleLoading ? 'Loading...' : (vehicle?.driver.contactInfo  || 'None')}</span>
              </div>
            </div>
 
            <div className="detail-card availability-card">
              <h3>Vehicle Availability</h3>
              {vehicleLoading ? (
                <p className="booking-detail">Loading availability...</p>
              ) : vehicleAvailabilities.length > 0 ? (
                vehicleAvailabilities.map((availability, index) => (
                  <div key={`${availability.availID || index}`} className="availability-item">
                    <div className="detail-row">
                      <span className="label">Date:</span>
                      <span className="value">{formatDate(availability.date)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Start Time:</span>
                      <span className="value">{formatDate(availability.startTime)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">End Time:</span>
                      <span className="value">{formatDate(availability.endTime)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Status:</span>
                      <span className={`status-badge ${getAvailabilityStatusClass(availability.status)}`}>
                        {availability.status || 'Unknown'}
                      </span>
                    </div>
                    {availability.reasonNote && (
                      <div className="detail-row">
                        <span className="label">Reason:</span>
                        <span className="value">{availability.reasonNote}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="booking-detail">No availability records found for this vehicle.</p>
              )}
            </div>
 
            <div className="detail-card maintenance-card">
              <h3>Schedule</h3>
              <ScheduleCard schedule={scheduleData} />
            </div>
          </div>
        ) : (
          /* EDIT FORM */
          <div className="detail-cards">
            <div className="detail-card info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>Edit Route</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  <div className="form-group">
                    <label className="label">Route ID</label>
                    <input className="form-input" type="text" value={formData.routeId || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label className="label">Vehicle ID</label>
                    <input className="form-input" type="text" value={formData.vehicleId || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label className="label">Load ID</label>
                    <input className="form-input" type="text" value={formData.loadId || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label className="label">Status</label>
                    <select className="form-input" name="status" value={formData.status || ''} onChange={handleInputChange}>
                      <option value="PLANNED">Planned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Distance (km)</label>
                    <input className="form-input" type="number" name="totalDistance" value={formData.totalDistance || ''} onChange={handleInputChange} step="0.01" />
                  </div>
                  <div className="form-group">
                    <label className="label">Duration (min)</label>
                    <input className="form-input" type="number" name="estimatedDuration" value={formData.estimatedDuration || ''} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label className="label">Cost Estimate</label>
                    <input className="form-input" type="number" name="costEstimate" value={formData.costEstimate || ''} onChange={handleInputChange} step="0.01" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="label">Sequence Stops</label>
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
                              <tr key={`detail-stop-${index}`}>
                                <td>
                                  <input
                                    type="number"
                                    className="sequence-input"
                                    value={stop.stopID}
                                    onChange={(e) => handleStopChange(index, 'stopID', e.target.value)}
                                    placeholder="1"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="sequence-input"
                                    value={stop.location}
                                    onChange={(e) => handleStopChange(index, 'location', e.target.value)}
                                    placeholder="HYD01"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="datetime-local"
                                    className="sequence-input"
                                    value={stop.eta}
                                    onChange={(e) => handleStopChange(index, 'eta', e.target.value)}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="sequence-input"
                                    value={stop.action}
                                    onChange={(e) => handleStopChange(index, 'action', e.target.value)}
                                    placeholder="Pickup / Delivery"
                                  />
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="sequence-remove-btn"
                                    onClick={() => removeStopRow(index)}
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
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={confirmModal.open}
        type={confirmModal.type}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={() => { setConfirmModal({ open: false }); confirmModal.onConfirm?.(); }}
        onCancel={() => setConfirmModal({ open: false })}
      />
    </Layout>
  );
}
 
 