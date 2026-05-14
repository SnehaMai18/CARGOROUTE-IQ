import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { AuthContext } from '../../auth/AuthContext';
import {
  getAllClaims,
  resolveUserById,
} from '../../api/exceptionsApi';
import {
  CLAIM_STATUS_CONFIG,
} from '../../utils/constants';
import { exportCSV } from '../../utils/csvExport';
import '../../styles/Bookings.css';
import '../../styles/Exceptions.css';
import Pagination1 from '../../components/Pagination1';

// ── Formatters ───────────────────────────────────────────────────────────────

function formatClaimId(id) {
  return `CL${String(id).padStart(4, '0')}`;
}

function formatExceptionId(id) {
  return id ? `EX${String(id).padStart(4, '0')}` : '–';
}

function formatBookingId(id) {
  return id ? `BK${String(id).padStart(4, '0')}` : '–';
}

// ── Component ────────────────────────────────────────────────────────────────


export default function ClaimsList() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Data
  const [claims, setClaims]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Filtering
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 4;
  const [openMenuId, setOpenMenuId] = useState(null);
  const [filedByNames, setFiledByNames] = useState({});

  // Status update inline — handled on ClaimDetail page

  // ── Loaders ──────────────────────────────────────────────────────────────

  const loadClaims = useCallback(() => {
    setLoading(true);
    setError('');
    getAllClaims()
      .then(setClaims)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadClaims(); }, [loadClaims]);

  // Resolve filedBy numeric IDs to display names
  useEffect(() => {
    if (claims.length === 0) return;
    const ids = [...new Set(claims.map((c) => c.filedBy).filter(Boolean))];
    ids.forEach((id) => {
      resolveUserById(id).then((name) => setFiledByNames((p) => ({ ...p, [id]: name })));
    });
  }, [claims]);

  // Reset to first page whenever search/filter changes
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filtered = claims.filter((claim) => {
    const q = search.toLowerCase().trim();
    const exId  = claim.exception?.exceptiondto?.exceptionID;
    const bkId  = claim.exception?.exceptiondto?.bookingId;

    const matchSearch =
      !q ||
      formatClaimId(claim.claimID).toLowerCase().includes(q) ||
      formatExceptionId(exId).toLowerCase().includes(q) ||
      String(exId || '').includes(q) ||
      formatBookingId(bkId).toLowerCase().includes(q) ||
      String(bkId || '').includes(q);

    const matchStatus = statusFilter === 'ALL' || claim.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = {
    total:       claims.length,
    open:        claims.filter((c) => c.status === 'OPEN').length,
    underReview: claims.filter((c) => c.status === 'UNDER_REVIEW').length,
    settled:     claims.filter((c) => c.status === 'SETTLED').length,
  };



  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="bookings-page exceptions-page">

        {/* ── Page Header ── */}
          <div className="page-header">
          <div>
            <h1 className="page-title">Claims</h1>
            <p className="page-subtitle">
              Manage compensation claims linked to freight exceptions
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-secondary"
              onClick={() => navigate('/exceptions')}
            >
              ← Exceptions
            </button>
            {(user?.role === 'Admin' || user?.role === 'Shipper') && (
              <button
                className="btn-primary"
                title="File Claim"
                onClick={() => navigate('/claims/new')}
                style={{ fontSize: 22, lineHeight: 1, padding: '6px 16px' }}
              >
                +
              </button>
            )}
          </div>
        </div>

        {/* ── Pagination (moved below table) ── */}

        {/* ── Stats Cards ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Claims</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Open</div>
            <div className="stat-value stat-pending">{stats.open}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Under Review</div>
            <div className="stat-value stat-transit">{stats.underReview}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Settled</div>
            <div className="stat-value stat-delivered">{stats.settled}</div>
          </div>
        </div>

        {/* ── Table Section ── */}
        <div className="table-section">
          <h2 className="section-title">All Claims</h2>

          {/* Toolbar */}
          <div className="table-toolbar">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search by Claim ID, Exception ID, or Booking ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="toolbar-right">
              <div className="status-dropdown-wrapper">
                <select
                  className="status-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Status</option>
                  {Object.entries(CLAIM_STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
              <button className="btn-export" onClick={() => {
                const headers = ['Claim ID','Exception','Booking','Filed By','Status'];
                const rows = filtered.map((claim) => {
                  const exDto = claim.exception?.exceptiondto || {};
                  return [
                    `CL${String(claim.claimID).padStart(4, '0')}`,
                    exDto.exceptionID ? `EX${String(exDto.exceptionID).padStart(4, '0')}` : '',
                    exDto.bookingId ? `BK${String(exDto.bookingId).padStart(4, '0')}` : '',
                    claim.filedBy || '',
                    claim.status || '',
                  ];
                });
                exportCSV('claims.csv', headers, rows);
              }}>⬇ Export</button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-message auth-message-error" style={{ marginBottom: 16 }}>
              ⚠ {error}
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="empty-state">Loading claims…</div>
          ) : (
            <div className="table-wrapper">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Exception</th>
                    <th>Booking</th>
                    <th>Filed By</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty-state">
                        {claims.length === 0
                          ? (user?.role === 'Admin' || user?.role === 'Shipper'
                              ? 'No claims filed yet. Use "File Claim" to get started.'
                              : 'No claims available to display.')
                          : 'No claims match your search.'}
                      </td>
                    </tr>
                  ) : paginated.map((claim) => {
                    const exDto     = claim.exception?.exceptiondto || {};
                    const statusCfg = CLAIM_STATUS_CONFIG[claim.status] || { label: claim.status, cls: '' };

                    return (
                      <tr key={claim.claimID} className="table-row"
                        onClick={() => navigate(`/claims/${claim.claimID}`)}>
                        <td className="booking-id-cell">{formatClaimId(claim.claimID)}</td>
                        <td>
                          <button
                            className="btn-view"
                            onClick={(e) => { e.stopPropagation(); navigate(`/exceptions/${exDto.exceptionID}`); }}
                          >
                            {formatExceptionId(exDto.exceptionID)}
                          </button>
                        </td>
                        <td className="booking-id-cell">{formatBookingId(exDto.bookingId)}</td>
                        <td>{filedByNames[claim.filedBy] || (claim.filedBy ? String(claim.filedBy) : '–')}</td>
                        <td>
                          <span className={`status-badge ${statusCfg.cls}`}>{statusCfg.label}</span>
                        </td>
                        <td>
                          <div className="action-menu" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="kebab-btn"
                              aria-label="Actions"
                              onClick={() => setOpenMenuId(openMenuId === claim.claimID ? null : claim.claimID)}
                            >
                              ⋯
                            </button>
                            {openMenuId === claim.claimID && (
                              <div className="kebab-dropdown">
                                <button
                                  className="kebab-item"
                                  onClick={() => { setOpenMenuId(null); navigate(`/claims/${claim.claimID}`); }}
                                >
                                  View
                                </button>
                                <button
                                  className="kebab-item"
                                  onClick={() => { setOpenMenuId(null); navigate(`/claims/${claim.claimID}/edit`); }}
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <Pagination1
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              infoText={`Page ${currentPage} of ${totalPages}`}
            />
          )}
        </div>
      </div>


    </Layout>
  );
}
