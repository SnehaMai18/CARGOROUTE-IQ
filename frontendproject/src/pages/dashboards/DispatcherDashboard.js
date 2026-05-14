import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from './DashboardShell';
import PermissionGate from '../../auth/PermissionGate';
import { getAllBookings } from '../../api/bookingsApi';
import { getAllExceptions } from '../../api/exceptionsApi';
import { getAllLoads } from '../../api/routingApi';
import { STATUS_CONFIG } from '../../utils/constants';

export default function DispatcherDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalBookings: 0,
    unplanned: 0,
    inTransit: 0,
    delivered: 0,
    openExceptions: 0,
    activeLoads: 0,
    loading: true,
    error: null,
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        const [bookings, exceptions, loads] = await Promise.all([
          getAllBookings().catch(() => []),
          getAllExceptions().catch(() => []),
          getAllLoads().catch(() => []),
        ]);

        const bookingArray = Array.isArray(bookings) ? bookings : [];
        const exceptionArray = Array.isArray(exceptions) ? exceptions : [];
        const loadArray = Array.isArray(loads) ? loads : [];

        const unplannedCount = bookingArray.filter(
          b => b.status === 'SUBMITTED' || b.status === 'PENDING'
        ).length;

        const inTransitCount = bookingArray.filter(
          b => b.status === 'IN_TRANSIT' || b.status === 'DISPATCHED'
        ).length;

        const deliveredCount = bookingArray.filter(
          b => b.status === 'DELIVERED'
        ).length;

        const openExceptionCount = exceptionArray.filter(
          e => e.status !== 'RESOLVED'
        ).length;

        const activeLoadCount = loadArray.filter(
          l => l.status === 'PLANNED' || l.status === 'IN_PROGRESS'
        ).length;

        const recent = bookingArray
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setRecentBookings(recent);

        setStats({
          totalBookings: bookingArray.length,
          unplanned: unplannedCount,
          inTransit: inTransitCount,
          delivered: deliveredCount,
          openExceptions: openExceptionCount,
          activeLoads: activeLoadCount,
          loading: false,
          error: null,
        });
      } catch (err) {
        setStats(prev => ({ ...prev, loading: false, error: err.message }));
      }
    };

    loadMetrics();
  }, []);

  const filteredBookings = recentBookings.filter((b) => {
    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      `BK${String(b.bookingID).padStart(3, '0')}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.originSiteID?.toString().includes(searchTerm) || b.destinationSiteID?.toString().includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardShell
      title="Dispatcher Dashboard"
      description="Plan, assign, and monitor freight operations"
    >
      {stats.error && (
        <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '6px', marginBottom: '1rem' }}>
          ⚠️ {stats.error}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>

        <KpiCard label="Total Bookings" value={stats.totalBookings} color="#6d28d9" icon="📦" />

   
        <KpiCard label="In Transit" value={stats.inTransit} color="#3b82f6" icon="🚚"  />

        <KpiCard label="Delivered" value={stats.delivered} color="#10b981" icon="✅"  />

        <KpiCard label="Open Exceptions" value={stats.openExceptions} color="#ef4444" icon="⚠️"  />

       

      </div>

      {/* Recent Bookings */}
      {!stats.loading && recentBookings.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <SectionHeader
            title="Recent Bookings"
            actionLabel="View All"
            onAction={() => navigate('/bookings')}
          />
          
        

          {filteredBookings.length > 0 ? (
            <BookingsTable
              bookings={filteredBookings}
              onRowClick={(id) => navigate(`/bookings/${id}`)}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', background: '#f9fafb', borderRadius: '8px', color: '#6b7280' }}>
              No bookings match your search criteria.
            </div>
          )}
        </div>
      )}

      {stats.loading && recentBookings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
          Loading bookings...
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '1rem', marginTop: '2rem' }}>

      
        <QuickAction
          icon="🚚"
          title="Dispatch Loads"
          subtitle="Assign drivers & vehicles"
          onClick={() => navigate('/dispatch')}
          color="#3b82f6"
        />

        <QuickAction
          icon="⚠️"
          title="Manage Exceptions"
          subtitle="Review and resolve issues"
          onClick={() => navigate('/exceptions')}
          color="#ef4444"
        />

        <QuickAction
          icon="📋"
          title="All Bookings"
          subtitle="View complete booking list"
          onClick={() => navigate('/bookings')}
          color="#f59e0b"
        />

      </div>
    </DashboardShell>
  );
}

/* ---------- Reusable UI Helpers ---------- */

function KpiCard({ label, value, color, icon, trend, isAlert }) {
  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      borderLeft: `4px solid ${color}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      ...(isAlert && { borderLeftWidth: '5px', boxShadow: `0 0 15px ${color}33` })
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color, marginTop: '0.5rem' }}>
            {value}
          </div>
        </div>
        <div style={{ fontSize: '24px', opacity: 0.7 }}>{icon}</div>
      </div>
      {trend && (
        <div style={{ fontSize: '12px', color: isAlert ? '#ef4444' : '#6b7280', marginTop: '0.75rem', fontWeight: 500 }}>
          {trend}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '1rem' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', margin: 0 }}>{title}</h2>
      <button
        onClick={onAction}
        style={{
          background: 'none',
          border: 'none',
          color: '#6d28d9',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          textDecoration: 'underline',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.color = '#5b21b6'}
        onMouseLeave={(e) => e.target.style.color = '#6d28d9'}
      >
        {actionLabel} →
      </button>
    </div>
  );
}

function BookingsTable({ bookings, onRowClick }) {
  return (
    <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <table width="100%" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Booking ID</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Route</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, idx) => {
            const cfg = STATUS_CONFIG[b.status] || { label: b.status };
            return (
              <tr
                key={b.bookingID}
                onClick={() => onRowClick(b.bookingID)}
                style={{
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : '#fafbfc'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'transparent' : '#fafbfc'}
              >
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>BK{String(b.bookingID).padStart(3, '0')}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{b.originSiteID} → {b.destinationSiteID}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 500,
                    background: cfg.cls === 'status-delivered' ? '#dcfce7' : cfg.cls === 'status-dispatched' ? '#dbeafe' : '#fef3c7',
                    color: cfg.cls === 'status-delivered' ? '#166534' : cfg.cls === 'status-dispatched' ? '#1e40af' : '#92400e'
                  }}>
                    {cfg.label}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function QuickAction({ icon, title, subtitle, onClick, color }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        cursor: 'pointer',
        border: '2px solid #e5e7eb',
        transition: 'all 0.3s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 4px 12px ${color}33`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ fontSize: '28px', marginBottom: '0.75rem' }}>{icon}</div>
      <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: '0 0 0.5rem 0' }}>{title}</h4>
      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{subtitle}</p>
    </div>
  );
}