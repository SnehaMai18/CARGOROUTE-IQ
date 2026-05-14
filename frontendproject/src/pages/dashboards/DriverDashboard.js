import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from './DashboardShell';
import { AuthContext } from '../../auth/AuthContext';
import { getAllLoads } from '../../api/routingApi';
import { getAllPods } from '../../api/manifestApi';
import { STATUS_CONFIG } from '../../utils/constants';
import '../../styles/Dashboard.css';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalLoads: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    pendingPOD: 0,
    loading: true,
    error: null,
  });

  const [loads, setLoads] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));
        
        const driverId = user?.userId || user?.id;
        
        if (!driverId) {
          setStats(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Driver ID not found' 
          }));
          return;
        }

        const [allLoads, allPods] = await Promise.all([
          getAllLoads().catch(err => {
            console.error('Error loading loads:', err);
            return [];
          }),
          getAllPods().catch(err => {
            console.error('Error loading PODs:', err);
            return [];
          }),
        ]);

        const myLoads = Array.isArray(allLoads) 
          ? allLoads.filter(l => l.assignedDriverID === driverId)
          : [];
        const myPods = Array.isArray(allPods) 
          ? allPods.filter(p => p.createdBy === driverId)
          : [];

        const assignedCount = myLoads.filter(l => l.status === 'ASSIGNED').length;
        const inProgressCount = myLoads.filter(l => l.status === 'IN_PROGRESS').length;
        const completedCount = myLoads.filter(
          l => l.status === 'COMPLETED' || l.status === 'DELIVERED'
        ).length;
        const pendingPodCount = myLoads.filter(
          l => (l.status === 'DELIVERED' || l.status === 'COMPLETED')
            && !myPods.some(p => p.loadID === l.loadID)
        ).length;

        setStats({
          totalLoads: myLoads.length,
          assigned: assignedCount,
          inProgress: inProgressCount,
          completed: completedCount,
          pendingPOD: pendingPodCount,
          loading: false,
          error: null,
        });

        const sortedLoads = myLoads
          .sort((a, b) => new Date(b.plannedStart) - new Date(a.plannedStart))
          .slice(0, 5);
        
        setLoads(sortedLoads);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setStats(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message || 'Failed to load dashboard data'
        }));
      }
    };

    if (user?.userId || user?.id) {
      loadData();
    }
  }, [user]);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  // Get status badge styling
  const getStatusClass = (status) => {
    if (!status) return 'pending';
    const statusLower = status.toLowerCase();
    return statusLower.replace(/_/g, '');
  };

  return (
    <DashboardShell
      title="Driver Dashboard"
      description="View assigned loads, track progress, and complete proof of delivery"
    >
      {/* Error Banner */}
      {stats.error && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          color: '#b91c1c'
        }}>
          ⚠️ {stats.error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="driver-kpi-grid">
        <KpiCard 
          label="Total Loads" 
          value={stats.totalLoads} 
          icon="🚚"
        />
       
        <KpiCard 
          label="In Progress" 
          value={stats.inProgress} 
          icon="🛣️"
        />
        <KpiCard 
          label="Completed" 
          value={stats.completed} 
          icon="✅"
        />
        <KpiCard 
          label="Pending POD" 
          value={stats.pendingPOD} 
          icon="📝"
          isAlert={stats.pendingPOD > 0}
        />
      </div>

      {/* Loads Section */}
      <div className="driver-loads-section">
        {stats.loading ? (
          <div className="driver-loading-container">
            <div className="driver-loading-spinner"></div>
            <p>Loading your loads...</p>
          </div>
        ) : loads.length > 0 ? (
          <>
            <div className="driver-section-header">
              <h2 className="driver-section-title">📦 My Assigned Loads</h2>
              <button 
                className="driver-view-all-btn"
                onClick={() => navigate('/driver/loads')}
              >
                View All
              </button>
            </div>

            <table className="driver-loads-table">
              <thead>
                <tr>
                  <th>Load ID</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Planned Start</th>
                </tr>
              </thead>
              <tbody>
                {loads.map(load => (
                  <tr 
                    key={load.loadID} 
                    onClick={() => navigate(`/driver/loads/${load.loadID}`)}
                  >
                    <td className="driver-load-id">
                      LD{String(load.loadID).padStart(3, '0')}
                    </td>
                    <td className="driver-load-route">
                      {load.originSiteID} → {load.destinationSiteID}
                    </td>
                    <td>
                      <span className={`driver-status-badge ${getStatusClass(load.status)}`}>
                        {STATUS_CONFIG[load.status]?.label || load.status}
                      </span>
                    </td>
                    <td className="driver-load-date">
                      {formatDate(load.plannedStart)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="driver-empty-state">
            <div className="driver-empty-state-icon">📦</div>
            <h3 className="driver-empty-state-title">No Assigned Loads</h3>
            <p className="driver-empty-state-text">
              You don't have any loads assigned yet. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="driver-quick-actions">
        

        <QuickActionCard 
          icon="📝" 
          title="Upload POD" 
          subtitle="Complete proof of delivery"
          onClick={() => navigate('/pod/new')}
        />

       

        <QuickActionCard 
          icon="👤" 
          title="Profile" 
          subtitle="View your details"
          onClick={() => navigate('/profile')}
        />
      </div>
    </DashboardShell>
  );
}

/* ────────────────────────────────────────────── */
/* Reusable Components */
/* ────────────────────────────────────────────── */

function KpiCard({ label, value, icon, isAlert = false }) {
  return (
    <div className={`driver-kpi-card ${isAlert ? 'alert' : ''}`}>
      <div className="driver-kpi-icon">{icon}</div>
      <div className="driver-stat-label">{label}</div>
      <div className="driver-stat-value">{value}</div>
    </div>
  );
}

function QuickActionCard({ icon, title, subtitle, onClick }) {
  return (
    <div className="driver-quick-action" onClick={onClick}>
      <div className="driver-quick-action-icon">{icon}</div>
      <h3 className="driver-quick-action-title">{title}</h3>
      <p className="driver-quick-action-subtitle">{subtitle}</p>
    </div>
  );
}