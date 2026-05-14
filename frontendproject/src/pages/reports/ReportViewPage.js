import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getReportById, deleteReport } from '../../api/reportApi';
import '../../styles/Reports.css';
import '../../styles/ReportView.css';

/* ── helpers ── */
function parseJSON(str) { try { return JSON.parse(str); } catch { return {}; } }
function fmtDate(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
function scopeBadgeClass(scope) {
  if (scope === 'UTILIZATION') return 'scope-badge scope-badge-utilization';
  if (scope === 'REVENUE')     return 'scope-badge scope-badge-revenue';
  if (scope === 'EXCEPTIONS')  return 'scope-badge scope-badge-exceptions';
  return 'scope-badge scope-badge-ontime';
}

/* ── SVG Donut ── */
function DonutChart({ percentage, color, label }) {
  const r = 70, cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(Math.max(parseFloat(percentage) || 0, 0), 100);
  const dash = (pct / 100) * circ;
  return (
    <div className="rv-donut-wrap">
      <svg viewBox="0 0 180 180" width="180" height="180">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="18" />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="18"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="22" fontWeight="800" fill="#1e293b">
          {pct.toFixed(1)}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="12" fill="#64748b">{label}</text>
      </svg>
    </div>
  );
}

/* ── Horizontal Bar ── */
function BarRow({ label, value, maxValue, color, unit }) {
  const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  return (
    <div className="rv-bar-row">
      <div className="rv-bar-label">{label}</div>
      <div className="rv-bar-track">
        <div className="rv-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="rv-bar-value">{(value || 0).toLocaleString()}{unit}</div>
    </div>
  );
}

/* ── ONTIME section ── */
function OnTimeSection({ m }) {
  const pct    = parseFloat(m.onTimePercentage) || 0;
  const missed = (m.totalBookings || 0) - (m.onTimeBookings || 0);
  const color  = pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className="rv-visual-card">
      <h3 className="rv-visual-title">📦 Delivery Performance</h3>
      <div className="rv-visual-body">
        <DonutChart percentage={pct} color={color} label="On-Time Rate" />
        <div className="rv-stats-col">
          <div className="rv-stat-item" style={{ borderLeftColor: '#1d4ed8' }}>
            <div className="rv-stat-label">Total Bookings</div>
            <div className="rv-stat-num">{m.totalBookings ?? '-'}</div>
          </div>
          <div className="rv-stat-item" style={{ borderLeftColor: '#16a34a' }}>
            <div className="rv-stat-label">✅ On-Time Delivered</div>
            <div className="rv-stat-num" style={{ color: '#16a34a' }}>{m.onTimeBookings ?? '-'}</div>
          </div>
          <div className="rv-stat-item" style={{ borderLeftColor: '#dc2626' }}>
            <div className="rv-stat-label">❌ Late / Missed</div>
            <div className="rv-stat-num" style={{ color: '#dc2626' }}>{missed >= 0 ? missed : '-'}</div>
          </div>
        </div>
      </div>
      <h4 className="rv-bar-title">Booking Breakdown</h4>
      <div className="rv-bars">
        <BarRow label="On-Time" value={m.onTimeBookings || 0}           maxValue={m.totalBookings || 1} color="#16a34a" unit="" />
        <BarRow label="Late"    value={missed >= 0 ? missed : 0}        maxValue={m.totalBookings || 1} color="#dc2626" unit="" />
      </div>
    </div>
  );
}

