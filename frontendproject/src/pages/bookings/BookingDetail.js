import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getBookingById, updateBookingStatus } from '../../api/bookingsApi';
import { STATUS_CONFIG, siteName } from '../../utils/constants';
import '../../styles/Bookings.css';
import { AuthContext } from '../../auth/AuthContext';

function formatDateTime(dateTime) {
  if (!dateTime) return '–';
  return new Date(dateTime).toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatBookingId(bookingId) {
  return `BK${String(bookingId).padStart(3, '0')}`;
}

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const { user } = useContext(AuthContext);

  const operationalRoles = ['Dispatcher', 'Driver'];
  const canEditStatus = user?.role && operationalRoles.includes(user.role);

  useEffect(() => {
    getBookingById(id)
      .then((data) => { 
        setBooking(data); 
        setNewStatus(data.status); 
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === booking.status) return;
    setSaving(true);
    try {
      await updateBookingStatus(id, newStatus);
      const fresh = await getBookingById(id);
      setBooking(fresh);
      setStatusMessage({ type: 'success', text: 'Status updated successfully.' });
      return true;
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update status.' });
      return false;
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
    }
  };

  if (loading) return <Layout><div className="empty-state">Loading…</div></Layout>;
  if (notFound) return <Layout><div className="empty-state">Booking not found.</div></Layout>;

  const statusDisplay = STATUS_CONFIG[booking.status] || { label: booking.status, cls: 'status-pending' };
  const handlingFlags = booking.specialHandlingFlags
    ? booking.specialHandlingFlags.split(',').filter(Boolean)
    : [];

  return (
    <Layout>
      <div className="booking-detail-page">
        {/* Header */}
        <div className="detail-header">
          <div className="detail-header-left">
            <button className="back-btn" onClick={() => navigate('/bookings')}>←</button>
            <div>
              <div className="detail-booking-id">{formatBookingId(booking.bookingID)}</div>
              <div className="page-subtitle">Booking Detail</div>
            </div>
          </div>
          <div className="detail-header-right">
            {canEditStatus && !isEditMode && (
              <button className="btn-edit" onClick={() => { setIsEditMode(true); setNewStatus(booking.status); }}>
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Detail Grid */}
        <div className="detail-grid">
          {/* Row 1: Shipper Information | Route */}
          <div className="detail-card">
            <h3 className="detail-card-title">Shipper Information</h3>
            <div className="detail-field">
              <div className="detail-label">Shipper</div>
              <div className="detail-value">{booking.shipper?.name || '–'}</div>
            </div>
            {booking.shipper?.contactInfo && (
              <div className="detail-field" style={{ marginTop: 10 }}>
                <div className="detail-label">Contact</div>
                <div className="detail-value">{booking.shipper.contactInfo}</div>
              </div>
            )}
          </div>
          <div className="detail-card">
            <h3 className="detail-card-title">Route</h3>
            <div className="detail-route">
              <div className="route-point">
                <span className="route-dot route-dot-origin">●</span>
                <div>
                  <div className="detail-label">Origin</div>
                  <div className="detail-value">{siteName(booking.originSiteID)}</div>
                </div>
              </div>
              <div className="route-line">│</div>
              <div className="route-point">
                <span className="route-dot route-dot-dest">●</span>
                <div>
                  <div className="detail-label">Destination</div>
                  <div className="detail-value">{siteName(booking.destinationSiteID)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Pickup Window | Delivery Window */}
          <div className="detail-card">
            <h3 className="detail-card-title">Pickup Window</h3>
            <div className="detail-row-2">
              <div className="detail-field">
                <div className="detail-label">Start</div>
                <div className="detail-value">{formatDateTime(booking.pickupWindowStart)}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">End</div>
                <div className="detail-value">{formatDateTime(booking.pickupWindowEnd)}</div>
              </div>
            </div>
          </div>
          <div className="detail-card">
            <h3 className="detail-card-title">Delivery Window</h3>
            <div className="detail-row-2">
              <div className="detail-field">
                <div className="detail-label">Start</div>
                <div className="detail-value">{formatDateTime(booking.deliveryWindowStart)}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">End</div>
                <div className="detail-value">{formatDateTime(booking.deliveryWindowEnd)}</div>
              </div>
            </div>
          </div>

          {/* Row 3: Cargo Details | Booking Meta */}
          <div className="detail-card">
            <h3 className="detail-card-title">Cargo Details</h3>
            <div className="detail-row-3">
              <div className="detail-field">
                <div className="detail-label">Weight</div>
                <div className="detail-value">{booking.weightKg?.toLocaleString()} kg</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Volume</div>
                <div className="detail-value">{booking.volumeM3} m³</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Units</div>
                <div className="detail-value">{booking.pieces}</div>
              </div>
            </div>
            <div className="detail-row-3" style={{ marginTop: 16 }}>
              <div className="detail-field">
                <div className="detail-label">Commodity</div>
                <div className="detail-value">{booking.commodity}</div>
              </div>
              {handlingFlags.length > 0 && (
                <div className="detail-field">
                  <div className="detail-label" style={{ marginBottom: 6 }}>Special Handling</div>
                  <div className="flags-list">
                    {handlingFlags.map((flag) => (
                      <span key={flag} className="flag-tag">{flag.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="detail-card">
            <h3 className="detail-card-title">Booking Meta</h3>
            <div className="detail-row-2">
              <div className="detail-field">
                <div className="detail-label">Created At</div>
                <div className="detail-value">{formatDateTime(booking.createdAt)}</div>
              </div>
              <div className="detail-field">
                <div className="meta-status-label-row">
                  <span className="detail-label">Status</span>
                </div>
                <div className="detail-value meta-status-value">
                  {!isEditMode || !canEditStatus ? (
                    <span className={`status-badge ${statusDisplay.cls}`}>{statusDisplay.label}</span>
                  ) : (
                    <div className="meta-status-edit-row">
                      <select 
                        className="status-update-select" 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        {Object.entries(STATUS_CONFIG).map(([statusKey, statusConfig]) => (
                          <option key={statusKey} value={statusKey}>{statusConfig.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {statusMessage.text && (
                    <span className={`update-msg ${statusMessage.type === 'error' ? 'update-msg-error' : ''}`}>
                      {statusMessage.text}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {booking.updatedAt && (
              <div className="detail-row-2" style={{ marginTop: 14 }}>
                <div className="detail-field">
                  <div className="detail-label">Updated At</div>
                  <div className="detail-value">{formatDateTime(booking.updatedAt)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
          {/* Edit actions */}
          {isEditMode && canEditStatus && (
            <div className="meta-edit-actions">
              <button
                className="btn-primary"
                onClick={async () => { const ok = await handleStatusUpdate(); if (ok) setIsEditMode(false); }}
                disabled={saving || newStatus === booking.status}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => { setNewStatus(booking.status); setIsEditMode(false); }}
              >
                Cancel
              </button>
            </div>
          )}
      </div>
    </Layout>
  );
}