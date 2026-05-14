import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import KpiBarChart from '../../components/KpiBarChart';
import KpiPieChart from '../../components/KpiPieChart';
import KpiLineChart from '../../components/KpiLineChart';
import '../../styles/Kpi.css';

const KPI_ICONS = {
  Utilization: '🚛',
  OnTime:      '⏱️',
  Revenue:     '💰',
  Exceptions:  '⚠️',
};

const DEFINITIONS = {
  Utilization: 'Vehicle capacity usage efficiency during the reporting period.',
  OnTime:      'Percentage of deliveries completed on schedule.',
  Exceptions:  'Number of operational issues recorded during the reporting period.',
  Revenue:     'Total freight revenue generated during the reporting period.',
};

function fmtValue(name, val) {
  if (val == null) return '—';
  return `${val}%`;
}

export default function KpiDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const kpi = location.state?.kpi;

  if (!kpi) {
    return (
      <Layout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>No KPI data found.</h2>
          <button className="btn-compute" onClick={() => navigate('/kpis')} style={{ marginTop: 16 }}>
            ← Back to KPI Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const met = kpi.name === 'Exceptions'
    ? kpi.currentValue <= kpi.target
    : kpi.currentValue >= kpi.target;

  const performancePct = kpi.currentValue != null && kpi.target != null
    ? `${Math.round((kpi.currentValue / kpi.target) * 100)}%`
    : '0%';

  const riskLevel = kpi.currentValue >= kpi.target * 0.9
    ? 'Low'
    : kpi.currentValue >= kpi.target * 0.75
      ? 'Medium'
      : 'High';

  const riskIcon = kpi.currentValue >= kpi.target * 0.9
    ? '🟢'
    : kpi.currentValue >= kpi.target * 0.75
      ? '🟡'
      : '🔴';

  return (
    <Layout>
      <div className="kpi-page">

        {/* ── Header ── */}
        <div className="page-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
          <button
            className="btn-export"
            onClick={() => navigate('/kpis')}
            style={{ flexShrink: 0 }}
          >
            ←
          </button>
          <div style={{ textAlign: 'left' }}>
            <h1 className="page-title">
              {KPI_ICONS[kpi.name]} {kpi.name} — KPI Report
            </h1>
            <p className="page-subtitle">
              Period: <strong>{kpi.reportingPeriod || '—'}</strong>
              &nbsp;·&nbsp; Target: <strong>{kpi.target != null ? `${kpi.target}%` : '—'}</strong>
              &nbsp;·&nbsp; Current: <strong>{fmtValue(kpi.name, kpi.currentValue)}</strong>
              &nbsp;·&nbsp; ID: <strong>KPI{String(kpi.kpiID).padStart(3, '0')}</strong>
            </p>
          </div>
        </div>

        {/* ── Charts ── */}
        <div className="kpi-compute-card" style={{ marginTop: 16 }}>
          <div className="kpi-compute-header">
            <span className="kpi-compute-title">📊 Charts</span>
          </div>
          <div className="kpi-charts-grid" style={{ padding: '24px 32px' }}>
            <div className="kpi-chart-card">
              <div className="kpi-chart-title">📊 Current vs Target</div>
              <KpiBarChart kpiName={kpi.name} currentValue={kpi.currentValue} target={kpi.target} />
            </div>
            <div className="kpi-chart-card">
              <div className="kpi-chart-title">🥧 Proportional Breakdown</div>
              <KpiPieChart kpiName={kpi.name} currentValue={kpi.currentValue} target={kpi.target} />
            </div>
            <div className="kpi-chart-card">
              <div className="kpi-chart-title">📈 Trend Analysis</div>
              <KpiLineChart kpiName={kpi.name} currentValue={kpi.currentValue} target={kpi.target} />
            </div>
          </div>
        </div>

        {/* ── Definition & Insights ── */}
        <div className="kpi-result-def-block" style={{ margin: '16px 0' }}>
          <div className="kpi-result-label">📋 KPI Definition &amp; Insights</div>
          <div className="kpi-result-definition">
            {kpi.definition || DEFINITIONS[kpi.name] || 'No definition available.'}
          </div>
          <div className="kpi-insights-container">
            <div className="kpi-insight-item">
              <div className="kpi-insight-icon">{met ? '✅' : '⚠️'}</div>
              <div className="kpi-insight-content">
                <div className="kpi-insight-label">Current Status</div>
                <div className="kpi-insight-value">{met ? 'On Target' : 'Below Target'}</div>
              </div>
            </div>
            <div className="kpi-insight-item">
              <div className="kpi-insight-icon">📊</div>
              <div className="kpi-insight-content">
                <div className="kpi-insight-label">Performance Gap</div>
                <div className="kpi-insight-value">{performancePct}</div>
              </div>
            </div>
            <div className="kpi-insight-item">
              <div className="kpi-insight-icon">{riskIcon}</div>
              <div className="kpi-insight-content">
                <div className="kpi-insight-label">Risk Level</div>
                <div className="kpi-insight-value">{riskLevel}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
