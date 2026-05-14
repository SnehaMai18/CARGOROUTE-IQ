import React from 'react';

function parseMetrics(json) {
  try { return JSON.parse(json); } catch { return {}; }
}
function parseParams(json) {
  try { return JSON.parse(json); } catch { return {}; }
}
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

function DonutChart({ percentage, color, label }) {
  const r = 54, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(parseFloat(percentage) || 0, 0), 100);
  const dash = (pct / 100) * circ;
  return (
    <div className="visual-donut-wrap">
      <svg viewBox="0 0 140 140" width="140" height="140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="14"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="18" fontWeight="800" fill="#1e293b">
          {pct.toFixed(1)}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#64748b">
          {label}
        </text>
      </svg>
    </div>
  );
}

function BarRow({ label, value, maxValue, color, unit }) {
  const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  return (
    <div className="visual-bar-row">
      <div className="visual-bar-label">{label}</div>
      <div className="visual-bar-track">
        <div className="visual-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="visual-bar-value">{(value || 0).toLocaleString()}{unit}</div>
    </div>
  );
}

function OnTimeVisual({ m }) {
  const pct = parseFloat(m.onTimePercentage) || 0;
  const missed = (m.totalBookings || 0) - (m.onTimeBookings || 0);
  const color = pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626';
  return (
    <>
      <div className="visual-section-title">Delivery Performance</div>
      <div className="visual-row">
        <DonutChart percentage={pct} color={color} label="On-Time" />
        <div className="visual-stats-col">
          <div className="visual-stat-item" style={{ borderLeftColor: '#1d4ed8' }}>
            <div className="visual-stat-label">Total Bookings</div>
            <div className="visual-stat-num">{m.totalBookings ?? '-'}</div>
          </div>
          <div className="visual-stat-item" style={{ borderLeftColor: '#16a34a' }}>
            <div className="visual-stat-label">On-Time Delivered</div>
            <div className="visual-stat-num" style={{ color: '#16a34a' }}>{m.onTimeBookings ?? '-'}</div>
          </div>
          <div className="visual-stat-item" style={{ borderLeftColor: '#dc2626' }}>
            <div className="visual-stat-label">Late / Not Matched</div>
            <div className="visual-stat-num" style={{ color: '#dc2626' }}>{missed >= 0 ? missed : '-'}</div>
          </div>
        </div>
      </div>
      <div className="visual-section-title" style={{ marginTop: 16 }}>Booking Breakdown</div>
      <div className="visual-bars">
        <BarRow label="On-Time" value={m.onTimeBookings || 0} maxValue={m.totalBookings || 1} color="#16a34a" unit="" />
        <BarRow label="Late"    value={missed >= 0 ? missed : 0} maxValue={m.totalBookings || 1} color="#dc2626" unit="" />
      </div>
    </>
  );
}

function UtilizationVisual({ m }) {
  const pct = parseFloat(m.fleetUtilizationPercentage) || 0;
  const free = (m.totalFleetCapacityKg || 0) - (m.usedCapacityKg || 0);
  const color = pct >= 80 ? '#dc2626' : pct >= 50 ? '#d97706' : '#16a34a';
  return (
    <>
      <div className="visual-section-title">Fleet Capacity Utilization</div>
      <div className="visual-row">
        <DonutChart percentage={pct} color={color} label="Utilized" />
        <div className="visual-stats-col">
          <div className="visual-stat-item" style={{ borderLeftColor: '#1d4ed8' }}>
            <div className="visual-stat-label">Total Fleet Capacity</div>
            <div className="visual-stat-num">{(m.totalFleetCapacityKg || 0).toLocaleString()} kg</div>
          </div>
          <div className="visual-stat-item" style={{ borderLeftColor: '#d97706' }}>
            <div className="visual-stat-label">Used Capacity</div>
            <div className="visual-stat-num" style={{ color: '#d97706' }}>{(m.usedCapacityKg || 0).toLocaleString()} kg</div>
          </div>
          <div className="visual-stat-item" style={{ borderLeftColor: '#16a34a' }}>
            <div className="visual-stat-label">Free Capacity</div>
            <div className="visual-stat-num" style={{ color: '#16a34a' }}>{(free > 0 ? free : 0).toLocaleString()} kg</div>
          </div>
        </div>
      </div>
      <div className="visual-section-title" style={{ marginTop: 16 }}>Capacity Breakdown (kg)</div>
      <div className="visual-bars">
        <BarRow label="Used"  value={m.usedCapacityKg || 0}      maxValue={m.totalFleetCapacityKg || 1} color="#d97706" unit=" kg" />
        <BarRow label="Free"  value={free > 0 ? free : 0}        maxValue={m.totalFleetCapacityKg || 1} color="#16a34a" unit=" kg" />
        <BarRow label="Total" value={m.totalFleetCapacityKg || 0} maxValue={m.totalFleetCapacityKg || 1} color="#1d4ed8" unit=" kg" />
      </div>
    </>
  );
}

