import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function ClaimDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [claim, setClaim]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);
  const [filedByName, setFiledByName] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [editingStatus, setEditingStatus] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState({ type: '', text: '' });

  useEffect(() => {
    getClaimById(id)
      .then((data) => { setClaim(data); setNewStatus(data.status); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Resolve filedBy display name after claim loads
  useEffect(() => {
    if (!claim?.filedBy) return;
    resolveUserById(claim.filedBy).then((n) => setFiledByName(n));
  }, [claim]);

  const { user } = useContext(AuthContext);
  // Only Admin may edit claim status in the UI
  const CLAIM_STATUS_EDIT_ROLES = ['Admin'];

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === claim.status) return false;
    setSaving(true);
    try {
      const updated = await updateClaimStatus(id, newStatus);
      setClaim(updated);
      setMsg({ type: 'success', text: 'Status updated successfully.' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      return true;
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update status.' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      return false;
    } finally {
      setSaving(false);
    }
  };

  if (loading)  return <Layout><div className="empty-state">Loading…</div></Layout>;
  if (notFound) return <Layout><div className="empty-state">Claim not found.</div></Layout>;

  const exDto     = claim.exception?.exceptiondto || {};
  const statusCfg = CLAIM_STATUS_CONFIG[claim.status]   || { label: claim.status,   cls: 'status-pending' };
  const typeCfg   = EXCEPTION_TYPE_CONFIG[exDto.type]   || { label: exDto.type,     cls: '' };
  const exStCfg   = EXCEPTION_STATUS_CONFIG[exDto.status] || { label: exDto.status, cls: '' };

  return (
    <Layout>
      <div className="booking-detail-page">

        {/* ── Header ── */}
        <div className="detail-header">
          <div className="detail-header-left">
            <button className="back-btn" onClick={() => navigate('/claims')}>←</button>
            <div>
              <div className="detail-booking-id">{formatClaimId(claim.claimID)}</div>
              <div className="page-subtitle">Claim Detail</div>
            </div>
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
                <div className="meta-status-label-row">
                  <span className="detail-label">Status</span>
                  
                </div>
                <div className="detail-value meta-status-value">
                  {!editingStatus ? (
                    <span className={`status-badge ${statusCfg.cls}`}>{statusCfg.label}</span>
                  ) : (
                    <div className="meta-status-edit-row">
                      <select
                        className="status-update-select"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        {Object.entries(CLAIM_STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                      <button
                        className="btn-primary"
                        onClick={async () => { const ok = await handleStatusUpdate(); if (ok) setEditingStatus(false); }}
                        disabled={saving || newStatus === claim.status}
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => { setNewStatus(claim.status); setEditingStatus(false); }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
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
                <div className="detail-label">Booking ID</div>
                <div className="detail-value booking-id-cell">
                  {formatBookingId(exDto.bookingId)}
                </div>
              </div>
            </div>
            <div className="detail-row-2" style={{ marginTop: 12 }}>
              <div className="detail-field">
                <div className="detail-label">Exception Type</div>
                <div className="detail-value">
                  {exDto.type
                    ? <span className={`status-badge ${typeCfg.cls}`}>{typeCfg.label}</span>
                    : '–'}
                </div>
              </div>
              <div className="detail-field">
                <div className="detail-label">Exception Status</div>
                <div className="detail-value">
                  {exDto.status
                    ? <span className={`status-badge ${exStCfg.cls}`}>{exStCfg.label}</span>
                    : '–'}
                </div>
              </div>
            </div>
            {/* Simplified: keep only reference fields (ID, Booking ID, Type, Status) */}
          </div>

        </div>

        {/* Footer actions removed: rely on top navigation and contextual links */}

      </div>
    </Layout>
  );
}
