import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import Pagination1 from '../../components/Pagination1';
import ActionMenuPortal from '../../components/ActionMenuPortal';
import KpiBarChart from '../../components/KpiBarChart';
import KpiPieChart from '../../components/KpiPieChart';
import KpiLineChart from '../../components/KpiLineChart';
import { computeKpi, getAllKpis, deleteKpi, exportKpis } from '../../api/kpiApi';
import '../../styles/Kpi.css';

const KPI_NAMES = ['Utilization', 'OnTime', 'Revenue', 'Exceptions'];

const TARGET_OPTIONS = [90, 95];

const PERIOD_OPTIONS = [
  { value: 'Monthly',   label: 'Monthly (last 1 month)' },
  { value: 'Quarterly', label: 'Quarterly (last 3 months)' },
  { value: 'Yearly',    label: 'Yearly (last 12 months)' },
];

const DEFINITIONS = {
  Utilization: 'Vehicle capacity usage efficiency during the reporting period.',
  OnTime:      'Percentage of deliveries completed within committed time windows.',
  Revenue:     'Total freight revenue generated during the reporting period.',
  Exceptions:  'Number of operational issues recorded during the reporting period.',
};

const KPI_ICONS = {
  Utilization: '🚚',
  OnTime:      '⏱️',
  Revenue:     '💰',
  Exceptions:  '⚠️',
};

function fmtValue(name, val) {
  if (val == null) return '—';
  return `${val}%`;
}

function StatusBadge({ current, target, name }) {
  if (current == null || target == null) return null;
  // For Exceptions lower is better; for others higher is better
  const met = name === 'Exceptions' ? current <= target : current >= target;
  return (
    <span className={`kpi-status-badge ${met ? 'kpi-status-met' : 'kpi-status-miss'}`}>
      {met ? '✅ On Target' : '❌ Below Target'}
    </span>
  );
}

// Small visualizer: horizontal progress bar + numeric delta
function KpiVisualizer({ name, current, target }) {
  if (current == null || target == null) return (
    <div className="kpi-visualizer-empty">No data to visualise</div>
  );

  // For Exceptions, lower is better — compute percent towards target inversely
  const isExceptions = name === 'Exceptions';
  const ratio = isExceptions ? Math.max(0, 1 - (current / target)) : (target === 0 ? 0 : current / target);
  const percent = Math.round(Math.min(999, ratio * 100));

  const met = isExceptions ? current <= target : current >= target;
  const barColor = met ? '#16a34a' : (percent >= 80 ? '#f59e0b' : '#ef4444');

  const diff = (isExceptions ? target - current : current - target);
  const diffLabel = isExceptions ? `${diff <= 0 ? 'At/above' : 'Below by'} ${Math.abs(diff)}` : `${diff >= 0 ? 'Above by' : 'Below by'} ${Math.abs(diff)}`;

  return (
    <div className="kpi-visualizer">
      <div className="kpi-visual-row">
        <div className="kpi-progress">
          <div className="kpi-progress-bar" style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: barColor }} />
          <div className="kpi-target-marker" style={{ left: `${Math.min(100, Math.max(0, (100 * (target !== 0 ? 1 : 0))))}%` }} />
        </div>
        <div className="kpi-visual-stats">
          <div className="kpi-visual-value">{typeof current === 'number' ? current : String(current)}</div>
          <div className="kpi-visual-percent">{percent}%</div>
        </div>
      </div>
      <div className="kpi-visual-diff">{diffLabel} • Target {target}</div>
    </div>
  );
}

