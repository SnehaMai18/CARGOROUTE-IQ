import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { AuthContext } from '../../auth/AuthContext';
import {
  getAcknowledgementById,
  updateAcknowledgement,
} from '../../api/dispatchApi';
import { DISPATCH_STATUS_CONFIG, DRIVER_STATUS_CONFIG, VEHICLE_TYPE_CONFIG } from '../../utils/constants';
import '../../styles/Bookings.css';
import '../../styles/DispatchManifests.css';
import '../../styles/AcknowledgementDetail.css';

// ── Formatters ────────────────────────────────────────────────────────────────

function formatAckId(id) {
  return `ACK${String(id).padStart(4, '0')}`;
}
function formatDispatchId(id) {
  return `DS${String(id).padStart(4, '0')}`;
}
function formatLoadId(id) {
  return id ? `LD${String(id).padStart(4, '0')}` : '–';
}
function formatDateTime(dt) {
  if (!dt) return '–';
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
function formatDate(dt) {
  if (!dt) return '–';
  return new Date(dt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Bookings parsing and formatting ────────────────────────────────────────────

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

function parseBookingsJSON(bookingsJSON) {
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
}

function formatBookingValue(value) {
  if (value === null || value === undefined || value === '') return '–';

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
}

function getBookingColumnValue(item, aliases = []) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return '–';
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(item, alias)) {
      return formatBookingValue(item[alias]);
    }
  }
  return '–';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AcknowledgementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isDriver = user?.role?.toLowerCase() === 'driver';

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');
  const [updateError, setUpdateError] = useState('');

  // ── Loaders ──────────────────────────────────────────────────────────────

  const loadAcknowledgement = useCallback(() => {
    setLoading(true);
    setError('');
    getAcknowledgementById(id)
      .then((data) => {
        console.log('Acknowledgement data received:', data);
        setItem(data);
        setNotes(data?.notes || '');
      })
      .catch((err) => {
        console.error('Failed to load acknowledgement:', err);
        setError('Acknowledgement not found or service unavailable.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadAcknowledgement();
  }, [loadAcknowledgement]);

  // ── Update Notes ─────────────────────────────────────────────────────────

  const handleUpdateNotes = () => {
    setUpdateMsg('');
    setUpdateError('');
    setUpdating(true);

    const payload = {
      dispatchID: item?.dispatch?.dispatch?.dispatchID || item?.dispatch?.dispatchID || item?.dispatchID,
      driverID: item?.driver?.driverID || item?.driverID,
      notes: notes.trim() || null,
    };

    console.log('Updating notes with payload:', payload);
    updateAcknowledgement(id, payload)
      .then(() => {
        setUpdateMsg('Notes updated successfully.');
        setEditNotes(false);
        loadAcknowledgement();
      })
      .catch((err) => {
        console.error('Update failed:', err);
        setUpdateError('Update failed. Please try again.');
      })
      .finally(() => setUpdating(false));
  };

  // ── Loading / error ───────────────────────────────────────────────────────

  if (loading) {
    return <Layout><div className="loading-spinner">Loading acknowledgement…</div></Layout>;
  }

  if (error || !item) {
    return (
      <Layout>
        <div className="auth-message auth-message-error">
          ⚠ {error || 'Acknowledgement not found.'}
          <button className="btn-secondary ack-detail-back-btn-margin" onClick={() => navigate('/acknowledgements')}>
            ← Back
          </button>
        </div>
      </Layout>
    );
  }

  const ack = item || {};
  
  // Flexible data extraction to handle multiple API response structures
  const dispatch = ack.dispatch?.dispatch || ack.dispatch || {};
  const load = ack.dispatch?.load || ack.load || {};
  const vehicle = ack.dispatch?.vehicle || ack.vehicle || {};
  const driver = ack.driver || ack.driverInfo || {};
  
  const st = DISPATCH_STATUS_CONFIG[dispatch?.status] || { label: dispatch?.status || 'Unknown', cls: '' };
  const drSt = DRIVER_STATUS_CONFIG[driver?.status] || { label: driver?.status || 'Unknown', cls: '' };
  const vtCfg = VEHICLE_TYPE_CONFIG[vehicle?.type] || { label: vehicle?.type || '–' };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="bookings-page booking-detail-page dispatch-page">

        {/* ── Header ── */}
        <div className="detail-header">
          <div className="detail-header-left">
            <button className="back-btn" onClick={() => navigate('/acknowledgements')} title="Back">
              ←
            </button>
            <span className="detail-booking-id">{formatAckId(ack.ackID)}</span>
          </div>
        </div>

        {/* ── Detail Grid ── */}
        <div className="detail-grid">

          {/* Acknowledgement Info */}
          <div className="detail-card">
            <p className="detail-card-title">Acknowledgement Details</p>
            <div className="detail-row-2">
              <div className="detail-field">
                <span className="detail-label">Acknowledgement ID</span>
                <span className="detail-value">{formatAckId(ack.ackID)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Acknowledged At</span>
                <span className="detail-value">{formatDateTime(ack.ackAt)}</span>
              </div>
            </div>
          </div>

          {/* Driver Info */}
          <div className="detail-card">
            <p className="detail-card-title">Driver Information</p>
            <div className="detail-row-2">
              <div className="detail-field">
                <span className="detail-label">Driver Name</span>
                <span className="detail-value">{driver.name || '–'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Driver ID</span>
                <span className="detail-value">{driver.driverID || '–'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">License No</span>
                <span className="detail-value">{driver.licenseNo || '–'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Mobile Number</span>
                <span className="detail-value">{driver.mobileNumber || driver.phoneNumber || '–'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Status</span>
                <span className="detail-value">
                  <span className={`status-badge ${drSt.cls}`}>{drSt.label}</span>
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Contact Info</span>
                <span className="detail-value">{driver.contactInfo || driver.email || '–'}</span>
              </div>
            </div>
          </div>

          {/* Dispatch Info */}
          <div className="detail-card">
            <p className="detail-card-title">Dispatch Information</p>
            <div className="detail-row-2">
              <div className="detail-field">
                <span className="detail-label">Dispatch ID</span>
                <span className="detail-value">{formatDispatchId(dispatch.dispatchID)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Status</span>
                <span className="detail-value">
                  <span className={`status-badge ${st.cls}`}>{st.label}</span>
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Assigned By</span>
                <span className="detail-value">{dispatch.assignedBy || '–'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Assigned At</span>
                <span className="detail-value">{formatDateTime(dispatch.assignedAt || dispatch.createdAt)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Assigned Driver ID</span>
                <span className="detail-value">{dispatch.assignedDriverID || '–'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Load ID</span>
                <span className="detail-value">{formatLoadId(dispatch.loadID)}</span>
              </div>
            </div>
          </div>

          {/* Load Info */}
          {load.loadID && (
            <div className="detail-card">
              <p className="detail-card-title">Load Information</p>
              <div className="detail-row-2">
                <div className="detail-field">
                  <span className="detail-label">Load Code</span>
                  <span className="detail-value">{load.loadCode || '–'}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">{load.status || '–'}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Weight / Volume</span>
                  <span className="detail-value">
                    {load.totalWeightKg != null ? `${load.totalWeightKg} kg` : '–'}
                    {load.totalVolumeM3 != null ? ` · ${load.totalVolumeM3} m³` : ''}
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Planned Start</span>
                  <span className="detail-value">{formatDateTime(load.plannedStart || load.pickupDate)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Planned End</span>
                  <span className="detail-value">{formatDateTime(load.plannedEnd || load.deliveryDate)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Table */}
          {load.bookingsJSON && (
            <div className="detail-card detail-card-wide">
              <p className="detail-card-title">Bookings</p>
              {(() => {
                const bookingsData = parseBookingsJSON(load.bookingsJSON);
                return bookingsData.items.length > 0 ? (
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
                  <p style={{ color: '#94a3b8', fontSize: 13 }}>No booking entries found.</p>
                );
              })()}
            </div>
          )}

          {/* Vehicle Info */}
          {vehicle.vehicleID && (
            <div className="detail-card">
              <p className="detail-card-title">Vehicle Information</p>
              <div className="detail-row-2">
                <div className="detail-field">
                  <span className="detail-label">Reg Number</span>
                  <span className="detail-value">{vehicle.regNumber || '–'}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Type</span>
                  <span className="detail-value">{vtCfg.label}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Max Capacity</span>
                  <span className="detail-value">
                    {vehicle.maxWeightKg != null ? `${vehicle.maxWeightKg} kg` : '–'}
                    {vehicle.maxVolumeM3 != null ? ` · ${vehicle.maxVolumeM3} m³` : ''}
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Vehicle Status</span>
                  <span className="detail-value">{vehicle.status || '–'}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Last Maintenance</span>
                  <span className="detail-value">{formatDate(vehicle.lastMaintenanceAt)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="detail-card">
            <p className="detail-card-title">Notes</p>
            {editNotes ? (
              <div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={300}
                  className="ack-notes-textarea"
                  placeholder="Add notes about this acknowledgement…"
                />
                <div className="ack-char-counter">{notes.length}/300 characters</div>
                <div className="ack-button-group">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleUpdateNotes}
                    disabled={updating}
                  >
                    {updating ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => { setEditNotes(false); setNotes(item?.notes || ''); }}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className={`ack-notes-text ${!ack.notes ? 'empty' : ''}`}>
                  {ack.notes || 'No notes added.'}
                </p>
                {isDriver && (
                  <button
                    type="button"
                    className="btn-secondary ack-edit-notes-btn"
                    onClick={() => setEditNotes(true)}
                  >
                    Edit Notes
                  </button>
                )}
              </div>
            )}
            {updateMsg && (
              <div className="auth-message auth-message-success ack-message-margin">
                ✔ {updateMsg}
              </div>
            )}
            {updateError && (
              <div className="auth-message auth-message-error ack-message-margin">
                ⚠ {updateError}
              </div>
            )}
          </div>

        </div>

      </div>
    </Layout>
  );
}
