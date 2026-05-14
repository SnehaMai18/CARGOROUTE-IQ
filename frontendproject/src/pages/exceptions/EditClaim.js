import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getClaimById, updateClaimStatus, resolveUserById } from '../../api/exceptionsApi';
import {
  CLAIM_STATUS_CONFIG,
  EXCEPTION_TYPE_CONFIG,
  EXCEPTION_STATUS_CONFIG,
} from '../../utils/constants';
import '../../styles/Bookings.css';
import '../../styles/Exceptions.css';
import { AuthContext } from '../../auth/AuthContext';

function formatClaimId(id)     { return `CL${String(id).padStart(4, '0')}`; }
function formatExceptionId(id) { return id ? `EX${String(id).padStart(4, '0')}` : '–'; }
function formatBookingId(id)   { return id ? `BK${String(id).padStart(4, '0')}` : '–'; }
function formatDateTime(dt) {
  if (!dt) return '–';
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
function formatCurrency(amount) {
  if (amount == null) return '–';
  return `₹${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Roles allowed to edit claim status
const CLAIM_STATUS_EDIT_ROLES = ['Admin'];

export default function EditClaim() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [filedByName, setFiledByName] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // ── Load Claim ─────────────────────────────────────────────────────────────

  useEffect(() => {
    getClaimById(id)
      .then((data) => {
        setClaim(data);
        setNewStatus(data.status);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Resolve filedBy name
  useEffect(() => {
    if (!claim || !claim.filedBy) return;
    resolveUserById(claim.filedBy).then((name) => setFiledByName(name));
  }, [claim]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleStatusUpdate = async () => {
    if (newStatus === claim.status) return false;

    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      await updateClaimStatus(id, newStatus);
      setClaim((prev) => ({ ...prev, status: newStatus }));
      setMsg({ type: 'success', text: 'Status updated successfully.' });
      setSaving(false);
      return true;
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Failed to update status';
      setMsg({ type: 'error', text: String(errMsg) });
      setSaving(false);
      return false;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading claim details…</p>
        </div>
      </Layout>
    );
  }

  if (notFound) {
    return (
      <Layout>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
          <p>⚠️ Claim not found.</p>
          <button className="btn-primary" onClick={() => navigate('/claims')}>
            Back to Claims
          </button>
        </div>
      </Layout>
    );
  }

  const statusCfg = CLAIM_STATUS_CONFIG[claim.status] || { label: claim.status, cls: '' };
  const exDto = claim.exception?.exceptiondto || {};
  const exceptionType = EXCEPTION_TYPE_CONFIG[exDto.exceptionType] || { label: exDto.exceptionType, cls: '' };
  const exceptionStatus = EXCEPTION_STATUS_CONFIG[exDto.exceptionStatus] || { label: exDto.exceptionStatus, cls: '' };

  return (
    <Layout>
      <div className="booking-detail-page exceptions-page">

        {/* ── Page Header ── */}
        <div className="detail-page-header">
          <button className="back-btn" onClick={() => navigate(`/claims/${id}`)}>←</button>
          <div>
            <h1 className="page-title">{formatClaimId(claim.claimID)} — Edit</h1>
            <p className="page-subtitle">
              Update claim status
            </p>
          </div>
        </div>

        {/* ── Detail grid ── */}
        <div className="detail-grid">

          {/* Claim Info */}
          <div className="detail-card">
            <h3 className="detail-card-title">Claim Information</h3>
            <div className="detail-row-2">
              <div className="detail-field">
                <div className="detail-label">Claim ID</div>
                <div className="detail-value">{formatClaimId(claim.claimID)}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Status <span className="required">*</span></div>
                <div className="detail-value meta-status-value">
                  <div className="meta-status-edit-row">
                    <select
                      className="status-update-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      disabled={!CLAIM_STATUS_EDIT_ROLES.includes(user?.role)}
                    >
                      {Object.entries(CLAIM_STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  {msg.text && (
                    <span className={`update-msg ${msg.type === 'error' ? 'update-msg-error' : ''}`}>
                      {msg.text}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="detail-row-2" style={{ marginTop: 14 }}>
              <div className="detail-field">
                <div className="detail-label">Filed By</div>
                <div className="detail-value">{filedByName || (claim.filedBy ? String(claim.filedBy) : '–')}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Filed At</div>
                <div className="detail-value">{formatDateTime(claim.filedAt)}</div>
              </div>
            </div>
          </div>

          {/* Financial */}
          <div className="detail-card">
            <h3 className="detail-card-title">Financials</h3>
            <div className="detail-field">
              <div className="detail-label">Amount Claimed</div>
              <div className="detail-value amount-cell">{formatCurrency(claim.amountClaimed)}</div>
            </div>
            {claim.resolutionNotes && (
              <div className="detail-field" style={{ marginTop: 10 }}>
                <div className="detail-label">Resolution Notes</div>
                <div className="detail-value">{claim.resolutionNotes}</div>
              </div>
            )}
          </div>

          {/* Linked Exception */}
          <div className="detail-card">
            <h3 className="detail-card-title">Linked Exception</h3>
            <div className="detail-row-2">
              <div className="detail-field">
                <div className="detail-label">Exception ID</div>
                <div className="detail-value">
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/exceptions/${exDto.exceptionID}`)}
                  >
                    {formatExceptionId(exDto.exceptionID)}
                  </button>
                </div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Exception Type</div>
                <div className="detail-value">
                  <span className={`status-badge ${exceptionType.cls}`}>{exceptionType.label}</span>
                </div>
              </div>
            </div>
            <div className="detail-row-2" style={{ marginTop: 10 }}>
              <div className="detail-field">
                <div className="detail-label">Exception Status</div>
                <div className="detail-value">
                  <span className={`status-badge ${exceptionStatus.cls}`}>{exceptionStatus.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Booking */}
          <div className="detail-card">
            <h3 className="detail-card-title">Linked Booking</h3>
            <div className="detail-field">
              <div className="detail-label">Booking ID</div>
              <div className="detail-value">
                <button
                  className="btn-view"
                  onClick={() => navigate(`/bookings/${exDto.bookingId}`)}
                >
                  {formatBookingId(exDto.bookingId)}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ── Actions ── */}
        <div className="form-actions-row" style={{ marginTop: '2rem' }}>
          <button
            className="btn-secondary"
            onClick={() => navigate(`/claims/${id}`)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleStatusUpdate}
            disabled={saving || newStatus === claim.status || !CLAIM_STATUS_EDIT_ROLES.includes(user?.role)}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

      </div>
    </Layout>
  );
}