export default function KpiPanel() {
  // ── Navigation ──────────────────────────────────────────────────
  const navigate = useNavigate();
  const location = useLocation();
  const [success, setSuccess] = useState('');

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

  // ── Compute form state ────────────────────────────────────────────
  const [kpiName,   setKpiName]   = useState('Utilization');
  const [target,    setTarget]    = useState(90);
  const [period,    setPeriod]    = useState('Monthly');
  const [computing, setComputing] = useState(false);
  const [compError, setCompError] = useState('');
  const [compResult, setCompResult] = useState(null);
  const [computedStatus, setComputedStatus] = useState(null); // null | 'saved'

  // ── Table state ───────────────────────────────────────────────────
  const [kpis,       setKpis]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [listError,  setListError]  = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,   setDeleting]   = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [scopeFilter, setScopeFilter] = useState('All');
  const rowsPerPage = 3;

  // definition auto-populates from selected kpiName
  const definition = DEFINITIONS[kpiName] || '';

  // ── Load all KPIs ─────────────────────────────────────────────────
  const loadKpis = useCallback(() => {
    setLoading(true);
    setListError('');
    return getAllKpis()
      .then((data) => { setKpis(Array.isArray(data) ? data : []); })
      .catch((e) => {
        // 404 just means no KPIs yet — not a real error
        if (e.message && e.message.includes('404')) {
          setKpis([]);
        } else {
          setListError(e.message);
          setKpis([]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadKpis(); }, [loadKpis]);

  // Reset page when data changes
  useEffect(() => { setCurrentPage(1); }, [kpis.length]);

  // ── Compute handler ───────────────────────────────────────────────
  const handleCompute = async () => {
    setComputing(true);
    setCompError('');
    setCompResult(null);
    try {
      console.log('Starting KPI computation with:', { kpiName, target, period });
      const result = await computeKpi({ name: kpiName, target: target, reportingPeriod: period });
      console.log('Compute result:', result);
      setCompResult(result);
      setComputedStatus('saved');
      // Wait a moment before reloading to ensure DB is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      // Reload the KPIs list from database
      await loadKpis();
    } catch (e) {
      setCompError(e.message || 'Failed to compute KPI');
      console.error('Compute error:', e);
    } finally {
      setComputing(false);
    }
  };

  // ── Delete handler ────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteKpi(deleteTarget);
      setDeleteTarget(null);
      loadKpis();
    } catch (e) {
      setListError(e.message);
    } finally {
      setDeleting(false);
    }
  };
 

  // ── Export handler ────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const blob = await exportKpis();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `kpis-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setListError(e.message);
    }
  };

  // ── Summary stats ─────────────────────────────────────────────────
  const statCounts = KPI_NAMES.reduce((acc, n) => {
    acc[n] = kpis.filter((k) => k.name === n).length;
    return acc;
  }, {});

  // latest KPI for the currently selected KPI name (preview)
  const latestForSelected = [...kpis].filter((k) => k.name === kpiName).sort((a, b) => (b.kpiID || 0) - (a.kpiID || 0))[0] || null;

  // ── Filter KPIs by scope ─────────────────────────────────────────
  const filteredKpis = scopeFilter === 'All' 
    ? kpis 
    : kpis.filter((k) => k.name === scopeFilter);
  
  // ── Update pagination for filtered data ──────────────────────────
  const totalPages     = Math.max(1, Math.ceil(filteredKpis.length / rowsPerPage));
  const indexOfFirst   = (currentPage - 1) * rowsPerPage;
  const currentRows    = filteredKpis.slice(indexOfFirst, indexOfFirst + rowsPerPage);
  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

 

  // ── Handle View KPI ──────────────────────────────────────────────
  const handleViewKpi = (kpi) => {
    navigate(`/kpis/${kpi.kpiID}`, { state: { kpi } });
  };

  return (
    <Layout>
      <div className="kpi-page">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="page-header">
          <div>
            <h1 className="page-title" style={{ fontSize: '20px' }}>📈 KPI Dashboard</h1>
            <p className="page-subtitle">Compute and track key performance indicators across all scopes</p>
          </div>
          <button className="btn-add-new" onClick={() => navigate('/kpis/create')} title="Create New KPI">+</button>
        </div>

        {/* ── Success notification banner ─────────────────────────── */}
        {success && (
          <div className="success-banner">
            ✅ {success}
          </div>
        )}

        {/* ── Stat cards removed ──────────────────────────────────────────── */}

        {/* ── Compute card ────────────────────────────────────────── */}
        <div className="kpi-compute-card">
          <div className="kpi-compute-header">
            <span className="kpi-compute-title">⚡ Compute KPI</span>
          </div>
          <div className="kpi-compute-body">
            <div className="kpi-compute-grid">

              {/* KPI Name */}
              <div className="kpi-form-field">
                <label className="kpi-form-label">KPI Name</label>
                <select
                  className="kpi-select"
                  value={kpiName}
                  onChange={(e) => { setKpiName(e.target.value); setCompError(''); setCompResult(null); setComputedStatus(null); }}
                >
                  {KPI_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {/* Target - show selectable options (backend-managed list) */}
              <div className="kpi-form-field">
                <label className="kpi-form-label">Target (%)</label>
                <select
                  className="kpi-select"
                  value={target}
                  onChange={(e) => { setTarget(Number(e.target.value)); setComputedStatus(null); }}
                  title="Select target (options provided by backend)"
                >
                  {TARGET_OPTIONS.map((t) => <option key={t} value={t}>{t}%</option>)}
                </select>
              </div>

              {/* Reporting Period */}
              <div className="kpi-form-field">
                <label className="kpi-form-label">Reporting Period</label>
                <select
                  className="kpi-select"
                  value={period}
                  onChange={(e) => { setPeriod(e.target.value); setComputedStatus(null); }}
                >
                  {PERIOD_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>

              {/* Action */}
              <div className="kpi-form-field kpi-action-field">
                <label className="kpi-form-label">&nbsp;</label>
                <button
                  className={`btn-compute${computedStatus === 'saved' ? ' btn-compute-done' : ''}`}
                  onClick={computedStatus === 'saved' ? undefined : handleCompute}
                  disabled={computing || computedStatus === 'saved'}
                >
                  {computing ? '⏳ Computing…' : computedStatus === 'saved' ? '✔ Computed' : '▶ Compute'}
                </button>
              </div>

            </div>
          </div>

          {compError && <div className="kpi-error-banner">⚠️ {compError}</div>}

          {/* Result after Compute */}
          {compResult && (
            <div className="kpi-result-preview">
              <div className="kpi-result-title">
                {KPI_ICONS[compResult.name]} {compResult.name} — Compute Result
              </div>
              <div className="kpi-charts-grid">
                <div className="kpi-chart-card">
                  <div className="kpi-chart-title">📊 Current vs Target</div>
                  <KpiBarChart kpiName={compResult.name} currentValue={compResult.currentValue} target={compResult.target} />
                </div>
                <div className="kpi-chart-card">
                  <div className="kpi-chart-title">🥧 Proportional Breakdown</div>
                  <KpiPieChart kpiName={compResult.name} currentValue={compResult.currentValue} target={compResult.target} />
                </div>
                <div className="kpi-chart-card">
                  <div className="kpi-chart-title">📈 Trend Analysis</div>
                  <KpiLineChart kpiName={compResult.name} currentValue={compResult.currentValue} target={compResult.target} />
                </div>
              </div>
              <div className="kpi-result-def-block">
                <div className="kpi-result-label">📋 KPI Definition & Insights</div>
                <div className="kpi-result-definition">{compResult.definition || DEFINITIONS[compResult.name] || 'No definition available.'}</div>
                <div className="kpi-insights-container">
                  <div className="kpi-insight-item">
                    <div className="kpi-insight-icon">{compResult.currentValue >= compResult.target ? '✅' : '⚠️'}</div>
                    <div className="kpi-insight-content">
                      <div className="kpi-insight-label">Current Status</div>
                      <div className="kpi-insight-value">{compResult.currentValue >= compResult.target ? 'On Target' : 'Below Target'}</div>
                    </div>
                  </div>
                  <div className="kpi-insight-item">
                    <div className="kpi-insight-icon">📊</div>
                    <div className="kpi-insight-content">
                      <div className="kpi-insight-label">Performance Gap</div>
                      <div className="kpi-insight-value">{compResult.currentValue != null && compResult.target != null ? `${Math.round((compResult.currentValue / compResult.target) * 100)}%` : '0%'}</div>
                    </div>
                  </div>
                  <div className="kpi-insight-item">
                    <div className="kpi-insight-icon">{compResult.currentValue >= compResult.target * 0.9 ? '🟢' : compResult.currentValue >= compResult.target * 0.75 ? '🟡' : '🔴'}</div>
                    <div className="kpi-insight-content">
                      <div className="kpi-insight-label">Risk Level</div>
                      <div className="kpi-insight-value">{compResult.currentValue >= compResult.target * 0.9 ? 'Low' : compResult.currentValue >= compResult.target * 0.75 ? 'Medium' : 'High'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── KPI Table ────────────────────────────────────────────── */}
        <div className="kpi-table-section">
          <div className="kpi-table-header">
            <h2 className="kpi-section-title">All KPIs</h2>
            <div className="kpi-table-controls">
              <div className="kpi-table-filter-group">
                <label className="kpi-filter-label">Scope:</label>
                <select
                  className="kpi-select kpi-filter-select"
                  value={scopeFilter}
                  onChange={(e) => { setScopeFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="All">All</option>
                  {KPI_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <button className="btn-export" onClick={handleExport}>⬇ Export</button>
            </div>
          </div>

          {listError && <div className="kpi-error-banner">⚠️ {listError}</div>}

          {loading ? (
            <div className="kpi-empty">Loading KPIs…</div>
          ) : kpis.length === 0 ? (
            <div className="kpi-empty">No KPIs yet. Use the Compute panel above to generate one.</div>
          ) : (
            <>
              <div className="kpi-table-wrapper">
                <table className="kpi-table">
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Name</th>
                      <th>Target</th>
                      <th>Current Value</th>
                      <th>Period</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((k) => (
                      <tr key={k.kpiID}>
                        <td className="kpi-id-cell">KPI{String(k.kpiID).padStart(3, '0')}</td>
                        <td>
                          <span className="kpi-name-chip">
                            {KPI_ICONS[k.name]} {k.name}
                          </span>
                        </td>
                        <td className="kpi-num-cell">{k.target != null ? `${k.target}%` : '—'}</td>
                        <td className="kpi-num-cell kpi-current-val">
                          {fmtValue(k.name, k.currentValue)}
                        </td>
                        <td>
                          <span className="kpi-period-chip">{k.reportingPeriod || '—'}</span>
                        </td>
                        <td>
                          <StatusBadge
                            name={k.name}
                            current={k.currentValue}
                            target={k.target}
                          />
                        </td>
                        <td style={{ position: 'relative', textAlign: 'center' }}>
                          <ActionMenuPortal
                            id={k.kpiID}
                            actions={[
                              { label: 'View', onClick: () => handleViewKpi(k) },
                              { label: 'Edit', onClick: () => navigate(`/kpis/edit/${k.kpiID}`) },
                              { label: 'Delete', onClick: () => setDeleteTarget(k.kpiID), danger: true }
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </>
          )}

          {totalPages >= 1 && (
            <div className="kpi-table-footer">
              <div className="kpi-table-footer-inner">
                <div className="kpi-pagination-right">
                  <Pagination1
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    infoText={`Page ${currentPage} of ${totalPages}`}
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── Delete confirm modal ─────────────────────────────────── */}
        {deleteTarget && (
          <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
            <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="delete-confirm-icon">🗑️</div>
              <p className="delete-confirm-text">
                Delete KPI <strong>KPI{String(deleteTarget).padStart(3, '0')}</strong>?
                <br />This action cannot be undone.
              </p>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
