import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from './DashboardShell';
import PermissionGate from '../../auth/PermissionGate';
import { getAllInvoices, getAllBillingLines, getAllTariffs } from '../../api/billingApi';
import '../../styles/Dashboard.css';

export default function BillingClerkDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    invoices: 0,
    billingLines: 0,
    tariffs: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setStats((prev) => ({ ...prev, loading: true, error: null }));
        const [invoices, billingLines, tariffs] = await Promise.all([
          getAllInvoices().catch((e) => { console.error('Error fetching invoices:', e); return []; }),
          getAllBillingLines().catch((e) => { console.error('Error fetching billing lines:', e); return []; }),
          getAllTariffs().catch((e) => { console.error('Error fetching tariffs:', e); return []; }),
        ]);

        const invoiceCount = Array.isArray(invoices) ? invoices.length : 0;
        const billingLineCount = Array.isArray(billingLines) ? billingLines.length : 0;
        const tariffCount = Array.isArray(tariffs) ? tariffs.length : 0;

        console.log('Billing clerk dashboard loaded:', { invoices: invoiceCount, billingLines: billingLineCount, tariffs: tariffCount });

        setStats({
          invoices: invoiceCount,
          billingLines: billingLineCount,
          tariffs: tariffCount,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error loading billing clerk dashboard:', err);
        setStats((prev) => ({ ...prev, loading: false, error: err.message }));
      }
    };

    loadMetrics();
  }, []);

  return (
    <DashboardShell
      title="Billing Clerk Dashboard"
      description="Review invoices, manage billing lines, and oversee tariff rates"
    >
      <div className="dashboard-container">
        {stats.error && (
          <div style={{ padding: '1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            ⚠️ {stats.error}
          </div>
        )}

        <div className="kpi-grid">
          <div 
            className="kpi-card purple-gradient"
            onClick={() => navigate('/billing/invoices')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/billing/invoices')}
            style={{ cursor: 'pointer' }}
            title="View invoices"
          >
            <div className="kpi-card-content">
              <div className="kpi-header">
                <span className="kpi-label">Invoices</span>
                <span className="kpi-icon">💳</span>
              </div>
              <div className="kpi-value">{stats.loading ? '–' : stats.invoices}</div>
              <p className="kpi-subtext">Pending review and reconciliation</p>
            </div>
          </div>

          <div 
            className="kpi-card purple-gradient"
            onClick={() => navigate('/billing/billing-lines')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/billing/billing-lines')}
            style={{ cursor: 'pointer' }}
            title="View billing lines"
          >
            <div className="kpi-card-content">
              <div className="kpi-header">
                <span className="kpi-label">Billing Lines</span>
                <span className="kpi-icon">📊</span>
              </div>
              <div className="kpi-value">{stats.loading ? '–' : stats.billingLines}</div>
              <p className="kpi-subtext">Line items for invoice generation</p>
            </div>
          </div>

          <div 
            className="kpi-card purple-gradient"
            onClick={() => navigate('/billing/tariffs')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/billing/tariffs')}
            style={{ cursor: 'pointer' }}
            title="View tariffs"
          >
            <div className="kpi-card-content">
              <div className="kpi-header">
                <span className="kpi-label">Tariffs</span>
                <span className="kpi-icon">💰</span>
              </div>
              <div className="kpi-value">{stats.loading ? '–' : stats.tariffs}</div>
              <p className="kpi-subtext">Active rate schedules</p>
            </div>
          </div>
        </div>

        <div className="billing-summary" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <PermissionGate action="view" resource="billing">
            <div className="billing-summary-card" style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>📈 Financial Control</p>
              <strong style={{ fontSize: '1.125rem', color: '#1e293b' }}>Invoice Processing</strong>
            </div>
          </PermissionGate>
          <PermissionGate action="view" resource="billing">
            <div className="billing-summary-card" style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>🔒 Access Level</p>
              <strong style={{ fontSize: '1.125rem', color: '#1e293b' }}>Financial Records Only</strong>
            </div>
          </PermissionGate>
        </div>
      </div>
    </DashboardShell>
  );
}
