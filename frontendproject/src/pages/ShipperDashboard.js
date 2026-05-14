import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext';
import DashboardShell from './DashboardShell';
import PermissionGate from '../../auth/PermissionGate';
import { getBookingsByShipper } from '../../api/bookingsApi';
import { getAllExceptions, getAllClaims } from '../../api/exceptionsApi';
import { getAllPods } from '../../api/manifestApi';
import { STATUS_CONFIG } from '../../utils/constants';

export default function ShipperDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    inTransitBookings: 0,
    deliveredBookings: 0,
    exceptions: 0,
    claims: 0,
    pods: 0,
    loading: true,
    error: null,
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const shipperId = user?.userId || user?.id || user?.userID;
    if (!shipperId) {
      setStats((prev) => ({ ...prev, loading: false }));
      return;
    }

    const loadMetrics = async () => {
      try {
        setStats((prev) => ({ ...prev, loading: true, error: null }));
        const [bookings, exceptions, claims, pods] = await Promise.all([
          getBookingsByShipper(shipperId).catch((e) => { console.error('Error fetching bookings:', e); return []; }),
          getAllExceptions().catch((e) => { console.error('Error fetching exceptions:', e); return []; }),
          getAllClaims().catch((e) => { console.error('Error fetching claims:', e); return []; }),
          getAllPods().catch((e) => { console.error('Error fetching pods:', e); return []; }),
        ]);

        const bookingArray = Array.isArray(bookings) ? bookings : [];
        const pendingCount = bookingArray.filter((b) => b.status === 'PENDING' || b.status === 'SUBMITTED').length;
        const inTransitCount = bookingArray.filter((b) => b.status === 'IN_TRANSIT' || b.status === 'DISPATCHED').length;
        const deliveredCount = bookingArray.filter((b) => b.status === 'DELIVERED').length;

        const exceptionCount = Array.isArray(exceptions)
          ? exceptions.filter((item) => item.shipperID == shipperId || item.createdBy == shipperId).length
          : 0;
        const claimCount = Array.isArray(claims)
          ? claims.filter((item) => item.shipperID == shipperId || item.createdBy == shipperId).length
          : 0;
        const podCount = Array.isArray(pods) ? pods.length : 0;

        // Get 5 most recent bookings
        const recent = bookingArray
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentBookings(recent);

        console.log('Shipper dashboard loaded:', { total: bookingArray.length, pending: pendingCount, inTransit: inTransitCount, delivered: deliveredCount });

        setStats({
          totalBookings: bookingArray.length,
          pendingBookings: pendingCount,
          inTransitBookings: inTransitCount,
          deliveredBookings: deliveredCount,
          exceptions: exceptionCount,
          claims: claimCount,
          pods: podCount,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error loading shipper dashboard:', err);
        setStats((prev) => ({ ...prev, loading: false, error: err.message }));
      }
    };

    loadMetrics();
  }, [user]);

  return (
    <DashboardShell
      title="Shipper Dashboard"
      description="Track your shipments, manage bookings, and stay updated on deliveries"
      actions={
        <>
          <PermissionGate action="create" resource="bookings">
            <button 
              className="dashboard-action-button"
              onClick={() => navigate('/bookings/new')}
              style={{ background: '#6d28d9', color: 'white', padding: '10px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
              + Create Booking
            </button>
          </PermissionGate>
        </>
      }
    >
      {stats.error && (
        <div className="shipper-dashboard-error">
          ⚠️ {stats.error}
        </div>
      )}

      {/* KPI Cards Section */}
      <div className="shipper-kpi-grid">
        <PermissionGate action="view" resource="own-bookings">
          <div className="shipper-kpi-card">
            <div className="shipper-kpi-label">Total Bookings</div>
            <div className="shipper-kpi-value">
              {stats.loading ? '–' : stats.totalBookings}
            </div>
            <div className="shipper-kpi-subtitle">All your shipments</div>
          </div>
        </PermissionGate>

        <PermissionGate action="view" resource="own-bookings">
          <div className="shipper-kpi-card pending">
            <div className="shipper-kpi-label">Pending</div>
            <div className="shipper-kpi-value pending">
              {stats.loading ? '–' : stats.pendingBookings}
            </div>
            <div className="shipper-kpi-subtitle">Awaiting pickup</div>
          </div>
        </PermissionGate>

        <PermissionGate action="view" resource="own-bookings">
          <div className="shipper-kpi-card in-transit">
            <div className="shipper-kpi-label">In Transit</div>
            <div className="shipper-kpi-value in-transit">
              {stats.loading ? '–' : stats.inTransitBookings}
            </div>
            <div className="shipper-kpi-subtitle">Currently shipping</div>
          </div>
        </PermissionGate>

        <PermissionGate action="view" resource="own-bookings">
          <div className="shipper-kpi-card delivered">
            <div className="shipper-kpi-label">Delivered</div>
            <div className="shipper-kpi-value delivered">
              {stats.loading ? '–' : stats.deliveredBookings}
            </div>
            <div className="shipper-kpi-subtitle">Completed shipments</div>
          </div>
        </PermissionGate>
      </div>

      <div className="shipper-kpi-grid">
        <PermissionGate action="view" resource="exceptions">
          <div className="shipper-kpi-card exception">
            <div className="shipper-kpi-label">Exceptions</div>
            <div className="shipper-kpi-value exception">
              {stats.loading ? '–' : stats.exceptions}
            </div>
            <div className="shipper-kpi-subtitle">Issues reported</div>
          </div>
        </PermissionGate>

        <PermissionGate action="view" resource="exceptions">
          <div className="shipper-kpi-card claim">
            <div className="shipper-kpi-label">Claims</div>
            <div className="shipper-kpi-value claim">
              {stats.loading ? '–' : stats.claims}
            </div>
            <div className="shipper-kpi-subtitle">Insurance claims</div>
          </div>
        </PermissionGate>

        <PermissionGate action="view" resource="pod">
          <div className="shipper-kpi-card pod">
            <div className="shipper-kpi-label">POD Confirmed</div>
            <div className="shipper-kpi-value pod">
              {stats.loading ? '–' : stats.pods}
            </div>
            <div className="shipper-kpi-subtitle">Proof of delivery</div>
          </div>
        </PermissionGate>
      </div>

      {/* Recent Bookings Section */}
      {!stats.loading && recentBookings.length > 0 && (
        <div className="shipper-recent-bookings">
          <div className="shipper-recent-header">
            <h2 className="shipper-recent-title">Recent Bookings</h2>
            <button
              onClick={() => navigate('/bookings')}
              className="shipper-view-all-btn"
            >
              View All →
            </button>
          </div>
          <div className="shipper-bookings-table">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => {
                  const statusDisplay = STATUS_CONFIG[booking.status] || { label: booking.status };
                  const statusClass = booking.status === 'DELIVERED' ? 'delivered' : booking.status === 'IN_TRANSIT' || booking.status === 'DISPATCHED' ? 'in-transit' : 'pending';
                  return (
                    <tr
                      key={booking.bookingID}
                      onClick={() => navigate(`/bookings/${booking.bookingID}`)}
                    >
                      <td>BK{String(booking.bookingID).padStart(3, '0')}</td>
                      <td>{booking.originSiteID} → {booking.destinationSiteID}</td>
                      <td>
                        <span className={`shipper-status-badge ${statusClass}`}>
                          {statusDisplay.label}
                        </span>
                      </td>
                      <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="shipper-quick-actions">
        <PermissionGate action="create" resource="bookings">
          <div
            onClick={() => navigate('/bookings/new')}
            className="shipper-action-card"
          >
            <div className="shipper-action-icon">📝</div>
            <h3 className="shipper-action-title">Create Booking</h3>
            <p className="shipper-action-desc">Start a new shipment</p>
          </div>
        </PermissionGate>

        <PermissionGate action="view" resource="exceptions">
          <div
            onClick={() => navigate('/exceptions')}
            className="shipper-action-card exception"
          >
            <div className="shipper-action-icon">⚠️</div>
            <h3 className="shipper-action-title">View Exceptions</h3>
            <p className="shipper-action-desc">Check issues & updates</p>
          </div>
        </PermissionGate>

        <PermissionGate action="view" resource="own-bookings">
          <div
            onClick={() => navigate('/bookings')}
            className="shipper-action-card bookings"
          >
            <div className="shipper-action-icon">📦</div>
            <h3 className="shipper-action-title">All Bookings</h3>
            <p className="shipper-action-desc">Manage your shipments</p>
          </div>
        </PermissionGate>
      </div>
    </DashboardShell>
  );
}
