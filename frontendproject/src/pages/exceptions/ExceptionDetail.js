import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  getExceptionById,
  updateExceptionStatus,
  getClaimsByException,
  createClaim,
  resolveUserById,
} from '../../api/exceptionsApi';
import {
  EXCEPTION_TYPE_CONFIG,
  EXCEPTION_STATUS_CONFIG,
  CLAIM_STATUS_CONFIG,
  siteName,
} from '../../utils/constants';
import '../../styles/Bookings.css';
import '../../styles/Exceptions.css';
import { AuthContext } from '../../auth/AuthContext';

// ── Formatters ───────────────────────────────────────────────────────────────

function formatExceptionId(id) {
  return `EX${String(id).padStart(4, '0')}`;
}

function formatBookingId(id) {
  return id ? `BK${String(id).padStart(4, '0')}` : '–';
}

function formatClaimId(id) {
  return `CL${String(id).padStart(4, '0')}`;
}

function formatDateTime(dt) {
  if (!dt) return '–';
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(dt) {
  if (!dt) return '–';
  return new Date(dt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount) {
  if (amount == null) return '–';
  return `₹${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Claim form validation ─────────────────────────────────────────────────────

function validateClaimForm(fields) {
  const errors = {};
  if (!fields.filedBy.trim()) errors.filedBy = 'Filer name is required.';
  if (!fields.amountClaimed || isNaN(Number(fields.amountClaimed)) || Number(fields.amountClaimed) <= 0) {
    errors.amountClaimed = 'Enter a valid claim amount (greater than 0).';
  }
  return errors;
}

// ── Component ────────────────────────────────────────────────────────────────

const EMPTY_CLAIM = { filedBy: '', amountClaimed: '', resolutionNotes: '' };

export default function ExceptionDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  // Exception + booking
  const [item, setItem]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [reporterName, setReporterName] = useState('');

  // Status update
  const [newStatus, setNewStatus]     = useState('');
  const [isEditMode, setIsEditMode]   = useState(false);
  const [statusMsg, setStatusMsg]     = useState({ type: '', text: '' });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Claims
  const [claims, setClaims]         = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimFilerNames, setClaimFilerNames] = useState({});
  // Claims pagination
  const [claimsPage, setClaimsPage] = useState(1);
  const CLAIMS_PAGE_SIZE = 4;

  // File claim panel
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimFields, setClaimFields]     = useState(EMPTY_CLAIM);
  const [claimErrors, setClaimErrors]     = useState({});
  const [claimSaving, setClaimSaving]     = useState(false);
  const [claimApiError, setClaimApiError] = useState('');

  // ── Loaders ──────────────────────────────────────────────────────────────

  const loadException = useCallback(() => {
    setLoading(true);
    setError('');
    getExceptionById(id)
      .then((data) => {
        setItem(data);
        setNewStatus(data.exceptiondto?.status || '');
        const uid = data.exceptiondto?.reportedBy;
        if (uid) resolveUserById(uid).then(setReporterName);
      })
      .catch(() => setError('Exception not found or service unavailable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const loadClaims = useCallback(() => {
    setClaimsLoading(true);
    getClaimsByException(id)
      .then(setClaims)
      .catch(() => {})
      .finally(() => setClaimsLoading(false));
  }, [id]);

  // Resolve claim filer numeric IDs to display names
  useEffect(() => {
    if (claims.length === 0) return;
    const ids = [...new Set(claims.map((c) => c.filedBy).filter(Boolean))];
    ids.forEach((uid) => {
      resolveUserById(uid).then((name) =>
        setClaimFilerNames((prev) => ({ ...prev, [uid]: name }))
      );
    });
  }, [claims]);

  useEffect(() => {
    loadException();
    loadClaims();
  }, [loadException, loadClaims]);

  const { user } = useContext(AuthContext);
  const operationalRoles = ['Dispatcher', 'Driver'];
  // WarehouseManager is read-only and must NOT be able to edit exception status
  const canEditStatus = user?.role && operationalRoles.includes(user.role);
  const CLAIM_CREATE_ROLES = ['Admin', 'Shipper'];

  useEffect(() => {
    // Prefill claim filer name from authenticated user when available
    setClaimFields((prev) => ({ ...prev, filedBy: user?.name || '' }));
  }, [user]);

  // Reset claims page when claims list updates
  useEffect(() => { setClaimsPage(1); }, [claims]);

  // ── Status update ─────────────────────────────────────────────────────────

  const handleStatusUpdate = async () => {
    const currentStatus = item?.exceptiondto?.status;
    if (!newStatus || newStatus === currentStatus) return false;

    setStatusMsg({ type: '', text: '' });
    setUpdatingStatus(true);
    try {
      await updateExceptionStatus(id, newStatus);
      await loadException();
      setStatusMsg({ type: 'success', text: 'Status updated successfully.' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
      return true;
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to update status. Please try again.' });
      setNewStatus(currentStatus);
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
      return false;
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── File claim ────────────────────────────────────────────────────────────

  const handleClaimChange = (e) => {
    const { name, value } = e.target;
    setClaimFields((prev) => ({ ...prev, [name]: value }));
    if (claimErrors[name]) setClaimErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    setClaimApiError('');
    const validationErrors = validateClaimForm(claimFields);
    if (Object.keys(validationErrors).length > 0) {
      setClaimErrors(validationErrors);
      return;
    }

    const payload = {
      filedBy:         claimFields.filedBy.trim(),
      amountClaimed:   Number(claimFields.amountClaimed),
      resolutionNotes: claimFields.resolutionNotes.trim() || null,
      exceptionID:     Number(id),
    };

    setClaimSaving(true);
    createClaim(payload)
      .then(() => {
        setShowClaimForm(false);
        setClaimFields(EMPTY_CLAIM);
        setClaimErrors({});
        loadClaims();
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data ||
          'Failed to file claim.';
        setClaimApiError(String(msg));
        setClaimSaving(false);
      });
  };

  // ── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <Layout>
        <div className="loading-spinner">Loading exception…</div>
      </Layout>
    );
  }

  if (error || !item) {
    return (
      <Layout>
        <div className="error-banner">
          <span>⚠️ {error || 'Exception not found.'}</span>
          <button onClick={() => navigate('/exceptions')}>← Back</button>
        </div>
      </Layout>
    );
  }

  const ex = item.exceptiondto || {};
  const bk = item.bookingdto   || {};

  const typeCfg   = EXCEPTION_TYPE_CONFIG[ex.type]     || { label: ex.type,   cls: '', icon: '⚠️' };
  const statusCfg = EXCEPTION_STATUS_CONFIG[ex.status] || { label: ex.status, cls: '' };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="bookings-page booking-detail-page">

        {/* ── Header ── */}
        <div className="detail-header">
          <div className="detail-header-left">
            <button className="back-btn" onClick={() => navigate('/exceptions')}>←</button>
            <div>
              <div className="detail-booking-id">{formatExceptionId(ex.exceptionID)}</div>
              <div className="page-subtitle">Exception Detail</div>
            </div>
          </div>
          <div className="detail-header-right">
            {canEditStatus && !isEditMode && (
              <button className="btn-edit" onClick={() => { setIsEditMode(true); setNewStatus(ex.status); }}>
                Edit
              </button>
            )}
          </div>
        </div>



        {/* ── Detail Cards Grid ── */}
        <div className="detail-grid">

          {/* Exception Info */}
          <div className="detail-card">
            <p className="detail-card-title">Exception Details</p>
            <div className="detail-row-2">
              <div className="detail-field">
                <span className="detail-label">Exception ID</span>
                <span className="detail-value">
                  {formatExceptionId(ex.exceptionID)}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Type</span>
                <span className="detail-value">
                  <span className={`status-badge ${typeCfg.cls}`}>
                    {typeCfg.label}
                  </span>
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Reported By</span>
                <span className="detail-value">{reporterName || (ex.reportedBy ? String(ex.reportedBy) : '–')}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Reported At</span>
                <span className="detail-value">{formatDateTime(ex.reportedAt)}</span>
              </div>
              {ex.updatedAt && (
                <div className="detail-field">
                  <span className="detail-label">Last Updated</span>
                  <span className="detail-value">{formatDateTime(ex.updatedAt)}</span>
                </div>
              )}
              <div className="detail-field">
                <div className="meta-status-label-row">
                  <span className="detail-label">Status</span>
                </div>
                <div className="detail-value meta-status-value">
                  {isEditMode && canEditStatus ? (
                    <div className="meta-status-edit-row">
                      <select
                        className="status-update-select"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        {Object.entries(EXCEPTION_STATUS_CONFIG).map(([key, cfg]) => (
                          <option key={key} value={key}>{cfg.label}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className={`status-badge ${statusCfg.cls}`}>{statusCfg.label}</span>
                  )}
                  {statusMsg.text && (
                    <span className={`update-msg ${statusMsg.type === 'error' ? 'update-msg-error' : ''}`}>
                      {statusMsg.text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Info */}
          <div className="detail-card">
            <p className="detail-card-title">Linked Booking</p>
            {bk.bookingID ? (
              <div className="detail-row-2">
                <div className="detail-field">
                  <span className="detail-label">Booking ID</span>
                  <span className="detail-value">{formatBookingId(bk.bookingID)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">{bk.status || '–'}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Origin</span>
                  <span className="detail-value">{siteName(bk.originSiteID)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Destination</span>
                  <span className="detail-value">{siteName(bk.destinationSiteID)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Commodity</span>
                  <span className="detail-value">{bk.commodity || '–'}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Weight / Volume</span>
                  <span className="detail-value">
                    {bk.weightKg != null ? `${bk.weightKg} kg` : '–'}
                    {bk.volumeM3 != null ? ` · ${bk.volumeM3} m³` : ''}
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Pickup Window</span>
                  <span className="detail-value">
                    {formatDate(bk.pickupWindowStart)} – {formatDate(bk.pickupWindowEnd)}
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Delivery Window</span>
                  <span className="detail-value">
                    {formatDate(bk.deliveryWindowStart)} – {formatDate(bk.deliveryWindowEnd)}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No booking data available.</p>
            )}
          </div>

          {/* Description — full width */}
          <div className="detail-card detail-card-wide">
            <p className="detail-card-title">Incident Description</p>
            <p className="detail-notes">{ex.description || '–'}</p>
          </div>

          {/* Claims — full width */}
          <div className="detail-card detail-card-wide">
            <p className="detail-card-title">
              Filed Claims
              {claims.length > 0 && (
                <span style={{ marginLeft: 8, fontWeight: 400, color: '#94a3b8' }}>
                  ({claims.length})
                </span>
              )}
            </p>

            {claimsLoading && (
              <div className="loading-spinner" style={{ padding: '10px 0' }}>
                Loading claims…
              </div>
            )}

            {!claimsLoading && claims.length === 0 && (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <div className="empty-text">No claims filed yet</div>
              <div className="empty-sub">
                {CLAIM_CREATE_ROLES.includes(user?.role) && (
                  <button
                    className="btn-secondary"
                    style={{ marginTop: 10, fontSize: 14, padding: '6px 18px' }}
                    onClick={() => navigate(`/claims/new?exceptionId=${encodeURIComponent(ex.exceptionID)}`)}
                  >
                    File Claim
                  </button>
                )}
              </div>
            </div>
          )}

            {!claimsLoading && claims.length > 0 && (
              <>
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Filed By</th>
                    <th>Filed At</th>
                    <th>Amount Claimed</th>
                    <th>Resolution Notes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.slice((claimsPage - 1) * CLAIMS_PAGE_SIZE, claimsPage * CLAIMS_PAGE_SIZE).map((claim) => {
                    const claimStatusCfg =
                      CLAIM_STATUS_CONFIG[claim.status] || { label: claim.status, cls: '' };
                    return (
                      <tr key={claim.claimID}>
                        <td>
                          <span className="booking-id-cell">
                            {formatClaimId(claim.claimID)}
                          </span>
                        </td>
                        <td>{claimFilerNames[claim.filedBy] || (claim.filedBy ? String(claim.filedBy) : '–')}</td>
                        <td>{formatDateTime(claim.filedAt)}</td>
                        <td>
                          <span className="amount-cell">
                            {formatCurrency(claim.amountClaimed)}
                          </span>
                        </td>
                        <td>
                          <span className="desc-cell" title={claim.resolutionNotes}>
                            {claim.resolutionNotes || '–'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${claimStatusCfg.cls}`}>
                            {claimStatusCfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Claims pagination */}
              {!claimsLoading && claims.length > CLAIMS_PAGE_SIZE && (
                <div className="pagination" style={{ justifyContent: 'center', marginTop: 12 }}>
                  <button className="pagination-btn" onClick={() => setClaimsPage((p) => Math.max(1, p - 1))} disabled={claimsPage === 1}>‹ Prev</button>
                  {Array.from({ length: Math.max(1, Math.ceil(claims.length / CLAIMS_PAGE_SIZE)) }, (_, i) => i + 1).map((p) => (
                    <button key={p} className={`pagination-btn ${claimsPage === p ? 'pagination-btn-active' : ''}`} onClick={() => setClaimsPage(p)}>{p}</button>
                  ))}
                  <button className="pagination-btn" onClick={() => setClaimsPage((p) => Math.min(Math.max(1, Math.ceil(claims.length / CLAIMS_PAGE_SIZE)), p + 1))} disabled={claimsPage === Math.max(1, Math.ceil(claims.length / CLAIMS_PAGE_SIZE))}>Next ›</button>
                </div>
              )}

              </>
            )}
          </div>
        </div>

        {/* Edit action row: Save / Cancel buttons outside the card, matching Booking Detail UX */}
        {isEditMode && canEditStatus && (
          <div className="meta-edit-actions">
            <button
              className="btn-primary"
              onClick={async () => { const ok = await handleStatusUpdate(); if (ok) setIsEditMode(false); }}
              disabled={updatingStatus || newStatus === ex.status}
            >
              {updatingStatus ? 'Saving…' : 'Save'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => { setNewStatus(ex.status); setIsEditMode(false); }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── File Claim Slide-in Panel ── */}
        {showClaimForm && (
          <div
            className="claim-form-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowClaimForm(false);
            }}
          >
            <div className="claim-form-panel">
              <h2>📋 File a Claim</h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                Linked to exception{' '}
                <strong>{formatExceptionId(ex.exceptionID)}</strong> —{' '}
                {formatBookingId(ex.bookingId)}
              </p>

              <form
                onSubmit={handleClaimSubmit}
                noValidate
                className="form-section"
              >
                <div className="form-field">
                  <label>
                    Filed By <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="filedBy"
                    placeholder="Full name or employee ID"
                    value={claimFields.filedBy}
                    onChange={handleClaimChange}
                    className={claimErrors.filedBy ? 'input-error' : ''}
                  />
                  {claimErrors.filedBy && (
                    <span className="error-msg">{claimErrors.filedBy}</span>
                  )}
                </div>

                <div className="form-field">
                  <label>
                    Amount Claimed (₹) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="amountClaimed"
                    placeholder="e.g. 50000"
                    value={claimFields.amountClaimed}
                    onChange={handleClaimChange}
                    className={claimErrors.amountClaimed ? 'input-error' : ''}
                    min="0.01"
                    step="0.01"
                  />
                  {claimErrors.amountClaimed && (
                    <span className="error-msg">{claimErrors.amountClaimed}</span>
                  )}
                </div>

                <div className="form-field">
                  <label>Resolution Notes</label>
                  <textarea
                    name="resolutionNotes"
                    rows={3}
                    placeholder="Optional — describe the basis for this claim or any supporting details…"
                    value={claimFields.resolutionNotes}
                    onChange={handleClaimChange}
                  />
                </div>

                {claimApiError && (
                  <div className="error-banner">
                    <span>⚠️ {claimApiError}</span>
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowClaimForm(false)}
                    disabled={claimSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={claimSaving}
                  >
                    {claimSaving ? 'Filing…' : '📋 File Claim'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