/* ── UTILIZATION section ── */
function UtilizationSection({ m }) {
  const pct   = parseFloat(m.fleetUtilizationPercentage) || 0;
  const free  = (m.totalFleetCapacityKg || 0) - (m.usedCapacityKg || 0);
  const color = pct >= 80 ? '#dc2626' : pct >= 50 ? '#d97706' : '#16a34a';
  return (
    <div className="rv-visual-card">
      <h3 className="rv-visual-title">🚛 Fleet Capacity Utilization</h3>
      <div className="rv-visual-body">
        <DonutChart percentage={pct} color={color} label="Utilized" />
        <div className="rv-stats-col">
          <div className="rv-stat-item" style={{ borderLeftColor: '#1d4ed8' }}>
            <div className="rv-stat-label">Total Fleet Capacity</div>
            <div className="rv-stat-num">{(m.totalFleetCapacityKg || 0).toLocaleString()} kg</div>
          </div>
          <div className="rv-stat-item" style={{ borderLeftColor: '#d97706' }}>
            <div className="rv-stat-label">⚡ Used Capacity</div>
            <div className="rv-stat-num" style={{ color: '#d97706' }}>{(m.usedCapacityKg || 0).toLocaleString()} kg</div>
          </div>
          <div className="rv-stat-item" style={{ borderLeftColor: '#16a34a' }}>
            <div className="rv-stat-label">✅ Free Capacity</div>
            <div className="rv-stat-num" style={{ color: '#16a34a' }}>{(free > 0 ? free : 0).toLocaleString()} kg</div>
          </div>
        </div>
      </div>
      <h4 className="rv-bar-title">Capacity Breakdown (kg)</h4>
      <div className="rv-bars">
        <BarRow label="Used"  value={m.usedCapacityKg || 0}      maxValue={m.totalFleetCapacityKg || 1} color="#d97706" unit=" kg" />
        <BarRow label="Free"  value={free > 0 ? free : 0}        maxValue={m.totalFleetCapacityKg || 1} color="#16a34a" unit=" kg" />
        <BarRow label="Total" value={m.totalFleetCapacityKg || 0} maxValue={m.totalFleetCapacityKg || 1} color="#1d4ed8" unit=" kg" />
      </div>
    </div>
  );
}

/* ── REVENUE section ── */
function RevenueSection({ m }) {
  const totalRevenue    = m.totalRevenue    || 0;
  const totalDistanceKm = m.totalDistanceKm || 0;
  const revenuePerKm    = m.revenuePerKm    || 0;
  return (
    <div className="rv-visual-card">
      <h3 className="rv-visual-title">💰 Revenue Overview</h3>
      <div className="rv-revenue-grid">
        <div className="rv-revenue-metric" style={{ borderTopColor: '#7c3aed' }}>
          <div className="rv-revenue-label">Total Revenue</div>
          <div className="rv-revenue-num" style={{ color: '#7c3aed' }}>
            ₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="rv-revenue-metric" style={{ borderTopColor: '#0891b2' }}>
          <div className="rv-revenue-label">Total Distance</div>
          <div className="rv-revenue-num" style={{ color: '#0891b2' }}>
            {totalDistanceKm.toLocaleString()} km
          </div>
        </div>
        <div className="rv-revenue-metric" style={{ borderTopColor: '#d97706' }}>
          <div className="rv-revenue-label">Revenue / km</div>
          <div className="rv-revenue-num" style={{ color: '#d97706' }}>
            ₹{revenuePerKm.toFixed(2)}
          </div>
        </div>
      </div>
      <h4 className="rv-bar-title">Revenue Breakdown</h4>
      <div className="rv-bars">
        <BarRow label="Revenue" value={totalRevenue}    maxValue={totalRevenue || 1}    color="#7c3aed" unit="" />
        <BarRow label="Dist km" value={totalDistanceKm} maxValue={totalDistanceKm || 1} color="#0891b2" unit=" km" />
      </div>
      <div style={{ marginTop: 14 }}>
        <span className="visual-param-badge" style={{ background: '#faf5ff', borderColor: '#d8b4fe', color: '#7c3aed' }}>
          Revenue per km = Total Revenue ÷ Total Distance
        </span>
      </div>
    </div>
  );
}

