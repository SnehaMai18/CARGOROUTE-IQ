import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from './DashboardShell';
import PermissionGate from '../../auth/PermissionGate';
import { getAllReports } from '../../api/reportApi';
import { getAllKpis } from '../../api/kpiApi';
import { getAllBookings } from '../../api/bookingsApi';

export default function AnalystDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    reports: 0,
    kpis: 0,
    bookings: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setStats((prev) => ({ ...prev, loading: true, error: null }));
        const [reports, kpis, bookings] = await Promise.all([
          getAllReports().catch((e) => { console.error('Error fetching reports:', e); return []; }),
          getAllKpis().catch((e) => { console.error('Error fetching KPIs:', e); return []; }),
          getAllBookings().catch((e) => { console.error('Error fetching bookings:', e); return []; }),
        ]);

        const reportCount = Array.isArray(reports) ? reports.length : 0;
        const kpiCount = Array.isArray(kpis) ? kpis.length : 0;
        const bookingCount = Array.isArray(bookings) ? bookings.length : 0;

        console.log('Analyst dashboard loaded:', { reports: reportCount, kpis: kpiCount, bookings: bookingCount });

        setStats({
          reports: reportCount,
          kpis: kpiCount,
          bookings: bookingCount,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error loading analyst dashboard:', err);
        setStats((prev) => ({ ...prev, loading: false, error: err.message }));
      }
    };

    loadMetrics();
  }, []);

  return (
    <DashboardShell
      title="Analyst Dashboard"
      description="Business intelligence, KPIs, trends, and performance reports"
      actions={
        <PermissionGate action="view" resource="all">
          <button className="dashboard-action-button">Export Report</button>
        </PermissionGate>
      }
    >
      {stats.error && (
        <div style={{ padding: '1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          ⚠️ {stats.error}
        </div>
      )}

      <div className="dashboard-grid">
        <PermissionGate action="view" resource="all">
          <div
            className="dashboard-card"
            onClick={() => navigate('/reports')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/reports')}
            style={{ cursor: 'pointer' }}
            title="View reports"
          >
            <h3>📊 Reports</h3>
            {stats.loading ? <div className="stat-value">–</div> : <div className="stat-value">{stats.reports}</div>}
            <div className="stat-meta">Available for data analysis</div>
          </div>
        </PermissionGate>
        <PermissionGate action="view" resource="all">
          <div
            className="dashboard-card"
            onClick={() => navigate('/reports/kpis')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/reports/kpis')}
            style={{ cursor: 'pointer' }}
            title="View KPIs"
          >
            <h3>📈 KPIs</h3>
            {stats.loading ? <div className="stat-value">–</div> : <div className="stat-value">{stats.kpis}</div>}
            <div className="stat-meta">Key performance indicators tracked</div>
          </div>
        </PermissionGate>
        <PermissionGate action="view" resource="all">
          <div
            className="dashboard-card"
            onClick={() => navigate('/bookings')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/bookings')}
            style={{ cursor: 'pointer' }}
            title="View booking trends"
          >
            <h3>📦 Booking Trends</h3>
            {stats.loading ? <div className="stat-value">–</div> : <div className="stat-value">{stats.bookings}</div>}
            <div className="stat-meta">Historical data for trend analysis</div>
          </div>
        </PermissionGate>
      </div>

      <div className="dashboard-summary">
        <PermissionGate action="view" resource="all">
          <div className="dashboard-summary-card">
            <p>🎯 Analysis Type</p>
            <strong>Business Intelligence</strong>
          </div>
        </PermissionGate>
        <PermissionGate action="view" resource="all">
          <div className="dashboard-summary-card">
            <p>📋 Data Access</p>
            <strong>All Systems Visible</strong>
          </div>
        </PermissionGate>
      </div>
    </DashboardShell>
  );
}
