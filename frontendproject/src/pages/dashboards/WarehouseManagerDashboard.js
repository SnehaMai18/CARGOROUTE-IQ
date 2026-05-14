import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from './DashboardShell';
import { getAllManifests, getAllHandovers, getAllPods } from '../../api/manifestApi';
import { getAllExceptions } from '../../api/exceptionsApi';
import '../../styles/Dashboard.css';

export default function WarehouseManagerDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalManifests: 0,
    pendingManifests: 0,
    processedManifests: 0,
    totalHandovers: 0,
    completedHandovers: 0,
    totalPods: 0,
    pendingPods: 0,
    openExceptions: 0,
    loading: true,
    error: null,
  });

  const [recentManifests, setRecentManifests] = useState([]);
  const [recentExceptions, setRecentExceptions] = useState([]);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        const [manifests, handovers, pods, exceptions] = await Promise.all([
          getAllManifests().catch(err => {
            console.error('Error fetching manifests:', err);
            return [];
          }),
          getAllHandovers().catch(err => {
            console.error('Error fetching handovers:', err);
            return [];
          }),
          getAllPods().catch(err => {
            console.error('Error fetching pods:', err);
            return [];
          }),
          getAllExceptions().catch(err => {
            console.error('Error fetching exceptions:', err);
            return [];
          }),
        ]);

        const manifestArray = Array.isArray(manifests) ? manifests : [];
        const handoverArray = Array.isArray(handovers) ? handovers : [];
        const podArray = Array.isArray(pods) ? pods : [];
        const exceptionArray = Array.isArray(exceptions) ? exceptions : [];

        const pendingManifestsCount = manifestArray.filter(
          m => m.status === 'PENDING' || m.status === 'IN_PROCESS'
        ).length;
        const processedManifestsCount = manifestArray.filter(
          m => m.status === 'COMPLETED'
        ).length;
        const completedHandoversCount = handoverArray.filter(
          h => h.status === 'COMPLETED'
        ).length;
        const pendingPodsCount = podArray.filter(p => p.status === 'PENDING').length;
        const openExceptionsCount = exceptionArray.filter(
          e => e.status !== 'RESOLVED'
        ).length;

        setStats({
          totalManifests: manifestArray.length,
          pendingManifests: pendingManifestsCount,
          processedManifests: processedManifestsCount,
          totalHandovers: handoverArray.length,
          completedHandovers: completedHandoversCount,
          totalPods: podArray.length,
          pendingPods: pendingPodsCount,
          openExceptions: openExceptionsCount,
          loading: false,
          error: null,
        });

        setRecentManifests(
          manifestArray
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
        );
        setRecentExceptions(
          exceptionArray
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
        );
      } catch (err) {
        console.error('Error loading warehouse manager dashboard:', err);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Failed to load dashboard data',
        }));
      }
    };

    loadMetrics();
  }, []);

  const formatDate = dateString => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const getManifestStatusClass = status => {
    if (!status) return 'pending';
    const statusLower = status.toLowerCase();
    return statusLower.replace(/_/g, '');
  };

  const getExceptionStatusClass = status => {
    if (!status) return 'open';
    const statusLower = status.toLowerCase();
    return statusLower.replace(/_/g, '');
  };

  return (
    <DashboardShell
      title="Warehouse Manager Dashboard"
      description="Manage manifests, handovers, proof of delivery, and warehouse exceptions"
    >
      {/* Error Banner */}
      {stats.error && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            color: '#b91c1c',
          }}
        >
          ⚠️ {stats.error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="warehouse-kpi-grid">
        <WarehouseKpiCard label="Total Manifests" value={stats.totalManifests} icon="📄" />
        
        <WarehouseKpiCard
          label="Handovers"
          value={stats.totalHandovers}
          icon="🔄"
        />
        <WarehouseKpiCard
          label="PODs"
          value={stats.totalPods}
          icon="📋"
        />
       
      </div>

      {/* Recent Manifests Section */}
      <div className="warehouse-section">
        {stats.loading ? (
          <div className="warehouse-loading-container">
            <div className="warehouse-loading-spinner"></div>
            <p>Loading warehouse data...</p>
          </div>
        ) : recentManifests.length > 0 ? (
          <>
            <div className="warehouse-section-header">
              <h2 className="warehouse-section-title">📄 Recent Manifests</h2>
              <button
                className="warehouse-view-all-btn"
                onClick={() => navigate('/manifests')}
              >
                View All
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="warehouse-manifests-table">
                <thead>
                  <tr>
                    <th>Manifest ID</th>
                    <th>Status</th>
                    <th>Items</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentManifests.map(manifest => (
                    <tr key={manifest.manifestID}>
                      <td className="warehouse-manifest-id">
                        MF{String(manifest.manifestID).padStart(3, '0')}
                      </td>
                      <td>
                        <span
                          className={`warehouse-status-badge ${getManifestStatusClass(
                            manifest.status
                          )}`}
                        >
                          {manifest.status || 'UNKNOWN'}
                        </span>
                      </td>
                      <td>{manifest.itemCount || 0}</td>
                      <td>{formatDate(manifest.createdAt)}</td>
                      <td>
                        <button
                          onClick={() =>
                            navigate(`/manifests/${manifest.manifestID}`)
                          }
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#6d28d9',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.75rem',
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="warehouse-empty-state">
            <div className="warehouse-empty-state-icon">📄</div>
            <h3 className="warehouse-empty-state-title">No Manifests</h3>
            <p className="warehouse-empty-state-text">No manifests in system yet.</p>
          </div>
        )}
      </div>

      {/* Recent Exceptions Section */}
      {recentExceptions.length > 0 && (
        <div className="warehouse-section">
          <div className="warehouse-section-header">
            <h2 className="warehouse-section-title">⚠️ Open Issues</h2>
            <button
              className="warehouse-view-all-btn"
              onClick={() => navigate('/exceptions')}
            >
              View All
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="warehouse-exceptions-table">
              <thead>
                <tr>
                  <th>Exception ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentExceptions.slice(0, 5).map(exception => (
                  <tr key={exception.exceptionID}>
                    <td className="warehouse-exception-id">
                      EX{String(exception.exceptionID).padStart(3, '0')}
                    </td>
                    <td>{exception.exceptionType || 'N/A'}</td>
                    <td>
                      <span
                        className={`warehouse-status-badge ${getExceptionStatusClass(
                          exception.status
                        )}`}
                      >
                        {exception.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td>{formatDate(exception.createdAt)}</td>
                    <td>
                      <button
                        onClick={() =>
                          navigate(`/exceptions/${exception.exceptionID}`)
                        }
                        style={{
                          padding: '0.4rem 0.8rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '0.75rem',
                        }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="warehouse-quick-actions">
        <WarehouseActionCard
          icon="📄"
          title="Create Manifest"
          subtitle="Register new shipment"
          onClick={() => navigate('/manifests/new')}
        />

        <WarehouseActionCard
          icon="🔄"
          title="Handovers"
          subtitle="Manage handover records"
          onClick={() => navigate('/handovers')}
        />

        <WarehouseActionCard
          icon="📋"
          title="Proof of Delivery"
          subtitle="Review POD documents"
          onClick={() => navigate('/manifests/pods')}
        />

        <WarehouseActionCard
          icon="⚠️"
          title="Exceptions"
          subtitle="Handle warehouse issues"
          onClick={() => navigate('/exceptions')}
        />
      </div>
    </DashboardShell>
  );
}

/* ────────────────────────────────────────────── */
/* Reusable Components */
/* ────────────────────────────────────────────── */

function WarehouseKpiCard({ label, value, icon, isAlert = false }) {
  return (
    <div className={`warehouse-kpi-card ${isAlert ? 'alert' : ''}`}>
      <div className="warehouse-kpi-icon">{icon}</div>
      <div className="warehouse-stat-label">{label}</div>
      <div className="warehouse-stat-value">{value}</div>
    </div>
  );
}

function WarehouseActionCard({ icon, title, subtitle, onClick }) {
  return (
    <div className="warehouse-quick-action" onClick={onClick}>
      <div className="warehouse-quick-action-icon">{icon}</div>
      <h3 className="warehouse-quick-action-title">{title}</h3>
      <p className="warehouse-quick-action-subtitle">{subtitle}</p>
    </div>
  );
}
