import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import {
  clearMyNotifications,
  getMyNotifications,
  markAllNotificationsRead,
  markOneReadAndReturn,
} from "../../api/notificationApi";
import "../../styles/Notifications.css";

const CATEGORY_META = {
  PICKUP:     { icon: "🚚", color: "#3b82f6" },
  DELIVERY:   { icon: "📦", color: "#10b981" },
  EXCEPTION:  { icon: "⚠️", color: "#ef4444" },
  INVOICE:    { icon: "🧾", color: "#f59e0b" },
  DISPATCH:   { icon: "📤", color: "#8b5cf6" },
  ASSIGNMENT: { icon: "🧩", color: "#f97316" },
  ROUTING:    { icon: "🗺️", color: "#06b6d4" },
  DEFAULT:    { icon: "🔔", color: "#6b7280" },
};

const getCategoryMeta = (cat) =>
  CATEGORY_META[(cat || "").toUpperCase()] || CATEGORY_META.DEFAULT;

const timeAgo = (dateVal) => {
  if (!dateVal) return "Just now";
  const diff = Date.now() - new Date(dateVal).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  const loadNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyNotifications();
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load notifications.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notifications.filter((n) => {
      const status = (n.status || "").toUpperCase();
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;
      const matchesSearch =
        !q ||
        String(n.message || "").toLowerCase().includes(q) ||
        String(n.category || "").toLowerCase().includes(q) ||
        String(n.entityID ?? "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [notifications, search, statusFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const markRead = async (notificationId) => {
    try {
      await markOneReadAndReturn(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationID === notificationId ? { ...n, status: "READ" } : n
        )
      );
    } catch (err) {}
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
    } catch (err) {}
  };

  const clearAll = async () => {
    if (!window.confirm("Clear all notifications?")) return;
    try {
      await clearMyNotifications();
      setNotifications([]);
    } catch (err) {}
  };

  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => (n.status || "").toUpperCase() === "UNREAD").length,
    read:   notifications.filter((n) => (n.status || "").toUpperCase() === "READ").length,
    today:  notifications.filter((n) => {
      if (!n.createdAt) return false;
      return new Date(n.createdAt).toDateString() === new Date().toDateString();
    }).length,
  };

  return (
    <Layout>
      <div className="bookings-page">
        {/* HEADER SECTION */}
        <div className="page-header">
          <div className="header-left">
            <div className="page-title-group">
              <span className="page-title-icon">📦</span>
              <h1 className="page-title">Notifications</h1>
            </div>
            <p className="page-subtitle">Manage all freight notifications and alerts</p>
          </div>

          <div className="header-actions">
            {/* UPDATED CLASSES TO MATCH CSS SCOPE */}
            <button className="notification-action-btn btn-secondary" onClick={markAllRead}>
              ✓ Mark All Read
            </button>
            <button className="notification-action-btn btn-danger-outline" onClick={clearAll}>
              🗑 Clear All
            </button>
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-label">Total Notifications</span>
              <span className="stat-value">{stats.total}</span>
            </div>
          </div>
          <div className="stat-card border-orange">
            <div className="stat-content">
              <span className="stat-label">Unread</span>
              <span className="stat-value text-orange">{stats.unread}</span>
            </div>
          </div>
          <div className="stat-card border-green">
            <div className="stat-content">
              <span className="stat-label">Read</span>
              <span className="stat-value text-green">{stats.read}</span>
            </div>
          </div>
          <div className="stat-card border-blue">
            <div className="stat-content">
              <span className="stat-label">Today</span>
              <span className="stat-value text-blue">{stats.today}</span>
            </div>
          </div>
        </div>

        {/* CONTENT CARD */}
        <div className="content-card">
          <div className="table-controls">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="controls-right">
              <select 
                className="filter-select-custom" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="UNREAD">Unread</option>
                <option value="READ">Read</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <p>Loading notifications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <p>No notifications found.</p>
            </div>
          ) : (
            <ul className="notification-list">
              {paginated.map((n) => {
                const isUnread = (n.status || "").toUpperCase() === "UNREAD";
                const meta = getCategoryMeta(n.category);
                return (
                  <li 
                    key={n.notificationID} 
                    className={`notification-item ${isUnread ? "unread" : ""}`} 
                    onClick={() => isUnread && markRead(n.notificationID)}
                  >
                    <span className="item-icon" style={{ color: meta.color }}>{meta.icon}</span>
                    <div className="item-body">
                      <p className={`item-message ${isUnread ? "bold" : ""}`}>{n.message}</p>
                      <div className="item-meta">
                        <span className="meta-category">{(n.category || "GENERAL").toUpperCase()}</span>
                        <span className="meta-dot">•</span>
                        <span className="meta-time">{timeAgo(n.createdAt)}</span>
                        {n.entityID && (
                          <>
                            <span className="meta-dot">•</span>
                            <span className="meta-id">ID: #{n.entityID}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {isUnread && <span className="unread-dot" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="pagination-container">
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
            >
              ‹ Prev
            </button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
            >
              Next ›
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}