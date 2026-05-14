import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext';
import DashboardShell from './DashboardShell';
import { Package, Truck, MapPin, AlertCircle, FileText, BarChart3, DollarSign, Clipboard, Plus } from 'lucide-react';
import { getAllBookings } from '../../api/bookingsApi';
import { getAllVehicles } from '../../api/fleetApi';
import { getAllExceptions, getAllClaims } from '../../api/exceptionsApi';
import { getAllDispatches } from '../../api/dispatchApi';
import { getAllLoads, getAllRoutes } from '../../api/routingApi';
import { getAllReports } from '../../api/reportApi';
import { getAllKpis } from '../../api/kpiApi';
import { getAllBillingLines, getAllTariffs } from '../../api/billingApi';
import { getAllManifests, getAllHandovers } from '../../api/manifestApi';
import { getAllTasks } from '../../api/taskApi';
import '../../styles/Dashboard.css';

export default function SimpleDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const userName = user?.name || user?.email || 'User';
  const userRole = (user?.role || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const userId = user?.userId || user?.id || user?.userID;

  const [data, setData] = useState({
    // Shipper/Dispatcher data
    bookings: { total: 0, pending: 0, confirmed: 0, inTransit: 0, delivered: 0 },
    fleet: { total: 0, available: 0, inUse: 0, maintenance: 0 },
    exceptions: { total: 0 },
    claims: { total: 0 },
    dispatches: { total: 0, pending: 0 },
    loads: { total: 0, pending: 0 },
    tasks: [],
    // Analyst data
    reports: { total: 0 },
    kpis: { total: 0 },
    // Billing Clerk data
    billingLines: { total: 0 },
    tariffs: { total: 0 },
    // Warehouse Manager data
    manifests: { total: 0 },
    handovers: { total: 0 },

    // Fleet Manager data
    routes: { total: 0 },
    // Driver data
    driverTasks: { total: 0, pending: 0 },
    // Status
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }));

        // Normalize response to array
        const normalizeArray = (res) => {
          if (Array.isArray(res)) return res;
          if (Array.isArray(res?.data)) return res.data;
          if (Array.isArray(res?.content)) return res.content;
          return [];
        };

        // Prepare requests based on role
        let requests = [];
        let requestTypes = []; // Track what each request is for

        switch (userRole) {
          case 'analyst':
            // Analyst: Reports and KPIs + Global Bookings
            requestTypes = ['reports', 'kpis', 'bookings'];
            requests = [
              getAllReports().catch(() => []),
              getAllKpis().catch(() => []),
              getAllBookings().catch(() => []),
            ];
            break;

          case 'billingclerk':
            // Billing Clerk: Billing Lines and Tariffs + Global Bookings
            requestTypes = ['billingLines', 'tariffs', 'bookings'];
            requests = [
              getAllBillingLines().catch(() => []),
              getAllTariffs().catch(() => []),
              getAllBookings().catch(() => []),
            ];
            break;

          case 'fleetmanager':
            // Fleet Manager: Vehicles, Loads, Routes + Global Bookings
            requestTypes = ['fleet', 'loads', 'routes', 'bookings'];
            requests = [
              getAllVehicles().catch(() => []),
              getAllLoads().catch(() => []),
              getAllRoutes().catch(() => []),
              getAllBookings().catch(() => []),
            ];
            break;

          case 'warehousemanager':
            // Warehouse Manager: Manifests, Handovers, Dispatches, Loads + Global Bookings
            requestTypes = ['manifests', 'handovers', 'dispatches', 'loads', 'bookings'];
            requests = [
              getAllManifests().catch(() => []),
              getAllHandovers().catch(() => []),
              getAllDispatches().catch(() => []),
              getAllLoads().catch(() => []),
              getAllBookings().catch(() => []),
            ];
            break;

          case 'driver':
            // Driver: Tasks (only personal tasks) + Global Bookings
            requestTypes = ['driverTasks', 'bookings'];
            requests = [
              getAllTasks().catch(() => []),
              getAllBookings().catch(() => []),
            ];
            break;

          case 'shipper':
            // Shipper: Bookings, Exceptions, Claims + Global Bookings
            requestTypes = ['bookings', 'fleet', 'exceptions', 'claims'];
            requests = [
              getAllBookings().catch(() => []),
              getAllVehicles().catch(() => []),
              getAllExceptions().catch(() => []),
              getAllClaims().catch(() => []),
            ];
            break;

          case 'dispatcher':
            // Dispatcher: Dispatches, Fleet, Loads + Global Bookings
            requestTypes = ['dispatches', 'fleet', 'loads', 'bookings'];
            requests = [
              getAllDispatches().catch(() => []),
              getAllVehicles().catch(() => []),
              getAllLoads().catch(() => []),
              getAllBookings().catch(() => []),
            ];
            break;

          default:
            // Default: Basic bookings and fleet
            requestTypes = ['bookings', 'fleet'];
            requests = [
              getAllBookings().catch(() => []),
              getAllVehicles().catch(() => []),
            ];
        }

        const results = await Promise.all(requests);

        // Process results based on role
        let newData = {
          bookings: { total: 0, pending: 0, confirmed: 0, inTransit: 0, delivered: 0 },
          fleet: { total: 0, available: 0, inUse: 0, maintenance: 0 },
          exceptions: { total: 0 },
          claims: { total: 0 },
          dispatches: { total: 0, pending: 0 },
          loads: { total: 0, pending: 0 },
          reports: { total: 0 },
          kpis: { total: 0 },
          billingLines: { total: 0 },
          tariffs: { total: 0 },
          manifests: { total: 0 },
          handovers: { total: 0 },
          driverTasks: { total: 0, pending: 0 },
          tasks: [],
          loading: false,
          error: null,
        };

        // Process each result
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const type = requestTypes[i];
          const dataArray = normalizeArray(result);

          switch (type) {
            case 'bookings':
              newData.bookings = {
                total: dataArray.length,
                pending: dataArray.filter(b => b.status?.toUpperCase() === 'PENDING').length,
                confirmed: dataArray.filter(b => b.status?.toUpperCase() === 'CONFIRMED').length,
                inTransit: dataArray.filter(b => b.status?.toUpperCase() === 'IN_TRANSIT' || b.status?.toUpperCase() === 'DISPATCHED').length,
                delivered: dataArray.filter(b => b.status?.toUpperCase() === 'DELIVERED').length,
              };
              break;

            case 'fleet':
              newData.fleet = {
                total: dataArray.length,
                available: dataArray.filter(v => v.status?.toUpperCase() === 'AVAILABLE').length,
                inUse: dataArray.filter(v => v.status?.toUpperCase() === 'IN_USE').length,
                maintenance: dataArray.filter(v => v.status?.toUpperCase() === 'MAINTENANCE').length,
              };
              break;

            case 'exceptions':
              newData.exceptions = { total: dataArray.length };
              break;

            case 'claims':
              newData.claims = { total: dataArray.length };
              break;

            case 'dispatches':
              newData.dispatches = {
                total: dataArray.length,
                pending: dataArray.filter(d => d.status?.toUpperCase() === 'PENDING').length,
              };
              break;

            case 'loads':
              newData.loads = {
                total: dataArray.length,
                pending: dataArray.filter(l => l.status?.toUpperCase() === 'PENDING').length,
              };
              break;

            case 'routes':
              // Route count (for Fleet Manager)
              newData.routes = { total: dataArray.length };
              break;

            case 'reports':
              newData.reports = { total: dataArray.length };
              break;

            case 'kpis':
              newData.kpis = { total: dataArray.length };
              break;

            case 'billingLines':
              newData.billingLines = { total: dataArray.length };
              break;

            case 'tariffs':
              newData.tariffs = { total: dataArray.length };
              break;

            case 'manifests':
              newData.manifests = { total: dataArray.length };
              break;

            case 'handovers':
              newData.handovers = { total: dataArray.length };
              break;

            case 'driverTasks':
              // Filter tasks for this driver only
              const driverTasksArray = dataArray.filter(t => t.assignedTo === userId);
              newData.driverTasks = {
                total: driverTasksArray.length,
                pending: driverTasksArray.filter(t => t.status?.toUpperCase() === 'PENDING').length,
              };
              newData.tasks = driverTasksArray;
              break;

            default:
              break;
          }
        }

        setData(newData);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setData((prev) => ({ ...prev, loading: false, error: err.message }));
      }
    };

    loadDashboardData();
  }, [userId, userRole]);

  // Helper function to log actions to audit
  const logAuditAction = async (action, entityType, entityId = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await fetch('http://localhost:8081/cargoRoute/auditLogs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userID: userId,
          action: action,
          entityType: entityType,
          entityID: entityId,
          timestamp: new Date().toISOString(),
          details: `User ${userName} performed ${action} on ${entityType}${entityId ? ` #${entityId}` : ''}`,
        }),
      });
    } catch (err) {
      console.warn('Failed to log audit action:', err);
    }
  };

  // Render driver dashboard (no action cards, just welcome message)
  if (userRole === 'driver') {
    return (
      <DashboardShell title={`Welcome, ${userName}!`} description="Your CargoRoute IQ Dashboard">
        
      </DashboardShell>
    );
  }

  // Render Analyst Dashboard
  if (userRole === 'analyst') {
    return (
      <DashboardShell title={`Welcome, ${userName}!`} description="Analytics & Reporting Dashboard">
        <div className="dashboard-container">
          {/* KPI Grid */}
          <div className="kpi-grid">
            <div className="kpi-card purple-gradient">
              <div className="kpi-card-content">
                <div className="kpi-header">
                  <span className="kpi-label">Total Reports</span>
                  <FileText className="kpi-icon" />
                </div>
                <div className="kpi-value">{data.reports.total}</div>
                <p className="kpi-subtext">Generated reports</p>
              </div>
            </div>

            <div className="kpi-card purple-gradient fleets">
              <div className="kpi-card-content">
                <div className="kpi-header">
                  <span className="kpi-label">Total KPIs</span>
                  <BarChart3 className="kpi-icon" />
                </div>
                <div className="kpi-value">{data.kpis.total}</div>
                <p className="kpi-subtext">Performance metrics</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-middle-grid">
            <div className="compact-card quick-actions-card">
              <h3 className="card-title-md">⚡ Quick Actions</h3>
              <div className="quick-actions-grid">
                <button className="action-card" onClick={() => { navigate('/reports/create'); logAuditAction('CREATE', 'Report'); }}>
                  <div className="action-icon-wrapper purple"><Plus/></div>
                  <div className="action-text">
                    <strong>Create Report</strong>
                    <p>Generate new report</p>
                  </div>
                </button>

                <button className="action-card" onClick={() => navigate('/reports')}>
                  <div className="action-icon-wrapper blue"><FileText/></div>
                  <div className="action-text">
                    <strong>View Reports</strong>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ backgroundColor: '#3b82f6', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{data.reports.total}</span>
                      {data.reports.total} reports
                    </p>
                  </div>
                </button>

                <button className="action-card" onClick={() => { navigate('/kpis'); logAuditAction('CREATE', 'KPI'); }}>
                  <div className="action-icon-wrapper purple"><BarChart3/></div>
                  <div className="action-text">
                    <strong>Create KPI</strong>
                    <p>Define new metric</p>
                  </div>
                </button>

                <button className="action-card" onClick={() => navigate('/kpis')}>
                  <div className="action-icon-wrapper green"><BarChart3/></div>
                  <div className="action-text">
                    <strong>View KPIs</strong>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ backgroundColor: '#10b981', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{data.kpis.total}</span>
                      {data.kpis.total} metrics
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Render Billing Clerk Dashboard
  if (userRole === 'billingclerk') {
    return (
      <DashboardShell title={`Welcome, ${userName}!`} description="Billing & Tariff Management">
        <div className="dashboard-container">
          {/* KPI Grid */}
          <div className="kpi-grid">
            <div className="kpi-card purple-gradient">
              <div className="kpi-card-content">
                <div className="kpi-header">
                  <span className="kpi-label">Billing Lines</span>
                  <Clipboard className="kpi-icon" />
                </div>
                <div className="kpi-value">{data.billingLines.total}</div>
                <p className="kpi-subtext">Line items</p>
              </div>
            </div>

            <div className="kpi-card purple-gradient fleets">
              <div className="kpi-card-content">
                <div className="kpi-header">
                  <span className="kpi-label">Tariffs</span>
                  <DollarSign className="kpi-icon" />
                </div>
                <div className="kpi-value">{data.tariffs.total}</div>
                <p className="kpi-subtext">Active rates</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-middle-grid">
            <div className="compact-card quick-actions-card">
              <h3 className="card-title-md">⚡ Quick Actions</h3>
              <div className="quick-actions-grid">
                <button className="action-card" onClick={() => { navigate('/billing/billing-lines/create'); logAuditAction('CREATE', 'BillingLine'); }}>
                  <div className="action-icon-wrapper purple"><Plus/></div>
                  <div className="action-text">
                    <strong>Create Billing Line</strong>
                    <p>Add new line item</p>
                  </div>
                </button>

                <button className="action-card" onClick={() => navigate('/billing/billing-lines')}>
                  <div className="action-icon-wrapper blue"><Clipboard/></div>
                  <div className="action-text">
                    <strong>View Billing Lines</strong>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ backgroundColor: '#3b82f6', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{data.billingLines.total}</span>
                      {data.billingLines.total} lines
                    </p>
                  </div>
                </button>

                <button className="action-card" onClick={() => navigate('/billing/tariffs')}>
                  <div className="action-icon-wrapper orange"><DollarSign/></div>
                  <div className="action-text">
                    <strong>View Tariffs</strong>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ backgroundColor: '#f59e0b', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{data.tariffs.total}</span>
                      {data.tariffs.total} tariffs
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Render Fleet Manager Dashboard
  if (userRole === 'fleetmanager') {
    return (
      <DashboardShell title={`Welcome, ${userName}!`} description="Fleet Management Dashboard">
        <div className="dashboard-container">
         

          {/* KPI Grid */}
          <div className="kpi-grid">
            <div className="kpi-card purple-gradient">
              <div className="kpi-card-content">
                <div className="kpi-header">
                  <span className="kpi-label">Total Fleets</span>
                  <Truck className="kpi-icon" />
                </div>
                <div className="kpi-value">{data.fleet.total}</div>
                <p className="kpi-subtext">Vehicles in fleet</p>
              </div>
            </div>

            <div className="kpi-card purple-gradient fleets">
              <div className="kpi-card-content">
                <div className="kpi-header">
                  <span className="kpi-label">Total Loads</span>
                  <Truck className="kpi-icon" />
                </div>
                <div className="kpi-value">{data.loads.total}</div>
                <p className="kpi-subtext">Loads in system</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-middle-grid">
            <div className="compact-card quick-actions-card">
              <h3 className="card-title-md">⚡ Quick Actions</h3>
              <div className="quick-actions-grid">
                <button className="action-card" onClick={() => navigate('/fleet/vehicles')}>
                  <div className="action-icon-wrapper blue"><Truck/></div>
                  <div className="action-text">
                    <strong>View Fleet</strong>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ backgroundColor: '#3b82f6', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{data.fleet.total}</span>
                      {data.fleet.total} vehicles
                    </p>
                  </div>
                </button>

                <button className="action-card" onClick={() => { navigate('/fleet/vehicles/new'); logAuditAction('CREATE', 'Vehicle'); }}>
                  <div className="action-icon-wrapper purple"><Plus/></div>
                  <div className="action-text">
                    <strong>Add Vehicle</strong>
                    <p>Register new vehicle</p>
                  </div>
                </button>



                <button className="action-card" onClick={() => navigate('/routing/routes')}>
                  <div className="action-icon-wrapper orange"><MapPin/></div>
                  <div className="action-text">
                    <strong>View Routes</strong>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ backgroundColor: '#f59e0b', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{data.routes?.total || 0}</span>
                      {data.routes?.total || 0} active routes
                    </p>
                  </div>
                </button>

                <button className="action-card" onClick={() => { navigate('/routing/load/new'); logAuditAction('CREATE', 'Load'); }}>
                  <div className="action-icon-wrapper red"><Plus/></div>
                  <div className="action-text">
                    <strong>Create Load</strong>
                    <p>New shipment load</p>
                  </div>
                </button>

               
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Render Warehouse Manager Dashboard
  if (userRole === 'warehousemanager') {
    return (
      <DashboardShell title={`Welcome, ${userName}!`} description="Warehouse Management Dashboard">
        <div className="dashboard-container">
          

          {/* KPI Grid */}
          <div className="kpi-grid">
            <div className="kpi-card purple-gradient">
              <div className="kpi-card-content">
                <div className="kpi-header">
                  <span className="kpi-label">Manifests</span>
                  <Clipboard className="kpi-icon" />
                </div>
                <div className="kpi-value">{data.manifests.total}</div>
                <p className="kpi-subtext">Shipping documents</p>
              </div>
            </div>

            <div className="kpi-card purple-gradient fleets">
              <div className="kpi-card-content">
                <div className="kpi-header">
                  <span className="kpi-label">Handovers</span>
                  <Package className="kpi-icon" />
                </div>
                <div className="kpi-value">{data.handovers.total}</div>
                <p className="kpi-subtext">Transfer records</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-middle-grid">
            <div className="compact-card quick-actions-card">
              <h3 className="card-title-md">⚡ Quick Actions</h3>
              <div className="quick-actions-grid">
                <button className="action-card" onClick={() => { navigate('/manifests/new'); logAuditAction('CREATE', 'Manifest'); }}>
                  <div className="action-icon-wrapper purple"><Plus/></div>
                  <div className="action-text">
                    <strong>Create Manifest</strong>
                    <p>New shipping document</p>
                  </div>
                </button>

                <button className="action-card" onClick={() => navigate('/handovers')}>
                  <div className="action-icon-wrapper blue"><Plus/></div>
                  <div className="action-text">
                    <strong>View Handovers</strong>
                    <p>Manage transfers</p>
                  </div>
                </button>

                <button className="action-card" onClick={() => navigate('/dispatch')}>
                  <div className="action-icon-wrapper green"><Truck/></div>
                  <div className="action-text">
                    <strong>See Dispatches</strong>
                    <p>View shipments</p>
                  </div>
                </button>

                <button className="action-card" onClick={() => navigate('/routing/loads')}>
                  <div className="action-icon-wrapper orange"><MapPin/></div>
                  <div className="action-text">
                    <strong>See Loads</strong>
                    <p>Pending loads</p>
                  </div>
                </button>

                <button className="action-card" onClick={() => navigate('/exceptions')}>
                  <div className="action-icon-wrapper red"><AlertCircle/></div>
                  <div className="action-text">
                    <strong>View Exceptions</strong>
                    <p>Manage issues</p>
                  </div>
                </button>

                <button className="action-card" onClick={() => navigate('/pod')}>
                  <div className="action-icon-wrapper purple"><FileText/></div>
                  <div className="action-text">
                    <strong>View POD</strong>
                    <p>Proof of delivery</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Default render for Shipper/Dispatcher/Others
  return (
    <DashboardShell title={`Welcome, ${userName}!`} description="Your CargoRoute IQ Dashboard">
      <div className="dashboard-container">
        {/* KPI Grid - Only Total Bookings & Total Fleet */}
        <div className="kpi-grid">
          <div className="kpi-card purple-gradient">
            <div className="kpi-card-content">
              <div className="kpi-header">
                <span className="kpi-label">Total Bookings</span>
                <Package className="kpi-icon" />
              </div>
              <div className="kpi-value">{data.bookings.total}</div>
              <p className="kpi-subtext">All bookings</p>
            </div>
          </div>

          <div className="kpi-card purple-gradient fleets">
            <div className="kpi-card-content">
              <div className="kpi-header">
                <span className="kpi-label">{userRole === 'shipper' ? 'Total Exceptions' : 'Total Fleet'}</span>
                {userRole === 'shipper' ? <AlertCircle className="kpi-icon" /> : <Truck className="kpi-icon" />}
              </div>
              <div className="kpi-value">{userRole === 'shipper' ? data.exceptions.total : data.fleet.total}</div>
              <p className="kpi-subtext">{userRole === 'shipper' ? 'Reported exceptions' : 'Vehicles'}</p>
            </div>
          </div>
        </div>

        {/* Middle Grid - Role-Based Quick Actions */}
        <div className="dashboard-middle-grid">
          <div className="compact-card quick-actions-card">
            <h3 className="card-title-md">⚡ Quick Actions</h3>
            <div className="quick-actions-grid">
              {userRole === 'shipper' ? (
                <>
                  {/* Shipper Actions */}
                  <button className="action-card" onClick={() => { navigate('/bookings/new'); logAuditAction('CREATE', 'Booking'); }}>
                    <div className="action-icon-wrapper purple"><Package/></div>
                    <div className="action-text">
                      <strong>New Booking</strong>
                      <p>Create shipment</p>
                    </div>
                  </button>

                  <button className="action-card" onClick={() => { navigate('/exceptions/new'); logAuditAction('CREATE', 'Exception'); }}>
                    <div className="action-icon-wrapper red"><AlertCircle/></div>
                    <div className="action-text">
                      <strong>New Exception</strong>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {data.exceptions.total > 0 && <span style={{ backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>{data.exceptions.total}</span>}
                        Report issues
                      </p>
                    </div>
                  </button>

                  <button className="action-card" onClick={() => { navigate('/claims/new'); logAuditAction('CREATE', 'Claim'); }}>
                    <div className="action-icon-wrapper orange"><FileText/></div>
                    <div className="action-text">
                      <strong>New Claim</strong>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {data.claims.total > 0 && <span style={{ backgroundColor: '#f59e0b', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>{data.claims.total}</span>}
                        File damages
                      </p>
                    </div>
                  </button>

                  <button className="action-card" onClick={() => navigate('/claims')}>
                    <div className="action-icon-wrapper blue"><FileText/></div>
                    <div className="action-text">
                      <strong>View Claims</strong>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {data.claims.total > 0 && <span style={{ backgroundColor: '#3b82f6', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>{data.claims.total}</span>}
                        All claims
                      </p>
                    </div>
                  </button>
                </>
              ) : userRole === 'dispatcher' ? (
                <>
                  {/* Dispatcher Actions */}
                  <button className="action-card" onClick={() => { navigate('/routing/load-planning'); logAuditAction('CREATE', 'Dispatch'); }}>
                    <div className="action-icon-wrapper green"><Truck/></div>
                    <div className="action-text">
                      <strong>Load Planning</strong>
                      <p>Optimize routes</p>
                    </div>
                  </button>

                  <button className="action-card" onClick={() => navigate('/fleet/vehicles')}>
                    <div className="action-icon-wrapper blue"><Truck/></div>
                    <div className="action-text">
                      <strong>View Fleet</strong>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ backgroundColor: '#3b82f6', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{data.fleet.available}</span>
                        {data.fleet.available} available
                      </p>
                    </div>
                  </button>

                  <button className="action-card" onClick={() => navigate('/routing/load-planning')}>
                    <div className="action-icon-wrapper purple"><MapPin/></div>
                    <div className="action-text">
                      <strong>View Loads</strong>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ backgroundColor: '#d8caf3', color: '#1c0735', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{data.loads.pending}</span>
                        {data.loads.pending} pending
                      </p>
                    </div>
                  </button>

                  <button className="action-card" onClick={() => navigate('/routing/routes')}>
                    <div className="action-icon-wrapper orange"><MapPin/></div>
                    <div className="action-text">
                      <strong>View Routes</strong>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ backgroundColor: '#f59e0b', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{data.routes?.total || 0}</span>
                        {data.routes?.total || 0} active routes
                      </p>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  {/* Default Actions for other roles */}
                  <button className="action-card" onClick={() => navigate('/bookings')}>
                    <div className="action-icon-wrapper purple"><Package/></div>
                    <div className="action-text">
                      <strong>View Bookings</strong>
                      <p>Check orders</p>
                    </div>
                  </button>

                  <button className="action-card" onClick={() => navigate('/fleet/vehicles')}>
                    <div className="action-icon-wrapper blue"><Truck/></div>
                    <div className="action-text">
                      <strong>View Fleet</strong>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ backgroundColor: '#3b82f6', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{data.fleet.available}</span>
                        {data.fleet.available} vehicles
                      </p>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}