function RevenueVisual({ m }) {
  const totalRevenue    = m.totalRevenue    || 0;
  const totalDistanceKm = m.totalDistanceKm || 0;
  const revenuePerKm    = m.revenuePerKm    || 0;

  return (
    <>
      <div className="visual-section-title">Revenue Overview</div>
      <div className="visual-stats-col" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <div className="visual-stat-item" style={{ borderLeftColor: '#7c3aed', flex: 1, minWidth: 140 }}>
          <div className="visual-stat-label">Total Revenue</div>
          <div className="visual-stat-num" style={{ color: '#7c3aed', fontSize: 18 }}>
            {'\u20B9'}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="visual-stat-item" style={{ borderLeftColor: '#0891b2', flex: 1, minWidth: 140 }}>
          <div className="visual-stat-label">Total Distance</div>
          <div className="visual-stat-num" style={{ color: '#0891b2', fontSize: 18 }}>
            {totalDistanceKm.toLocaleString()} km
          </div>
        </div>
        <div className="visual-stat-item" style={{ borderLeftColor: '#d97706', flex: 1, minWidth: 140 }}>
          <div className="visual-stat-label">Revenue / km</div>
          <div className="visual-stat-num" style={{ color: '#d97706', fontSize: 18 }}>
            {'\u20B9'}{revenuePerKm.toFixed(2)}
          </div>
        </div>
      </div>
      <div className="visual-section-title" style={{ marginTop: 16 }}>Revenue Breakdown</div>
      <div className="visual-bars">
        <BarRow label="Revenue" value={totalRevenue}    maxValue={totalRevenue || 1}    color="#7c3aed" unit="" />
        <BarRow label="Dist km" value={totalDistanceKm} maxValue={totalDistanceKm || 1} color="#0891b2" unit=" km" />
      </div>
      <div className="visual-params-row" style={{ marginTop: 12 }}>
        <span className="visual-param-badge" style={{ background: '#faf5ff', borderColor: '#d8b4fe', color: '#7c3aed' }}>
          Revenue per km = Total Revenue / Total Distance
        </span>
      </div>
    </>
  );
}

