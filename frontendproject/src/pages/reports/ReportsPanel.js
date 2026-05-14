import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import Pagination1 from '../../components/Pagination1';
import ActionMenuPortal from '../../components/ActionMenuPortal';
import { AuthContext } from '../../auth/AuthContext';
import { generateOnTimeReport, generateUtilizationReport, generateRevenueReport, generateExceptionReport, getAllReports, deleteReport, exportReports } from '../../api/reportApi';
import '../../styles/Reports.css';

const SCOPE_OPTIONS = [
  { value: 'ONTIME',      label: 'On-Time Delivery' },
  { value: 'REVENUE',     label: 'Revenue' },
  { value: 'UTILIZATION', label: 'Utilization' },
  { value: 'EXCEPTIONS',  label: 'Exceptions' },
];

function fmtDate(dt) {
  if (!dt) return '\u2014';
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function parseMetrics(json) {
  try { return JSON.parse(json); } catch { return {}; }
}

export default function ReportsPanel() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [success,    setSuccess]    = useState('');

  // ── Load success message from navigation ─────────────────────────
  useEffect(() => {
    if (location.state?.success) {
      setSuccess(location.state.success);
      window.history.replaceState({}, document.title);
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const [scope,      setScope]      = useState('ONTIME');
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError,   setGenError]   = useState('');
  const [genResult,  setGenResult]  = useState(null);

  const [reports,      setReports]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [listError,    setListError]    = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [viewReport,   setViewReport]   = useState(null);

  const [currentPage,  setCurrentPage]  = useState(1);
  const [filterScope,  setFilterScope]  = useState('');
  const [sortColumn,   setSortColumn]   = useState('generatedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const rowsPerPage = 4;

  const loadReports = useCallback(() => {
    setLoading(true);
    setListError('');
    getAllReports()
      .then(setReports)
      .catch((e) => { setListError(e.message); setReports([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

  useEffect(() => { setCurrentPage(1); }, [filterScope]);

  const filteredReports = filterScope
    ? reports.filter((r) => r.scope === filterScope)
    : reports;

  const totalPages = Math.ceil(filteredReports.length / rowsPerPage);
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;
  const sortedReports = [...filteredReports].sort((a, b) => {
    let aVal, bVal;
    if (sortColumn === 'generatedAt') {
      aVal = new Date(a.generatedAt);
      bVal = new Date(b.generatedAt);
    } else if (sortColumn === 'generatedBy') {
      aVal = (a.generatedBy || '').toLowerCase();
      bVal = (b.generatedBy || '').toLowerCase();
    } else if (sortColumn === 'scope') {
      aVal = (a.scope || '').toLowerCase();
      bVal = (b.scope || '').toLowerCase();
    } else {
      aVal = a.reportID;
      bVal = b.reportID;
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  const currentRows = sortedReports.slice(indexOfFirstRow, indexOfFirstRow + rowsPerPage);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleGenerate = async () => {
    if (!dateFrom || !dateTo) { setGenError('Please select both Date From and Date To.'); return; }
    if (dateTo < dateFrom)    { setGenError('Date To must be after Date From.'); return; }
    setGenerating(true);
    setGenError('');
    setGenResult(null);
    try {
      let result;
      if (scope === 'UTILIZATION') {
        result = await generateUtilizationReport({ dateFrom, dateTo, userName: user?.name || '', userRole: user?.role || '' });
      } else if (scope === 'REVENUE') {
        result = await generateRevenueReport({ dateFrom, dateTo, userName: user?.name || '', userRole: user?.role || '' });
      } else if (scope === 'EXCEPTIONS') {
        result = await generateExceptionReport({ dateFrom, dateTo, userName: user?.name || '', userRole: user?.role || '' });
      } else {
        result = await generateOnTimeReport({ dateFrom, dateTo, userName: user?.name || '', userRole: user?.role || '' });
      }
      setGenResult(result);
      setSuccess(`✅ ${scope} report #${result.reportID} generated successfully.`);
      // Auto-dismiss success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      loadReports();
    } catch (e) {
      setGenError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteReport(deleteTarget);
      setDeleteTarget(null);
      if (viewReport?.reportID === deleteTarget) setViewReport(null);
      setSuccess(`✅ Report #${deleteTarget} deleted successfully.`);
      // Auto-dismiss success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      loadReports();
    } catch (e) {
      setListError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportReports(); // Assuming exportReports is an API function
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setListError(e.message || 'Failed to export reports');
    }
  };

  return (
    <Layout>
      <div className="reports-page">

        <div className="page-header">
          <div>
            <h1 className="page-title" style={{ fontSize: '20px' }}>📊 Reports</h1>
            <p className="page-subtitle">Generate and view key performance indicator reports</p>
          </div>
          <button className="btn-add-new" onClick={() => navigate('/reports/create')} title="Create New Report">+</button>
        </div>

        {/* ── Success notification banner ─────────────────────────── */}
        {success && (
          <div className="success-banner">
            {success}
          </div>
        )}

        <div className="reports-stats-grid">
          <div className="stat-card">
            <div className="stat-label">On-Time Reports</div>
            <div className="stat-value stat-active">{loading ? '\u2014' : reports.filter(r => r.scope === 'ONTIME').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Utilization Reports</div>
            <div className="stat-value stat-active">{loading ? '\u2014' : reports.filter(r => r.scope === 'UTILIZATION').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Revenue Reports</div>
            <div className="stat-value stat-active">{loading ? '\u2014' : reports.filter(r => r.scope === 'REVENUE').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Exception Reports</div>
            <div className="stat-value stat-active">{loading ? '\u2014' : reports.filter(r => r.scope === 'EXCEPTIONS').length}</div>
          </div>
        </div>

        <div className="report-generate-card">
          <div className="report-generate-header">
            <span className="report-generate-title">⚡ Generate New</span>
          </div>
          <div className="report-generate-body">
            <div className="report-form-field">
              <label className="report-form-label">Report Scope</label>
              <select className="report-select" value={scope} onChange={(e) => { setScope(e.target.value); setGenError(''); setGenResult(null); }}>
                {SCOPE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
            </div>
            <div className="report-form-field">
              <label className="report-form-label">Date From</label>
              <input type="date" className="report-date-input" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setGenError(''); }} />
            </div>
            <div className="report-form-field">
              <label className="report-form-label">Date To</label>
              <input type="date" className="report-date-input" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setGenError(''); }} />
            </div>
            <div className="report-generate-action">
              <button className="btn-generate" onClick={handleGenerate} disabled={generating}>
                {generating ? '⏳ Generating\u2026' : '▶ Generate'}
              </button>
            </div>
          </div>
          {genError && <div className="report-error-banner">⚠️ {genError}</div>}
          {genResult && (
            <div className="report-result-preview">
              <div className="report-result-title">✅ Report Generated — #{genResult.reportID}</div>
              <div className="report-result-grid">
                <div className="result-item"><span className="result-label">Scope</span><span className="result-value">{genResult.scope}</span></div>
                {genResult.scope === 'ONTIME' && (<>
                  <div className="result-item"><span className="result-label">Total Bookings</span><span className="result-value">{genResult.totalBookings}</span></div>
                  <div className="result-item"><span className="result-label">On-Time Bookings</span><span className="result-value stat-active">{genResult.onTimeBookings}</span></div>
                  <div className="result-item"><span className="result-label">On-Time %</span><span className="result-value stat-active">{genResult.onTimePercentage}</span></div>
                </>)}
                {genResult.scope === 'REVENUE' && (<>
                  <div className="result-item"><span className="result-label">Total Invoices</span><span className="result-value">{genResult.totalInvoices}</span></div>
                  <div className="result-item"><span className="result-label">Total Revenue</span><span className="result-value stat-active">&#8377;{genResult.totalRevenue?.toLocaleString()}</span></div>
                  <div className="result-item"><span className="result-label">Total Distance (km)</span><span className="result-value">{genResult.totalDistanceKm?.toLocaleString()}</span></div>
                  <div className="result-item"><span className="result-label">Revenue / km</span><span className="result-value stat-active">&#8377;{genResult.revenuePerKm?.toFixed(2)}</span></div>
                </>)}
                {genResult.scope === 'EXCEPTIONS' && (<>
                  <div className="result-item"><span className="result-label">Total Bookings</span><span className="result-value">{genResult.totalBookings}</span></div>
                  <div className="result-item"><span className="result-label">Total Exceptions</span><span className="result-value" style={{ color: '#dc2626' }}>{genResult.totalExceptions}</span></div>
                  <div className="result-item"><span className="result-label">Exception Rate</span><span className="result-value stat-active">{genResult.exceptionRate?.toFixed(2)}%</span></div>
                </>)}
                <div className="result-item"><span className="result-label">Generated At</span><span className="result-value">{fmtDate(genResult.generatedAt)}</span></div>
              </div>
            </div>
          )}
        </div>

        <div className="report-table-section">
          <div className="report-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="report-section-title">All Reports</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select className="scope-filter" value={filterScope} onChange={(e) => setFilterScope(e.target.value)}>
                <option value="">All</option>
                {SCOPE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
              <button className="btn-export" onClick={handleExport}>⬇ Export</button>
            </div>
          </div>

          {listError && <div className="report-error-banner">⚠️ {listError}</div>}

          {loading ? (
            <div className="report-empty">Loading reports\u2026</div>
          ) : filteredReports.length === 0 ? (
            <div className="report-empty">No reports yet. Generate one above.</div>
          ) : (
            <>
              <div className="report-table-wrapper" style={{ overflowX: 'hidden', maxWidth: '100%' }}>
                <table className="report-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                  <colgroup>
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '30%' }} />
                    <col style={{ width: '40%' }} />
                    <col style={{ width: '10%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('reportID')} style={{ cursor: 'pointer' }}>Id {sortColumn === 'reportID' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleSort('scope')} style={{ cursor: 'pointer' }}>Scope {sortColumn === 'scope' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleSort('generatedAt')} style={{ cursor: 'pointer' }}>Generated at {sortColumn === 'generatedAt' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((r) => (
                      <tr key={r.reportID}>
                        <td className="report-id-cell">RPT{String(r.reportID).padStart(3, '0')}</td>
                        <td>
                          <span className={`scope-badge ${
                            r.scope === 'UTILIZATION' ? 'scope-badge-utilization' :
                            r.scope === 'REVENUE'     ? 'scope-badge-revenue' :
                            r.scope === 'EXCEPTIONS'  ? 'scope-badge-exceptions' :
                            'scope-badge-ontime'
                          }`}>{r.scope}</span>
                        </td>
                        <td style={{ fontSize: 13 }}>{fmtDate(r.generatedAt)}</td>
                        <td style={{ position: 'relative', textAlign: 'center' }}>
                          <ActionMenuPortal
                            id={r.reportID}
                            actions={[
                              { label: 'View', onClick: () => navigate('/reports/' + r.reportID) },
                              { label: 'Edit', onClick: () => navigate('/reports/' + r.reportID + '/edit') },
                              { label: 'Delete', onClick: () => { setDeleteTarget(r.reportID); }, danger: true }
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <Pagination1
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    infoText={`Page ${currentPage} of ${totalPages}`}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {viewReport && (
          <div className="modal-overlay" onClick={() => setViewReport(null)}>
            <div className="report-modal" onClick={(e) => e.stopPropagation()}>
              <div className="report-modal-header">
                <span>📊 Report — RPT{String(viewReport.reportID).padStart(3, '0')}</span>
                <button className="modal-close" onClick={() => setViewReport(null)}>✕</button>
              </div>
              <div className="report-modal-body">
                {(() => {
                  const m = parseMetrics(viewReport.metricsJSON);
                  const p = parseMetrics(viewReport.parametersJSON);
                  return (
                    <>
                      <div className="report-detail-grid">
                        <div className="report-detail-item"><span className="report-detail-label">Report ID</span><span className="report-detail-value">RPT{String(viewReport.reportID).padStart(3, '0')}</span></div>
                        <div className="report-detail-item"><span className="report-detail-label">Scope</span><span className={`scope-badge ${viewReport.scope === 'UTILIZATION' ? 'scope-badge-utilization' : 'scope-badge-ontime'}`}>{viewReport.scope}</span></div>
                        <div className="report-detail-item"><span className="report-detail-label">Date From</span><span className="report-detail-value">{p.dateFrom || '\u2014'}</span></div>
                        <div className="report-detail-item"><span className="report-detail-label">Date To</span><span className="report-detail-value">{p.dateTo || '\u2014'}</span></div>
                        <div className="report-detail-item"><span className="report-detail-label">Generated By</span><span className="report-detail-value">{viewReport.generatedBy || '\u2014'}</span></div>
                        <div className="report-detail-item"><span className="report-detail-label">Generated At</span><span className="report-detail-value">{fmtDate(viewReport.generatedAt)}</span></div>
                      </div>
                      {viewReport.scope === 'ONTIME' && (
                        <div className="report-metrics-grid">
                          <div className="metric-card"><div className="metric-label">Total Bookings</div><div className="metric-value">{m.totalBookings ?? '\u2014'}</div></div>
                          <div className="metric-card metric-highlight"><div className="metric-label">On-Time Bookings</div><div className="metric-value">{m.onTimeBookings ?? '\u2014'}</div></div>
                          <div className="metric-card metric-highlight"><div className="metric-label">On-Time Rate</div><div className="metric-value">{m.onTimePercentage ?? '\u2014'}</div></div>
                        </div>
                      )}
                      {viewReport.scope === 'UTILIZATION' && (
                        <div className="report-metrics-grid">
                          <div className="metric-card"><div className="metric-label">Total Fleet Capacity (kg)</div><div className="metric-value">{m.totalFleetCapacityKg ?? '\u2014'}</div></div>
                          <div className="metric-card metric-highlight"><div className="metric-label">Used Capacity (kg)</div><div className="metric-value">{m.usedCapacityKg ?? '\u2014'}</div></div>
                          <div className="metric-card metric-highlight"><div className="metric-label">Fleet Utilization %</div><div className="metric-value">{m.fleetUtilizationPercentage != null ? m.fleetUtilizationPercentage + '%' : '\u2014'}</div></div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              <div className="report-modal-footer">
                <button className="btn-secondary" onClick={() => setViewReport(null)}>Close</button>
                <button className="btn-view-visual" onClick={() => { const id = viewReport.reportID; setViewReport(null); navigate('/reports/' + id); }}>📊 View Visual</button>
                <button className="btn-danger" onClick={() => { setDeleteTarget(viewReport.reportID); setViewReport(null); }}>🗑 Delete</button>
              </div>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
            <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="delete-confirm-icon">🗑️</div>
              <p className="delete-confirm-text">
                Delete report <strong>RPT{String(deleteTarget).padStart(3, '0')}</strong>?
                <br />This action cannot be undone.
              </p>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="btn-danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting\u2026' : 'Delete'}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
