import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { AuthContext } from '../../auth/AuthContext';
import { getAllExceptions, resolveUserById } from '../../api/exceptionsApi';
import {
  EXCEPTION_TYPE_CONFIG,
  EXCEPTION_STATUS_CONFIG,
} from '../../utils/constants';
import { exportCSV } from '../../utils/csvExport';
import '../../styles/Bookings.css';
import '../../styles/Exceptions.css';
import '../../styles/Fleet.css';
import Pagination1 from '../../components/Pagination1';

// ── Formatters ──────────────────────────────────────────────────────────────

function formatExceptionId(id) {
  return `EX${String(id).padStart(4, '0')}`;
}

function formatBookingId(id) {
  return id ? `BK${String(id).padStart(4, '0')}` : '–';
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

// ── Component ───────────────────────────────────────────────────────────────

export default function ExceptionsList() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter]     = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reporterNames, setReporterNames] = useState({});
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 4;
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openUp, setOpenUp] = useState(false);

  // ── Data loading ────────────────────────────────────────────────────────

  const loadExceptions = useCallback(() => {
    setLoading(true);
    setError('');
    getAllExceptions()
      .then(setExceptions)
      .catch((err) => {
        setError(err?.response?.data?.message || 'Unable to load exceptions.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadExceptions(); }, [loadExceptions]);

  // Batch-resolve reporter names whenever the exceptions list changes
  useEffect(() => {
    if (exceptions.length === 0) return;
    const uniqueIds = [...new Set(
      exceptions.map((item) => item.exceptiondto?.reportedBy).filter(Boolean)
    )];
    uniqueIds.forEach((id) => {
      resolveUserById(id).then((name) =>
        setReporterNames((prev) => ({ ...prev, [id]: name }))
      );
    });
  }, [exceptions]);

  // Reset to first page whenever search/filter changes
  useEffect(() => { setCurrentPage(1); }, [search, typeFilter, statusFilter]);

  // ── Filtering ───────────────────────────────────────────────────────────

  const filtered = exceptions.filter((item) => {
    const ex = item.exceptiondto || {};
    const q  = search.toLowerCase().trim();

    const matchSearch =
      !q ||
      formatExceptionId(ex.exceptionID).toLowerCase().includes(q) ||
      formatBookingId(ex.bookingId).toLowerCase().includes(q) ||
      String(ex.bookingId || '').includes(q);

    const matchType   = typeFilter === 'ALL'   || ex.type   === typeFilter;
    const matchStatus = statusFilter === 'ALL' || ex.status === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ── Stats ────────────────────────────────────────────────────────────────

  const stats = {
    total:    exceptions.length,
    pending:  exceptions.filter((e) => e.exceptiondto?.status === 'PENDING').length,
    inReview: exceptions.filter((e) => e.exceptiondto?.status === 'IN_REVIEW').length,
    resolved: exceptions.filter((e) => e.exceptiondto?.status === 'RESOLVED').length,
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="bookings-page exceptions-page">

        {/* ── Page Header ── */}
          <div className="page-header">
          <div>
            <div className="page-title-group">
              <span className="page-title-icon">⚠️</span>
              <h1 className="page-title">Exceptions</h1>
            </div>
            <p className="page-subtitle">
              Track and manage freight exceptions, delays and incidents
            </p>
          </div>
          {(user?.role === 'Shipper' || user?.role === 'Dispatcher') && (
            <button
              className="btn-primary"
              title="Report Exception"
              onClick={() => navigate('/exceptions/new')}
              style={{ fontSize: 22, lineHeight: 1, padding: '6px 16px' }}
            >
              +
            </button>
          )}
        </div>

        {/* ── Stats Cards ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Exceptions</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending</div>
            <div className="stat-value stat-pending">{stats.pending}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Review</div>
            <div className="stat-value stat-transit">{stats.inReview}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Resolved</div>
            <div className="stat-value stat-delivered">{stats.resolved}</div>
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="auth-message auth-message-error" style={{ marginBottom: 16 }}>
            ⚠ {error}
          </div>
        )}

        {/* ── Table Section ── */}
        <div className="table-section">
          <h2 className="section-title">All Exceptions</h2>

          {/* Toolbar */}
          <div className="table-toolbar">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search by Exception ID or Booking ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="toolbar-right">
              <div className="filter-wrapper">
                <select
                  className="status-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="ALL">Type</option>
                  {Object.entries(EXCEPTION_TYPE_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
              <div className="status-dropdown-wrapper">
                <select
                  className="status-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Status</option>
                  {Object.entries(EXCEPTION_STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
              <button className="btn-export" onClick={() => {
                const headers = ['Exception ID','Type','Booking','Reported By','Status'];
                const rows = filtered.map((item) => {
                  const ex = item.exceptiondto || {};
                  return [
                    `EX${String(ex.exceptionID).padStart(4, '0')}`,
                    (EXCEPTION_TYPE_CONFIG[ex.type]?.label) || ex.type,
                    ex.bookingId ? `BK${String(ex.bookingId).padStart(4, '0')}` : '',
                    ex.reportedBy || '',
                    ex.status || '',
                  ];
                });
                exportCSV('exceptions.csv', headers, rows);
              }}>⬇ Export</button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="empty-state">Loading exceptions…</div>
          ) : (
            <div className="table-wrapper">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Exception ID</th>
                    <th>Type</th>
                    <th>Booking</th>
                    <th>Reported By</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty-state">
                        {exceptions.length === 0
                          ? (user?.role === 'Admin'
                              ? 'No exceptions available to display.'
                              : ((user?.role === 'Shipper' || user?.role === 'Dispatcher')
                                  ? 'No exceptions reported yet. Click "Report Exception" to get started.'
                                  : 'No exceptions reported yet.'))
                          : 'No exceptions match your search.'}
                      </td>
                    </tr>
                  ) : (
                    paginated.map((item) => {
                      const ex  = item.exceptiondto || {};
                      const typeCfg   = EXCEPTION_TYPE_CONFIG[ex.type]     || { label: ex.type,   cls: '', icon: '' };
                      const statusCfg = EXCEPTION_STATUS_CONFIG[ex.status] || { label: ex.status, cls: '' };

                      return (
                        <tr
                          key={ex.exceptionID}
                          className="table-row"
                          onClick={() => navigate(`/exceptions/${ex.exceptionID}`)}
                        >
                          <td className="booking-id-cell">
                            {formatExceptionId(ex.exceptionID)}
                          </td>
                          <td>
                            <span className={`status-badge ${typeCfg.cls}`}>
                              {typeCfg.label}
                            </span>
                          </td>
                          <td className="booking-id-cell">
                            {formatBookingId(ex.bookingId)}
                          </td>
                          <td>{ex.reportedBy ? (reporterNames[ex.reportedBy] || String(ex.reportedBy)) : '–'}</td>
                          <td>
                            <span className={`status-badge ${statusCfg.cls}`}>
                              {statusCfg.label}
                            </span>
                          </td>
                          <td>
                            <div className="kebab-menu-wrapper">
                              <button
                                className={`kebab-trigger ${openMenuId === ex.exceptionID ? 'active' : ''}`}
                                onClick={(e) => {
                                  const rect = e.target.closest('.kebab-menu-wrapper').getBoundingClientRect();
                                  const spaceBelow = window.innerHeight - rect.bottom;
                                  const spaceAbove = rect.top;
                                  const dropdownHeight = 50; // approximate height
                                  const shouldOpenUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
                                  setOpenUp(shouldOpenUp);
                                  setOpenMenuId(openMenuId === ex.exceptionID ? null : ex.exceptionID);
                                }}
                                aria-label="Actions"
                              >
                                ...
                              </button>
                              {openMenuId === ex.exceptionID && (
                                <div className={`kebab-dropdown-card ${openUp ? 'open-up' : ''}`}>
                                  <button
                                    onClick={() => { setOpenMenuId(null); navigate(`/exceptions/${ex.exceptionID}`); }}
                                  >
                                    View
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
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
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