function ExceptionsVisual({ m }) {
  const totalBookings   = m.totalBookings   || 0;
  const totalExceptions = m.totalExceptions || 0;
  const exceptionRate   = parseFloat(m.exceptionRate) || 0;
  const color = exceptionRate <= 5 ? '#16a34a' : exceptionRate <= 15 ? '#d97706' : '#dc2626';
  return (
    <>
      <div className="visual-section-title">Exception Overview</div>
      <div className="visual-row">
        <DonutChart percentage={exceptionRate} color={color} label="Exception Rate" />
        <div className="visual-stats-col">
          <div className="visual-stat-item" style={{ borderLeftColor: '#1d4ed8' }}>
            <div className="visual-stat-label">Total Bookings</div>
            <div className="visual-stat-num">{totalBookings}</div>
          </div>
          <div className="visual-stat-item" style={{ borderLeftColor: '#dc2626' }}>
            <div className="visual-stat-label">⚠️ Total Exceptions</div>
            <div className="visual-stat-num" style={{ color: '#dc2626' }}>{totalExceptions}</div>
          </div>
          <div className="visual-stat-item" style={{ borderLeftColor: color }}>
            <div className="visual-stat-label">Exception Rate</div>
            <div className="visual-stat-num" style={{ color }}>{exceptionRate.toFixed(2)}%</div>
          </div>
        </div>
      </div>
      <div className="visual-section-title" style={{ marginTop: 16 }}>Breakdown</div>
      <div className="visual-bars">
        <BarRow label="Exceptions" value={totalExceptions} maxValue={totalBookings || 1} color="#dc2626" unit="" />
        <BarRow label="Clean"      value={Math.max(totalBookings - totalExceptions, 0)} maxValue={totalBookings || 1} color="#16a34a" unit="" />
      </div>
      <div className="visual-params-row" style={{ marginTop: 12 }}>
        <span className="visual-param-badge" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}>
          Exception Rate = (Total Exceptions / Total Bookings) × 100
        </span>
      </div>
    </>
  );
}

export default function ReportVisualModal({ report, onClose, onDelete }) {
  if (!report) return null;
  const m = parseMetrics(report.metricsJSON);
  const p = parseParams(report.parametersJSON);

  const scopeIcon = report.scope === 'UTILIZATION' ? 'Fleet' : report.scope === 'REVENUE' ? 'Revenue' : report.scope === 'EXCEPTIONS' ? 'Exception' : 'Delivery';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="report-visual-modal" onClick={(e) => e.stopPropagation()}>

        <div className="report-modal-header">
          <span>{scopeIcon} Report - RPT{String(report.reportID).padStart(3, '0')}</span>
          <button className="modal-close" onClick={onClose}>X</button>
        </div>

        <div className="visual-body">
          <div className="visual-detail-grid">
            <div className="visual-detail-item">
              <span className="visual-detail-label">Report ID</span>
              <span className="visual-detail-value">RPT{String(report.reportID).padStart(3, '0')}</span>
            </div>
            <div className="visual-detail-item">
              <span className="visual-detail-label">Scope</span>
              <span className={scopeBadgeClass(report.scope)}>{report.scope}</span>
            </div>
            <div className="visual-detail-item">
              <span className="visual-detail-label">Date From</span>
              <span className="visual-detail-value">{p.dateFrom || '-'}</span>
            </div>
            <div className="visual-detail-item">
              <span className="visual-detail-label">Date To</span>
              <span className="visual-detail-value">{p.dateTo || '-'}</span>
            </div>
            <div className="visual-detail-item">
              <span className="visual-detail-label">Generated By</span>
              <span className="visual-detail-value">{report.generatedBy || '-'}</span>
            </div>
            <div className="visual-detail-item">
              <span className="visual-detail-label">Generated At</span>
              <span className="visual-detail-value">{fmtDate(report.generatedAt)}</span>
            </div>
          </div>

          <div className="visual-divider" />

          {report.scope === 'ONTIME'      && <OnTimeVisual m={m} />}
          {report.scope === 'UTILIZATION' && <UtilizationVisual m={m} />}
          {report.scope === 'REVENUE'     && <RevenueVisual m={m} />}
          {report.scope === 'EXCEPTIONS'  && <ExceptionsVisual m={m} />}
          {!['ONTIME','UTILIZATION','REVENUE','EXCEPTIONS'].includes(report.scope) && (
            <div className="report-empty">No visual available for scope: {report.scope}</div>
          )}
        </div>

        <div className="report-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-danger" onClick={() => { onDelete(report.reportID); onClose(); }}>Delete</button>
        </div>
      </div>
    </div>
  );
}
