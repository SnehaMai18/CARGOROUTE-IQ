import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext';
import DashboardShell from './DashboardShell';
import PermissionGate from '../../auth/PermissionGate';
import { getAllBookings } from '../../api/bookingsApi';
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
    const loadMetrics = async () => {
      try {
        setStats((prev) => ({ ...prev, loading: true, error: null }));
        const shipperId = user?.userId || user?.id || user?.userID;
        const [bookings, exceptions, claims, pods] = await Promise.all([
          getAllBookings().catch((e) => { console.error('Error fetching bookings:', e); return []; }),
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
      
    >
      {stats.error && (
        <div style={{ padding: '1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', marginBottom: '1rem', color: '#991b1b' }}>
          ⚠️ {stats.error}
        </div>
      )}

      {/* KPI Cards Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <PermissionGate action="view" resource="own-bookings">
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #6d28d9' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Total Bookings</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
              {stats.loading ? '–' : stats.totalBookings}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>All your shipments</div>
          </div>
        </PermissionGate>

        <PermissionGate action="view" resource="own-bookings">
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Pending</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginBottom: '0.5rem' }}>
              {stats.loading ? '–' : stats.pendingBookings}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Awaiting pickup</div>
          </div>
        </PermissionGate>

        <PermissionGate action="view" resource="own-bookings">
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>In Transit</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginBottom: '0.5rem' }}>
              {stats.loading ? '–' : stats.inTransitBookings}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Currently shipping</div>
          </div>
        </PermissionGate>

        <PermissionGate action="view" resource="own-bookings">
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Delivered</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginBottom: '0.5rem' }}>
              {stats.loading ? '–' : stats.deliveredBookings}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Completed shipments</div>
          </div>
        </PermissionGate>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <PermissionGate action="view" resource="exceptions">
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Exceptions</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444', marginBottom: '0.5rem' }}>
              {stats.loading ? '–' : stats.exceptions}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Issues reported</div>
          </div>
        </PermissionGate>

        <PermissionGate action="view" resource="exceptions">
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #ec4899' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Claims</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#ec4899', marginBottom: '0.5rem' }}>
              {stats.loading ? '–' : stats.claims}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Insurance claims</div>
          </div>
        </PermissionGate>

        <PermissionGate action="view" resource="pod">
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>POD Confirmed</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6', marginBottom: '0.5rem' }}>
              {stats.loading ? '–' : stats.pods}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Proof of delivery</div>
          </div>
        </PermissionGate>
      </div>

      {/* Recent Bookings Section */}
      {!stats.loading && recentBookings.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Recent Bookings</h2>
            <button
              onClick={() => navigate('/bookings')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6d28d9',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                textDecoration: 'underline',
              }}
            >
              View All →
            </button>
          </div>
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Booking ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Route</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => {
                  const statusDisplay = STATUS_CONFIG[booking.status] || { label: booking.status };
                  return (
                    <tr
                      key={booking.bookingID}
                      onClick={() => navigate(`/bookings/${booking.bookingID}`)}
                      style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', fontWeight: '500' }}>BK{String(booking.bookingID).padStart(3, '0')}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{booking.originSiteID} → {booking.destinationSiteID}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                        <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500', background: `${statusDisplay.cls === 'status-delivered' ? '#dcfce7' : statusDisplay.cls === 'status-dispatched' ? '#dbeafe' : '#fef3c7'}`, color: `${statusDisplay.cls === 'status-delivered' ? '#166534' : statusDisplay.cls === 'status-dispatched' ? '#1e40af' : '#92400e'}` }}>
                          {statusDisplay.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{new Date(booking.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <PermissionGate action="create" resource="bookings">
          <div
            onClick={() => navigate('/bookings/new')}
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              border: '2px solid #e5e7eb',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#6d28d9';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(109, 40, 217, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>📝</div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '0 0 0.5rem 0' }}>Create Booking</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Start a new shipment</p>
          </div>
        </PermissionGate>

        <PermissionGate action="view" resource="exceptions">
          <div
            onClick={() => navigate('/exceptions')}
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              border: '2px solid #e5e7eb',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>⚠️</div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '0 0 0.5rem 0' }}>View Exceptions</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Check issues & updates</p>
          </div>
        </PermissionGate>

        <PermissionGate action="view" resource="own-bookings">
          <div
            onClick={() => navigate('/bookings')}
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              border: '2px solid #e5e7eb',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>📦</div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '0 0 0.5rem 0' }}>All Bookings</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Manage your shipments</p>
          </div>
        </PermissionGate>
      </div>
    </DashboardShell>
  );
}
