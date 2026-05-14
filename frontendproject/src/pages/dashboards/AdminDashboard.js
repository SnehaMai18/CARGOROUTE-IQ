import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Truck, MapPin, AlertTriangle,
  FileText, User, Settings, CheckCircle, Clock
} from 'lucide-react';
 
import DashboardShell from './DashboardShell';
import RecentAuditLogs from '../../components/RecentAuditLogs';
import { getAllUsersAdmin } from '../../api/authApi';
import { getAllBookings } from '../../api/bookingsApi';
import { getAllLoads } from '../../api/routingApi';
import { getAllReports } from '../../api/reportApi';
import { getAllVehicles } from '../../api/fleetApi';
import { getAllExceptions } from '../../api/exceptionsApi';
 
import '../../styles/Dashboard.css';
 
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    bookings: { total: 0, pending: 0, confirmed: 0 },
    fleet: { total: 5, active: 5, available: 2, inUse: 3 },
    loads: { active: 18 },
    exceptions: { total: 3 },
    loading: true,
    error: null,
  });
 
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setStats((prev) => ({ ...prev, loading: true, error: null }));
        const [users, bookings, loads, reports, vehicles, exceptions] = await Promise.all([
          getAllUsersAdmin().catch(() => []),
          getAllBookings().catch(() => []),
          getAllLoads().catch(() => []),
          getAllReports().catch(() => []),
          getAllVehicles().catch(() => []),
          getAllExceptions().catch(() => []),
        ]);
 
        const bookingsArray = normalizeArray(bookings);
        const loadArray = normalizeArray(loads);
        const reportsArray = normalizeArray(reports);
        const vehiclesArray = normalizeArray(vehicles);
        const exceptionsArray = normalizeArray(exceptions);
 
        const activeLoadStatuses = new Set(['PLANNED', 'IN_TRANSIT', 'IN_PROGRESS', 'ACTIVE', 'DISPATCHED']);
        const activeLoadCount = loadArray.filter((l) => activeLoadStatuses.has((l.status || '').toUpperCase())).length || loadArray.length;

        setStats({
          bookings: {
            total: bookingsArray.length,
            pending: bookingsArray.filter(b => b.status?.toUpperCase() === 'PENDING').length,
            confirmed: bookingsArray.filter(b => b.status?.toUpperCase() === 'CONFIRMED').length,
          },
          fleet: {
            total: vehiclesArray.length,
            active: vehiclesArray.filter(v => v.status?.toUpperCase() === 'AVAILABLE').length,
            available: vehiclesArray.filter(v => v.status?.toUpperCase() === 'AVAILABLE').length,
            inUse: vehiclesArray.filter(v => v.status?.toUpperCase() === 'IN_USE').length,
          },
          loads: { active: activeLoadCount },
          exceptions: { total: exceptionsArray.length },
          loading: false,
          error: null,
        });
      } catch (err) {
        setStats((prev) => ({ ...prev, loading: false, error: err.message }));
      }
    };
    loadMetrics();
  }, []);
 
  const normalizeArray = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.content)) return res.content;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.users)) return res.users;
    return [];
  };
 
  return (
    <DashboardShell title="Admin Dashboard" description="Operational overview and logistics performance metrics">
      <div className="dashboard-container">
       
        <div className="kpi-grid">
          <div className="kpi-card purple-gradient">
            <div className="kpi-card-content">
              <div className="kpi-header">
                <span className="kpi-label">Total Bookings</span>
                <Package className="kpi-icon"/>
              </div>
              <div className="kpi-value">{stats.bookings.total}</div>
              <p className="kpi-subtext">active bookings</p>
            </div>
          </div>
 
          <div className="kpi-card purple-gradient fleets">
            <div className="kpi-card-content">
              <div className="kpi-header">
                <span className="kpi-label">Fleet Status</span>
                <Truck className="kpi-icon"/>
              </div>
              <div className="kpi-value">{stats.fleet.total}</div>
              <p className="kpi-subtext">Active vehicles</p>
            </div>
          </div>
 
          <div className="kpi-card purple-gradient loads">
            <div className="kpi-card-content">
              <div className="kpi-header">
                <span className="kpi-label">Active Loads</span>
                <MapPin className="kpi-icon"/>
              </div>
              <div className="kpi-value">{stats.loads.active}</div>
              <p className="kpi-subtext">In-transit shipments</p>
            </div>
          </div>
 
          <div className="kpi-card purple-gradient exceptions">
            <div className="kpi-card-content">
              <div className="kpi-header">
                <span className="kpi-label">Exceptions</span>
                <AlertTriangle className="kpi-icon"/>
              </div>
              <div className="kpi-value">{stats.exceptions.total}</div>
              <p className="kpi-subtext">Requires attention</p>
            </div>
          </div>
        </div>

 
        <div className="dashboard-middle-grid">
          <div className="main-card audit-logs-card">
            <RecentAuditLogs />
          </div>
 
          <div className="compact-card quick-actions-card">
            <h3 className="card-title-md">⚡ Quick Actions</h3>
            <div className="quick-actions-grid">
              <button className="action-card" onClick={() => navigate('/bookings/new')}>
                <div className="action-icon-wrapper purple"><Package/></div>
                <div className="action-text">
                  <strong>New Booking</strong>
                  <p>Create shipment</p>
                </div>
              </button>
 
              <button className="action-card" onClick={() => navigate('/routing/load/new')}>
                <div className="action-icon-wrapper blue"><MapPin/></div>
                <div className="action-text">
                  <strong>Plan Load</strong>
                  <p>Optimize routes</p>
                </div>
              </button>
 
              <button className="action-card" onClick={() => navigate('/dispatch/new')}>
                <div className="action-icon-wrapper green"><Truck/></div>
                <div className="action-text">
                  <strong>Assign Driver</strong>
                  <p>Dispatch loads</p>
                </div>
              </button>
 
              <button className="action-card" onClick={() => navigate('/reports')}>
                <div className="action-icon-wrapper red"><FileText/></div>
                <div className="action-text">
                  <strong>View Reports</strong>
                  <p>Analytics & KPIs</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
 