import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { getMyNotifications, markOneReadAndReturn } from '../api/notificationApi';
import { getAllTasks } from '../api/taskApi';
import { signoutUser } from '../api/authApi';
import '../styles/Layout.css';
 
const NAV_ITEMS = [
  { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
  {
    label: 'Bookings',
    icon: '📦',
    path: '/bookings',
    roles: ['Admin', 'Dispatcher', 'Shipper', 'Analyst', 'FleetManager', 'WarehouseManager', 'BillingClerk'],
    children: [
      { label: 'All Bookings', path: '/bookings', roles: ['Admin', 'Dispatcher', 'Shipper', 'Analyst', 'FleetManager', 'WarehouseManager', 'BillingClerk'] },
      { label: 'New Booking', path: '/bookings/new', roles: ['Admin', 'Shipper'] },
    ],
  },
  {
    label: 'Shippers',
    icon: '👥',
    path: '/shippers',
    roles: ['Admin', 'Dispatcher', 'Analyst'],
    children: [
      { label: 'All Shippers', path: '/shippers', roles: ['Admin', 'Dispatcher', 'Analyst'] },
      { label: 'Add Shipper', path: '/shippers/new', roles: ['Admin'] },
    ],
  },
  {
    label: 'Fleet Management',
    icon: '🚚',
    path: '/fleet/vehicles',
    roles: ['Admin', 'Dispatcher', 'FleetManager'],
    children: [
      { label: 'Fleet Registry', path: '/fleet/vehicles', roles: ['Admin', 'Dispatcher', 'FleetManager'] },
      { label: 'Add Vehicle', path: '/fleet/vehicles/new', roles: ['Admin', 'FleetManager'] },
    ],
  },
  {
    label: 'Route Optimization',
    icon: '🗺️',
    path: '/routing/routes',
    roles: ['Admin', 'Dispatcher', 'FleetManager'],
    children: [
      { label: 'Route Optimization', path: '/routing/routes', roles: ['Admin', 'Dispatcher', 'FleetManager'] },
      { label: 'Load Planning', path: '/routing/load-planning', roles: ['Admin', 'Dispatcher', 'FleetManager'] },
     
    ],
  },
  {
    label: 'Dispatch',
    icon: '📤',
    path: '/dispatch',
    roles: ['Admin', 'Dispatcher', 'FleetManager', 'Driver'],
    children: [
      { label: 'All Dispatches', path: '/dispatch', roles: ['Admin', 'Dispatcher', 'FleetManager','WarehouseManager'] },
      { label: 'New Dispatch', path: '/dispatch/new', roles: ['Admin', 'Dispatcher', 'FleetManager'] },
      { label: 'Drivers', path: '/drivers', roles: ['Admin', 'Dispatcher', 'FleetManager','WarehouseManager'] },
      { label: 'Driver Acknowledgements', path: '/driver-ack', roles: ['Admin', 'Dispatcher', 'FleetManager', 'Driver'] },
    ],
  },
  {
    label: 'Manifests & POD',
    icon: '📄',
    path: '/manifests',
    roles: ['Admin', 'Dispatcher', 'WarehouseManager', 'Analyst', 'BillingClerk'],
    children: [
      { label: 'All Manifests', path: '/manifests', roles: ['Admin', 'Dispatcher', 'WarehouseManager', 'Analyst', 'BillingClerk'] },
      { label: 'New Manifest', path: '/manifests/new', roles: ['Admin', 'Dispatcher', 'WarehouseManager'] },
      { label: 'Proof of Delivery', path: '/pod', roles: ['Admin', 'Dispatcher', 'WarehouseManager', 'Analyst', 'BillingClerk', 'Driver'] },
      { label: 'Handovers', path: '/handovers', roles: ['Admin', 'Dispatcher', 'WarehouseManager', 'Analyst', 'BillingClerk'] },
    ],
  },
  {
    label: 'Exceptions & Claims',
    icon: '⚠️',
    path: '/exceptions',
    roles: ['Admin', 'Dispatcher', 'Shipper', 'FleetManager', 'WarehouseManager', 'BillingClerk', 'Analyst'],
    children: [
      { label: 'All Exceptions', path: '/exceptions', roles: ['Admin', 'Dispatcher', 'Shipper', 'FleetManager', 'WarehouseManager', 'BillingClerk', 'Analyst'] },
      { label: 'Report Exception', path: '/exceptions/new', roles: ['Shipper', 'Dispatcher'] },
      { label: 'Claims', path: '/claims', roles: ['Admin', 'Dispatcher', 'Shipper', 'FleetManager', 'WarehouseManager', 'BillingClerk', 'Analyst'] },
      { label: 'File Claim', path: '/claims/new', roles: ['Admin', 'Shipper'] },
    ],
  },
  { label: 'User Management', icon: '👥', path: '/admin/users', roles: ['Admin'] },
  { label: 'Audit Logs', icon: '🧾', path: '/admin/audit-logs', roles: ['Admin'] },
  {
    label: 'Billing',
    icon: '💳',
    path: '/billing',
    roles: ['Admin', 'BillingClerk', 'Analyst'],
    children: [
      { label: 'Billing Panel', path: '/billing', roles: ['Admin', 'BillingClerk', 'Analyst'] },
      { label: 'Invoices', path: '/billing/invoices', roles: ['Admin', 'BillingClerk', 'Analyst'] },
      { label: 'Billing Lines', path: '/billing/billing-lines', roles: ['Admin', 'BillingClerk', 'Analyst'] },
      { label: 'Tariffs', path: '/billing/tariffs', roles: ['Admin', 'BillingClerk', 'Analyst'] },
    ],
  },
  {
    label: 'Reports',
    icon: '📊',
    path: '/reports',
    roles: ['Admin', 'Analyst'],
    children: [
      { label: 'Reports', path: '/reports', roles: ['Admin', 'Analyst'] },
      { label: 'KPIs', path: '/kpis', roles: ['Admin', 'Analyst'] },
    ],
  },
];
 
const DRIVER_ROLE = 'DRIVER';
const SIDEBAR_STORAGE_KEY = 'CargoRouteSidebarOpen';
 
const getUserId = (u) => {
  const raw = u?.userId ?? u?.userID ?? u?.id ?? null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};
 
const normalizeTaskStatus = (status) => {
  const s = String(status || 'PENDING').replace(/\s|_/g, '').toUpperCase();
  if (s === 'INPROGRESS') return 'INPROGRESS';
  if (s === 'COMPLETED') return 'COMPLETED';
  if (s === 'CANCELLED') return 'CANCELLED';
  return 'PENDING';
};
 
export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutUser } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });
  const [expandedMenus, setExpandedMenus] = useState({ '/bookings': false, '/exceptions': false, '/dispatch': false, '/manifests': false });
  const [headerNotifications, setHeaderNotifications] = useState([]);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
 
  const unreadHeaderNotifications = useMemo(
    () => headerNotifications
      .filter((n) => (n.status || '').toUpperCase() === 'UNREAD')
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [headerNotifications]
  );
 
  const fetchHeaderNotifications = async () => {
    try {
      const res = await getMyNotifications();
      setHeaderNotifications(Array.isArray(res.data) ? res.data : []);
    } catch {
      setHeaderNotifications([]);
    }
  };
 
  const fetchPendingTasksCount = async () => {
    try {
      const res = await getAllTasks();
      const list = Array.isArray(res.data) ? res.data : [];
      const role = String(user?.role || '').toUpperCase();
      const isDriver = role === DRIVER_ROLE;
      const currentUserId = getUserId(user);
 
      const scoped = isDriver
        ? list.filter((t) => currentUserId != null && Number(t.assignedTo) === currentUserId)
        : list;
 
      const pendingCount = scoped.filter((t) => normalizeTaskStatus(t.status) === 'PENDING').length;
      setPendingTasksCount(pendingCount);
    } catch {
      setPendingTasksCount(0);
    }
  };
 
  useEffect(() => {
    fetchHeaderNotifications();
    fetchPendingTasksCount();
  }, [location.pathname, user?.role, user?.userId, user?.userID, user?.id]);
 
  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarOpen ? 'true' : 'false');
  }, [sidebarOpen]);
 
  useEffect(() => {
    setProfileMenuOpen(false);
  }, [location.pathname]);
 
  const markHeaderNotificationRead = async (notificationId) => {
    try {
      await markOneReadAndReturn(notificationId);
      setHeaderNotifications((prev) =>
        prev.map((n) =>
          n.notificationID === notificationId ? { ...n, status: 'READ' } : n
        )
      );
    } catch {
      // keep modal open even if update fails
    }
  };
 
  const toggleMenu = (path) => {
    setExpandedMenus((prev) => ({ ...prev, [path]: !prev[path] }));
  };
 
  const isActive = (path) => location.pathname === path;
 
  const isParentActive = (item) =>
    item.children && item.children.some((c) => location.pathname.startsWith(c.path));
 
  const handleSignout = () => {
    // Always sign out locally immediately for reliable UX.
    // Remote signout is best-effort and should not block navigation.
    signoutUser().catch(() => {});
    setProfileMenuOpen(false);
    logoutUser();
    navigate('/login', { replace: true });
  };
 
  return (
    <div className="layout-container">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`} aria-hidden={!sidebarOpen}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
            <div className="logo-text">
              <div className="logo-title">CargoRoute IQ</div>
              <div className="logo-subtitle">Freight Routing &amp; Load Balancer</div>
            </div>
          </div>
        </div>
 
        <nav className="sidebar-nav" role="navigation" aria-label="Primary sidebar">
          {NAV_ITEMS.filter((item) => {
            const role = String(user?.role || '').trim();
            const hasItemAccess = !item.roles || item.roles.includes(role);
            const visibleChildren = item.children?.filter((child) => !child.roles || child.roles.includes(role)) || [];
            return hasItemAccess || visibleChildren.length > 0;
          }).map((item) => {
            const role = String(user?.role || '').trim();
            const visibleChildren = item.children?.filter((child) => !child.roles || child.roles.includes(role)) || [];
            return item.children ? (
              <div key={item.path}>
                <div
                  className={`nav-item ${isParentActive(item) ? 'nav-item-active' : ''}`}
                  onClick={() => toggleMenu(item.path)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-chevron">
                    {expandedMenus[item.path] ? '▾' : '▸'}
                  </span>
                </div>
                {expandedMenus[item.path] && (
                  <div className="nav-submenu">
                    {visibleChildren.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`nav-subitem ${isActive(child.path) ? 'nav-subitem-active' : ''}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'nav-item-active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
         
        </nav>
      </aside>
 
      {/* ── Main area ── */}
      <div className="layout-main">
        {/* Top header */}
        <header className="top-header">
          <div className="header-left">
            <button
              className="hamburger"
              onClick={() => setSidebarOpen((v) => !v)}
              title="Toggle sidebar"
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <div className="header-brand">
              <span className="header-brand-icon">
                <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              </span>
              <div>
                <div className="header-brand-title">CargoRoute IQ</div>
                <div className="header-brand-sub">Freight Routing &amp; Load Balancer</div>
              </div>
            </div>
          </div>
 
          <div className="header-right">
            <div className="header-notif-wrap">
              <button
                className="header-icon-btn"
                title="Notifications"
                onClick={() => {
                  fetchHeaderNotifications();
                  setNotifMenuOpen((v) => !v);
                }}
              >
                <span role="img" aria-label="bell">🔔</span>
                <span className="badge">{Math.min(unreadHeaderNotifications.length, 99)}</span>
              </button>
 
              {notifMenuOpen && (
                <>
                  <div className="notif-modal-overlay" onClick={() => setNotifMenuOpen(false)} />
                  <div className="notif-modal">
                    <div className="notif-modal-head">
                      <div className="notif-popover-title">Latest unread notifications</div>
                      <button className="notif-modal-close" onClick={() => setNotifMenuOpen(false)}>✕</button>
                    </div>
 
                    {unreadHeaderNotifications.slice(0, 4).map((n) => (
                      <button
                        key={n.notificationID}
                        className="notif-pop-item"
                        onClick={() => markHeaderNotificationRead(n.notificationID)}
                      >
                        <span className="notif-pop-dot" />
                        <span className="notif-pop-text">
                          <span className="notif-pop-msg">{n.message}</span>
                          <span className="notif-pop-time">
                            {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                          </span>
                        </span>
                      </button>
                    ))}
 
                    {unreadHeaderNotifications.length === 0 && (
                      <div className="notif-pop-empty">No unread notifications</div>
                    )}
 
                    <button
                      className="notif-pop-footer"
                      onClick={() => {
                        setNotifMenuOpen(false);
                        navigate('/notifications');
                      }}
                    >
                      See all notifications
                    </button>
                  </div>
                </>
              )}
            </div>
 
            <button className="header-icon-btn" title="Tasks" onClick={() => navigate('/tasks')}>
              <span role="img" aria-label="tasks">📋</span>
              <span className="badge">{Math.min(pendingTasksCount, 99)}</span>
            </button>
            <div className="header-user-menu-wrap">
              <button className="header-user" onClick={() => setProfileMenuOpen((v) => !v)} title="Account menu">
                <div className="user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'J'}
                </div>
                <div className="user-info">
                  <div className="user-name">{user?.name || 'John Dispatcher'}</div>
                  <div className="user-role">{user?.role || 'Dispatcher'}</div>
                </div>
                <span className="user-menu-chevron">▾</span>
              </button>
 
              {profileMenuOpen && (
                <div className="profile-popover">
                  <button className="profile-pop-item" onClick={() => { setProfileMenuOpen(false); navigate('/profile'); }}>
                    My Profile
                  </button>
                  <button className="profile-pop-item profile-pop-item-danger" onClick={handleSignout}>
                    Signout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
 
        {/* Page content */}
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
}
 
 