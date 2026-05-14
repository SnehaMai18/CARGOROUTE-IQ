import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from './DashboardShell';
import { getAllVehicles } from '../../api/fleetApi';
import { getAllRoutes, getAllLoads } from '../../api/routingApi';
import { getAllDispatches } from '../../api/dispatchApi';
import '../../styles/Dashboard.css';

export default function FleetManagerDashboard() {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    availableVehicles: 0,
    totalRoutes: 0,
    activeRoutes: 0,
    totalLoads: 0,
    pendingLoads: 0,
    dispatchedLoads: 0,
    loading: true,
    error: null,
  });

  const [recentVehicles, setRecentVehicles] = useState([]);
  const [recentDispatches, setRecentDispatches] = useState([]);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        const [vehicles, routes, loads, dispatches] = await Promise.all([
          getAllVehicles().catch(err => {
            console.error('Error fetching vehicles:', err);
            return [];
          }),
          getAllRoutes().catch(err => {
            console.error('Error fetching routes:', err);
            return [];
          }),
          getAllLoads().catch(err => {
            console.error('Error fetching loads:', err);
            return [];
          }),
          getAllDispatches().catch(err => {
            console.error('Error fetching dispatches:', err);
            return [];
          }),
        ]);

        const vehicleArray = Array.isArray(vehicles) ? vehicles : [];
        const routeArray = Array.isArray(routes) ? routes : [];
        const loadArray = Array.isArray(loads) ? loads : [];
        const dispatchArray = Array.isArray(dispatches) ? dispatches : [];

        const activeVehiclesCount = vehicleArray.filter(v => v.status === 'ACTIVE').length;
        const availableVehiclesCount = vehicleArray.filter(v => v.status === 'AVAILABLE').length;
        const activeRoutesCount = routeArray.filter(r => r.status === 'ACTIVE').length;
        const pendingLoadsCount = loadArray.filter(l => l.status === 'PLANNED' || l.status === 'UNASSIGNED').length;
        const dispatchedLoadsCount = loadArray.filter(l => l.status === 'DISPATCHED' || l.status === 'IN_PROGRESS').length;

        setStats({
          totalVehicles: vehicleArray.length,
          activeVehicles: activeVehiclesCount,
          availableVehicles: availableVehiclesCount,
          totalRoutes: routeArray.length,
          activeRoutes: activeRoutesCount,
          totalLoads: loadArray.length,
          pendingLoads: pendingLoadsCount,
          dispatchedLoads: dispatchedLoadsCount,
          loading: false,
          error: null,
        });

        setRecentVehicles(vehicleArray.slice(0, 5));
        setRecentDispatches(
          dispatchArray
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
        );
      } catch (err) {
        console.error('Error loading fleet manager dashboard:', err);
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

  const getVehicleStatusClass = status => {
    if (!status) return 'available';
    const statusLower = status.toLowerCase();
    return statusLower.replace(/_/g, '');
  };

  return (
    <DashboardShell
      title="Fleet Manager Dashboard"
      description="Optimize vehicle capacity, route planning, and load distribution"
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
      <div className="fleet-kpi-grid">
        <FleetKpiCard label="Total Vehicles" value={stats.totalVehicles} icon="🚗" />
        
        <FleetKpiCard
          label="Available"
          value={stats.availableVehicles}
          icon="✅"
        />
        <FleetKpiCard label="Active Routes" value={stats.activeRoutes} icon="🗺️" />
        <FleetKpiCard label="Total Loads" value={stats.totalLoads} icon="📦" />
        
      </div>

      {/* Recent Vehicles Section */}
      <div className="fleet-section">
        {stats.loading ? (
          <div className="fleet-loading-container">
            <div className="fleet-loading-spinner"></div>
            <p>Loading fleet data...</p>
          </div>
        ) : recentVehicles.length > 0 ? (
          <>
            <div className="fleet-section-header">
              <h2 className="fleet-section-title">🚗 Fleet Vehicles</h2>
              <button
                className="fleet-view-all-btn"
                onClick={() => navigate('/fleet/vehicles')}
              >
                View All
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="fleet-vehicles-table">
                <thead>
                  <tr>
                    <th>Vehicle ID</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Capacity</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVehicles.map(vehicle => (
                    <tr key={vehicle.vehicleID}>
                      <td className="fleet-vehicle-id">
                        {vehicle.vehicleID || 'N/A'}
                      </td>
                      <td>{vehicle.vehicleType || 'N/A'}</td>
                      <td>
                        <span
                          className={`fleet-status-badge ${getVehicleStatusClass(
                            vehicle.status
                          )}`}
                        >
                          {vehicle.status || 'UNKNOWN'}
                        </span>
                      </td>
                      <td>{vehicle.capacity || 'N/A'} units</td>
                      <td>
                        <button
                          onClick={() =>
                            navigate(`/fleet/vehicles/${vehicle.vehicleID}`)
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
          <div className="fleet-empty-state">
            <div className="fleet-empty-state-icon">🚗</div>
            <h3 className="fleet-empty-state-title">No Vehicles</h3>
            <p className="fleet-empty-state-text">No vehicles in fleet yet.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="fleet-quick-actions">
        <FleetActionCard
          icon="🚙"
          title="Add Vehicle"
          subtitle="Register new vehicle"
          onClick={() => navigate('/fleet/vehicles/new')}
        />

        <FleetActionCard
          icon="🗺️"
          title="Route Planning"
          subtitle="Optimize route assignments"
          onClick={() => navigate('/routing/routes')}
        />

        <FleetActionCard
          icon="📦"
          title="Load Planning"
          subtitle="Manage shipment assignments"
          onClick={() => navigate('/routing/load-planning')}
        />

        <FleetActionCard
          icon="🚚"
          title="Dispatch"
          subtitle="Manage load assignments"
          onClick={() => navigate('/dispatch')}
        />
      </div>
    </DashboardShell>
  );
}

/* ────────────────────────────────────────────── */
/* Reusable Components */
/* ────────────────────────────────────────────── */

function FleetKpiCard({ label, value, icon, isAlert = false }) {
  return (
    <div className={`fleet-kpi-card ${isAlert ? 'alert' : ''}`}>
      <div className="fleet-kpi-icon">{icon}</div>
      <div className="fleet-stat-label">{label}</div>
      <div className="fleet-stat-value">{value}</div>
    </div>
  );
}

function FleetActionCard({ icon, title, subtitle, onClick }) {
  return (
    <div className="fleet-quick-action" onClick={onClick}>
      <div className="fleet-quick-action-icon">{icon}</div>
      <h3 className="fleet-quick-action-title">{title}</h3>
      <p className="fleet-quick-action-subtitle">{subtitle}</p>
    </div>
  );
}