/* ── EXCEPTIONS section ── */
function ExceptionsSection({ m }) {
  const totalBookings   = m.totalBookings   || 0;
  const totalExceptions = m.totalExceptions || 0;
  const exceptionRate   = parseFloat(m.exceptionRate) || 0;
  const color = exceptionRate <= 5 ? '#16a34a' : exceptionRate <= 15 ? '#d97706' : '#dc2626';
  return (
    <div className="rv-visual-card">
      <h3 className="rv-visual-title">⚠️ Exception Overview</h3>
      <div className="rv-visual-body">
        <DonutChart percentage={exceptionRate} color={color} label="Exception Rate" />
        <div className="rv-stats-col">
          <div className="rv-stat-item" style={{ borderLeftColor: '#1d4ed8' }}>
            <div className="rv-stat-label">Total Bookings</div>
            <div className="rv-stat-num">{totalBookings}</div>
          </div>
          <div className="rv-stat-item" style={{ borderLeftColor: '#dc2626' }}>
            <div className="rv-stat-label">⚠️ Total Exceptions</div>
            <div className="rv-stat-num" style={{ color: '#dc2626' }}>{totalExceptions}</div>
          </div>
          <div className="rv-stat-item" style={{ borderLeftColor: color }}>
            <div className="rv-stat-label">Exception Rate</div>
            <div className="rv-stat-num" style={{ color }}>{exceptionRate.toFixed(2)}%</div>
          </div>
        </div>
      </div>
      <h4 className="rv-bar-title">Booking Breakdown</h4>
      <div className="rv-bars">
        <BarRow label="Exceptions" value={totalExceptions} maxValue={totalBookings || 1} color="#dc2626" unit="" />
        <BarRow label="Clean"      value={Math.max(totalBookings - totalExceptions, 0)} maxValue={totalBookings || 1} color="#16a34a" unit="" />
      </div>
      <div style={{ marginTop: 14 }}>
        <span className="visual-param-badge" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}>
          Exception Rate = (Total Exceptions ÷ Total Bookings) × 100
        </span>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function ReportViewPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [report,   setReport]  = useState(null);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getReportById(id)
      .then(setReport)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteReport(report.reportID);
      navigate('/reports');
    } catch (e) {
      setError(e.message);
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Layout><div className="rv-page"><div className="rv-loading">Loading report…</div></div></Layout>;
  if (error)   return <Layout><div className="rv-page"><div className="report-error-banner">⚠️ {error}</div></div></Layout>;
  if (!report) return null;

  const m = parseJSON(report.metricsJSON);
  const p = parseJSON(report.parametersJSON);

  return (
    <Layout>
      <div className="rv-page">

        {/* Back button */}
        <button className="rv-back-btn" onClick={() => navigate('/reports')} title="Back">
          ←
        </button>

        {/* Page header */}
        <div className="rv-page-header">
          <div>
            <div className="rv-report-id">RPT{String(report.reportID).padStart(3, '0')}</div>
            <div className="rv-report-scope">
              <span className={scopeBadgeClass(report.scope)}>{report.scope}</span>
            </div>
          </div>
          <div className="rv-header-meta">
            <span>👤 {report.generatedBy}</span>
            <span>🕐 {fmtDate(report.generatedAt)}</span>
          </div>
        </div>

        {/* Two-column layout: details left, chart right */}
        <div className="rv-layout">

          {/* Left — Details card */}
          <div className="rv-details-card">
            <h3 className="rv-details-title">📋 Report Details</h3>
            <div className="rv-details-list">
              <div className="rv-detail-row">
                <span className="rv-detail-label">Report ID</span>
                <span className="rv-detail-value">RPT{String(report.reportID).padStart(3, '0')}</span>
              </div>
              <div className="rv-detail-row">
                <span className="rv-detail-label">Scope</span>
                <span className={scopeBadgeClass(report.scope)}>{report.scope}</span>
              </div>
              <div className="rv-detail-row">
                <span className="rv-detail-label">Date From</span>
                <span className="rv-detail-value">{p.dateFrom || '-'}</span>
              </div>
              <div className="rv-detail-row">
                <span className="rv-detail-label">Date To</span>
                <span className="rv-detail-value">{p.dateTo || '-'}</span>
              </div>
              <div className="rv-detail-row">
                <span className="rv-detail-label">Generated By</span>
                <span className="rv-detail-value">{report.generatedBy || '-'}</span>
              </div>
              <div className="rv-detail-row">
                <span className="rv-detail-label">Generated At</span>
                <span className="rv-detail-value">{fmtDate(report.generatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Right — Visualization card */}
          {report.scope === 'ONTIME'      && <OnTimeSection m={m} />}
          {report.scope === 'UTILIZATION' && <UtilizationSection m={m} />}
          {report.scope === 'REVENUE'     && <RevenueSection m={m} />}
          {report.scope === 'EXCEPTIONS'  && <ExceptionsSection m={m} />}
          {!['ONTIME','UTILIZATION','REVENUE','EXCEPTIONS'].includes(report.scope) && (
            <div className="rv-visual-card rv-no-visual">No visualization available for scope: {report.scope}</div>
          )}
        </div>

      </div>
    </Layout>
  );
}
