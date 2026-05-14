import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getLoadById, updateLoad, deleteLoad } from '../../api/routingApi';
import { getVehicleById, getVehicleAvailability } from '../../api/fleetApi';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/Fleet.css';
import '../../styles/Routing.css';
import '../../styles/Bookings.css';
 
export default function LoadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [load, setLoad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [confirmModal, setConfirmModal] = useState({ open: false });
  const [vehicle, setVehicle] = useState(null);
  const [vehicleAvailabilities, setVehicleAvailabilities] = useState([]);
  const [vehicleLoading, setVehicleLoading] = useState(false);
 
  const fetchLoad = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const raw = await getLoadById(id);
      const data = raw?.load ? raw.load : raw;
      const normalized = {
        id: data.loadID,
        loadCode: data.loadCode || '-',
        vehicleId: data.vehicleID || '-',
        status: data.status || 'PENDING',
        totalWeightKg: data.totalWeightKg || 0,
        totalVolumeM3: data.totalVolumeM3 || 0,
        plannedStart: data.plannedStart || null,
        plannedEnd: data.plannedEnd || null,
        bookingsJSON: data.bookingsJSON || '',
      };
      setLoad(normalized);
      setFormData(normalized);
    } catch (err) {
      setError('Failed to load details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);
 
  useEffect(() => {
    fetchLoad();
  }, [fetchLoad]);
 
  useEffect(() => {
    const vehicleId = load?.vehicleId;
    const numericVehicleId = Number(vehicleId);
 
    if (!vehicleId || vehicleId === '-' || !Number.isFinite(numericVehicleId) || numericVehicleId <= 0) {
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
        console.warn('Could not fetch vehicle details for load:', err);
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
  }, [load?.vehicleId]);
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
 
  const doSave = async () => {
    try {
      const totalWeightKg =
        formData.totalWeightKg === '' || formData.totalWeightKg === null || formData.totalWeightKg === undefined
          ? Number(load.totalWeightKg || 0)
          : Number(formData.totalWeightKg);
      const totalVolumeM3 =
        formData.totalVolumeM3 === '' || formData.totalVolumeM3 === null || formData.totalVolumeM3 === undefined
          ? Number(load.totalVolumeM3 || 0)
          : Number(formData.totalVolumeM3);
 
      const payload = {
        loadID: load.id,
        loadCode: formData.loadCode || load.loadCode || '',
        vehicleID: formData.vehicleId ? Number(formData.vehicleId) : (load.vehicleId ? Number(load.vehicleId) : null),
        status: formData.status || load.status || 'PENDING',
        totalWeightKg: Number.isFinite(totalWeightKg) ? totalWeightKg : Number(load.totalWeightKg || 0),
        totalVolumeM3: Number.isFinite(totalVolumeM3) ? totalVolumeM3 : Number(load.totalVolumeM3 || 0),
        plannedStart: formData.plannedStart || load.plannedStart || null,
        plannedEnd: formData.plannedEnd || load.plannedEnd || null,
        bookingsJSON: formData.bookingsJSON || load.bookingsJSON || '',
      };
      await updateLoad(id, payload);
      await fetchLoad();
      setIsEditing(false);
      setError('');
    } catch (err) {
      const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
      setError(apiMessage || 'Failed to update load.');
      console.error(err);
    }
  };
 
  const handleSubmit = (e) => {
    e?.preventDefault();
    setConfirmModal({ open: true, type: 'edit', title: 'Confirm Save', message: 'Do you want to save changes to this load?', onConfirm: doSave });
  };
 
  const handleDelete = async () => {
    if (!load?.id) return;
    try {
      await deleteLoad(id);
      navigate('/routing/load-planning');
    } catch (err) {
      setError('Failed to delete load.');
      console.error(err);
    }
  };
 
  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 'status-available';
    if (s === 'planned' || s === 'in_transit') return 'status-maintenance';
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
 
  const parseBookingsJSON = (bookingsJSON) => {
    if (!bookingsJSON) {
      return { items: [] };
    }
 
    const rawText = typeof bookingsJSON === 'string'
      ? bookingsJSON
      : JSON.stringify(bookingsJSON);
 
    try {
      const parsed = typeof bookingsJSON === 'string'
        ? JSON.parse(bookingsJSON)
        : bookingsJSON;
 
      if (Array.isArray(parsed)) {
        return { items: parsed };
      }
 
      if (parsed && Array.isArray(parsed.items)) {
        return { items: parsed.items };
      }
 
      if (parsed && Array.isArray(parsed.bookings)) {
        return { items: parsed.bookings };
      }
 
      if (parsed?.data && Array.isArray(parsed.data.items)) {
        return { items: parsed.data.items };
      }
 
      if (parsed && Array.isArray(parsed.bookingIds)) {
        return {
          items: parsed.bookingIds.map((id) => ({ bookingID: id })),
        };
      }
 
      if (parsed && typeof parsed === 'object') {
        return { items: [parsed] };
      }
    } catch {
      const simpleList = rawText
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
 
      return {
        items: simpleList.length > 0 ? simpleList : [rawText],
      };
    }
 
    return { items: [rawText] };
  };
 
  const BOOKING_COLUMNS = [
    { key: 'bookingID', label: 'Booking ID', aliases: ['bookingID', 'bookingId', 'id'] },
    { key: 'shipperID', label: 'Shipper ID', aliases: ['shipperID', 'shipperId'] },
    { key: 'originSiteID', label: 'Origin Site ID', aliases: ['originSiteID', 'originSiteId'] },
    { key: 'destinationSiteID', label: 'Destination Site ID', aliases: ['destinationSiteID', 'destinationSiteId'] },
    { key: 'pickupWindowStart', label: 'Pickup Window Start', aliases: ['pickupWindowStart'] },
    { key: 'pickupWindowEnd', label: 'Pickup Window End', aliases: ['pickupWindowEnd'] },
    { key: 'deliveryWindowStart', label: 'Delivery Window Start', aliases: ['deliveryWindowStart'] },
    { key: 'deliveryWindowEnd', label: 'Delivery Window End', aliases: ['deliveryWindowEnd'] },
    { key: 'weightKg', label: 'Weight (Kg)', aliases: ['weightKg', 'weight'] },
    { key: 'volumeM3', label: 'Volume (m3)', aliases: ['volumeM3', 'volume'] },
    { key: 'pieces', label: 'Pieces', aliases: ['pieces'] },
    { key: 'commodity', label: 'Commodity', aliases: ['commodity'] },
    { key: 'specialHandlingFlags', label: 'Special Handling Flags', aliases: ['specialHandlingFlags'] },
    { key: 'status', label: 'Status', aliases: ['status'] },
  ];
 
  const getBookingColumnValue = (item, aliases = []) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return '-';
    for (const alias of aliases) {
      if (Object.prototype.hasOwnProperty.call(item, alias)) {
        return formatBookingValue(item[alias]);
      }
    }
    return '-';
  };
 
  const toLabel = (key) => {
    return String(key)
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/^./, (ch) => ch.toUpperCase());
  };
 
  const formatBookingValue = (value) => {
    if (value === null || value === undefined || value === '') return '-';
 
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      const allPrimitive = value.every((v) => v === null || ['string', 'number', 'boolean'].includes(typeof v));
      return allPrimitive ? value.join(', ') : `${value.length} item(s)`;
    }
 
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      return keys.length ? `{ ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? ', ...' : ''} }` : '{}';
    }
 
    return String(value);
  };
 
  const getBookingSummary = (item) => {
    if (!item || typeof item !== 'object') return '';
 
    const keys = Object.keys(item);
    if (keys.length === 1 && ['bookings', 'booking', 'items'].includes(keys[0])) {
      return '';
    }
 
    const entries = Object.entries(item)
      .filter(([key]) => !['id', 'bookingId'].includes(key))
      .slice(0, 4)
      .map(([key, value]) => `${toLabel(key)}: ${formatBookingValue(value)}`);
 
    if (entries.length === 0) return '';
 
    const summary = entries.join(' • ');
    if (/^Bookings?:\s*\d+\s*item\(s\)$/i.test(summary)) {
      return '';
    }
 
    return summary;
  };
 
  const getBookingColumns = (items) => {
    const objectItems = items.filter((item) => item && typeof item === 'object' && !Array.isArray(item));
    if (objectItems.length === 0) return [];
 
    const preferred = ['bookingId', 'id', 'customer', 'customerName', 'pickup', 'dropoff', 'status', 'weight', 'volume'];
    const keySet = new Set();
 
    objectItems.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (!['bookings', 'items'].includes(key)) {
          keySet.add(key);
        }
      });
    });
 
    const allKeys = Array.from(keySet);
    const ordered = [
      ...preferred.filter((key) => allKeys.includes(key)),
      ...allKeys.filter((key) => !preferred.includes(key)),
    ];
 
    return ordered.slice(0, 6);
  };
 
  const bookingsData = parseBookingsJSON(load?.bookingsJSON);
  if (loading) {
    return (
      <Layout>
        <div className="fleet-container">
          <div className="loading">Loading load details...</div>
        </div>
      </Layout>
    );
  }
 
  if (!load) {
    return (
      <Layout>
        <div className="fleet-container">
          <div className="error-message">
            <span>{error || 'Load not found'}</span>
            <button onClick={() => navigate('/routing/load-planning')}>Back to Loads</button>
          </div>
        </div>
      </Layout>
    );
  }
 
  return (
    <Layout>
      <div className="fleet-container load-detail-page">
        {/* HEADER */}
        <div className="detail-header">
          <div className="detail-header-left">
            <button className="back-btn" onClick={() => navigate('/routing/load-planning')}>←</button>
            <div>
              <h1 className="detail-title">{load.loadCode}</h1>
              <p className="detail-subtitle">Load Details</p>
            </div>
          </div>
          <div className="detail-header-right">
                <button className="btn-edit icon-btn" onClick={handleSubmit}>
                  <span className="icon-btn-icon">✓</span>
                  <span className="icon-btn-label">Save</span>
                </button>
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
              <h3>Load Information</h3>
              <div className="detail-row">
                <span className="label">Load Code:</span>
                <span className="value reg-number-value">{load.loadCode}</span>
              </div>
              <div className="detail-row">
                <span className="label">Load ID:</span>
                <span className="value">{load.id}</span>
              </div>
              <div className="detail-row">
                <span className="label">Vehicle ID:</span>
                <span className="value">{load.vehicleId || 'Not assigned'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={"status-badge " + getStatusClass(load.status)}>
                  {load.status || 'PENDING'}
                </span>
              </div>
            </div>
 
            <div className="detail-card capacity-card">
              <h3>Capacity</h3>
              <div className="detail-row">
                <span className="label">Total Weight:</span>
                <span className="value">{load.totalWeightKg ? Number(load.totalWeightKg).toLocaleString() + ' kg' : '-'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total Volume:</span>
                <span className="value">{load.totalVolumeM3 ? load.totalVolumeM3 + ' m3' : '-'}</span>
              </div>
            </div>
 
            <div className="detail-card assignment-card">
              <h3>Vehicle & Driver</h3>
              <div className="detail-row">
                <span className="label">Vehicle ID:</span>
                <span className="value">{load.vehicleId || 'Not assigned'}</span>
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
                <span className="label">Driver ID:</span>
                <span className="value">{vehicleLoading ? 'Loading...' : (vehicle?.driverID || 'None')}</span>
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
              <div className="detail-row">
                <span className="label">Planned Start:</span>
                <span className="value">{formatDate(load.plannedStart)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Planned End:</span>
                <span className="value">{formatDate(load.plannedEnd)}</span>
              </div>
            </div>
 
            {load.bookingsJSON && (
              <div className="detail-card bookings-card">
                <h3>Bookings</h3>
                {bookingsData.items.length > 0 ? (
                  <div className="booking-table-wrap">
                    <table className="booking-mini-table">
                      <thead>
                        <tr>
                          {BOOKING_COLUMNS.map((column) => (
                            <th key={column.key}>{column.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bookingsData.items.map((item, index) => {
                          const row = item && typeof item === 'object' && !Array.isArray(item)
                            ? item
                            : { bookingID: item };
 
                          return (
                            <tr key={`booking-row-${index}`}>
                              {BOOKING_COLUMNS.map((column) => (
                                <td key={`${column.key}-${index}`}>
                                  {getBookingColumnValue(row, column.aliases)}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="booking-detail">No booking entries found.</p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* EDIT FORM */
          <div className="booking-form-page">
            {/* ── Page Header ── */}
            <div className="form-page-header">
              <button className="back-btn" onClick={() => setIsEditing(false)}>←</button>
              <div>
                <h1 className="page-title">Edit Load</h1>
                <p className="page-subtitle">
                  Update load details and planning information
                </p>
              </div>
            </div>

            {error && (
              <div className="error-banner">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-section">
                <h2 className="form-section-title">Load Details</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="label">Load Code</label>
                    <input className="form-input" type="text" value={formData.loadCode || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label className="label">Vehicle ID</label>
                    <input className="form-input" type="text" value={formData.vehicleId || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label className="label">Status</label>
                    <select className="form-input" name="status" value={formData.status || ''} onChange={handleInputChange}>
                      <option value="PENDING">Pending</option>
                      <option value="PLANNED">Planned</option>
                      <option value="IN_TRANSIT">In Transit</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Total Weight (kg)</label>
                    <input className="form-input" type="number" name="totalWeightKg" value={formData.totalWeightKg || ''} onChange={handleInputChange} step="0.1" />
                  </div>
                  <div className="form-group">
                    <label className="label">Total Volume (m3)</label>
                    <input className="form-input" type="number" name="totalVolumeM3" value={formData.totalVolumeM3 || ''} onChange={handleInputChange} step="0.01" />
                  </div>
                  <div className="form-group">
                    <label className="label">Planned Start</label>
                    <input className="form-input" type="datetime-local" name="plannedStart" value={formData.plannedStart ? formData.plannedStart.slice(0, 16) : ''} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label className="label">Planned End</label>
                    <input className="form-input" type="datetime-local" name="plannedEnd" value={formData.plannedEnd ? formData.plannedEnd.slice(0, 16) : ''} onChange={handleInputChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="label">Bookings</label>
                    <textarea className="form-input" name="bookingsJSON" value={formData.bookingsJSON || ''} onChange={handleInputChange} rows="3" placeholder="Bookings data" style={{ width: '100%', resize: 'vertical' }} />
                  </div>
                </div>
              </div>

              {/* ── Footer Actions ── */}
              <div className="form-footer">
                <div className="form-footer-spacer" />
                <div className="form-footer-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setFormData(load); // Reset to original
                      setError('');
                    }}
                  >
                    Reset
                  </button>
                  <button type="submit" className="btn-primary">
                    Update Load
                  </button>
                </div>
              </div>
            </form>
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
 
 