import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import Pagination1 from "../../components/Pagination1";
import { getAllAuditLogs } from "../../api/auditLogsApi";
import axios from "axios";
import "../../styles/Bookings.css";
import "../../styles/Users.css"; // reuse badges & stats styles

/* ───────────────────────── Helpers ───────────────────────── */

function formatDateTime(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleString();
}

const PAGE_SIZE = 6;

/* ───────────────────────── Component ───────────────────────── */

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [timeSort, setTimeSort] = useState("DESC");
  const [currentPage, setCurrentPage] = useState(1);

  /* ───────────────────────── Data Load ───────────────────────── */

  const loadAuditLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllAuditLogs();
      const sorted = [...data].sort((a, b) => {
        const ta = new Date(a.timestamp || 0).getTime();
        const tb = new Date(b.timestamp || 0).getTime();
        return tb - ta;
      });
      setLogs(sorted);
    } catch (err) {
      setLogs([]);
      setError(
        err?.response?.data?.message ||
          "Unable to fetch audit logs right now. Please try again shortly."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadUsersMap = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/cargoRoute/user/getAllUsers",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const rows = Array.isArray(res.data) ? res.data : [];
      const map = {};
      rows.forEach((u) => {
        if (u?.userID != null) {
          map[String(u.userID)] = u.name || `User ${u.userID}`;
        }
      });
      setUserMap(map);
    } catch {
      setUserMap({});
    }
  };

  useEffect(() => {
    loadAuditLogs();
    loadUsersMap();
  }, []);

  const resolveUserName = (id) => {
    if (id == null) return "-";
    return userMap[String(id)] || `User ${id}`;
  };

  /* ───────────────────────── Filters ───────────────────────── */

  const actionOptions = useMemo(() => {
    const set = new Set(logs.map((x) => x.action).filter(Boolean));
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = logs.filter((l) => {
      const matchesSearch =
        !q ||
        String(l.auditID || "").toLowerCase().includes(q) ||
        resolveUserName(l.userID).toLowerCase().includes(q) ||
        resolveUserName(l.resourceID).toLowerCase().includes(q) ||
        (l.resourceType || "").toLowerCase().includes(q) ||
        (l.details || "").toLowerCase().includes(q);

      const matchesAction =
        actionFilter === "ALL" || l.action === actionFilter;

      return matchesSearch && matchesAction;
    });

    rows.sort((a, b) => {
      const ta = new Date(a.timestamp || 0).getTime();
      const tb = new Date(b.timestamp || 0).getTime();
      return timeSort === "ASC" ? ta - tb : tb - ta;
    });

    return rows;
  }, [logs, search, actionFilter, timeSort]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, actionFilter, timeSort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /* ───────────────────────── Stats ───────────────────────── */

  const stats = {
    total: logs.length,
    userActions: logs.filter((l) => l.resourceType === "USER").length,
    opsActions: logs.filter((l) =>
      ["VEHICLE", "LOAD", "ROUTE", "DISPATCH"].includes(l.resourceType)
    ).length,
    system: logs.filter((l) => l.resourceType === "SYSTEM").length,
  };

  /* ───────────────────────── Export ───────────────────────── */

  const exportAuditLogs = () => {
    const headers = [
      "Action Taker",
      "Action",
      "Resource",
      "User Affected",
      "Details",
      "Timestamp",
    ];

    const rows = filtered.map((l) => [
      resolveUserName(l.userID),
      l.action || "-",
      l.resourceType || "-",
      resolveUserName(l.resourceID),
      l.details || "-",
      formatDateTime(l.timestamp),
    ]);

    const csv = [headers, ...rows]
      .map((r) =>
        r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ───────────────────────── Render ───────────────────────── */

  return (
    <Layout>
      <div className="bookings-page">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Audit Logs</h1>
            <p className="page-subtitle">
              Track system actions and changes across services
            </p>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Events</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">User Actions</div>
            <div className="stat-value stat-optimized">{stats.userActions}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Operational</div>
            <div className="stat-value stat-pending">{stats.opsActions}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">System</div>
            <div className="stat-value stat-completed">{stats.system}</div>
          </div>
        </div>

        {error && (
          <div className="auth-message auth-message-error">
            ⚠ {error}
          </div>
        )}

        {/* ── Table Section ── */}
        <div className="table-section">
          <h2 className="section-title">All Audit Logs</h2>

          {/* Toolbar */}
          <div className="table-toolbar">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search audit logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="toolbar-right">
              <select
                className="status-select"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="ALL">All Actions</option>
                {actionOptions.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>

              <button className="btn-export" onClick={exportAuditLogs}>
                <span className="export-arrow">↓</span>
                Export
              </button>
              
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="empty-state">Loading audit logs…</div>
          ) : (
            <div className="table-wrapper">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Action Taker</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>User Affected</th>
                    <th>Details</th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setTimeSort((p) => (p === "DESC" ? "ASC" : "DESC"))
                      }
                    >
                      Timestamp {timeSort === "DESC" ? "↓" : "↑"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty-state">
                        No audit logs found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((log) => (
                      <tr key={log.auditID || `${log.userID}-${log.timestamp}`}>
                        <td>{resolveUserName(log.userID)}</td>
                        <td>
                          <span
                            className={`status-badge audit-action ${String(
                              log.action
                            ).toLowerCase()}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`resource-badge resource-${String(
                              log.resourceType
                            ).toLowerCase()}`}
                          >
                            {log.resourceType}
                          </span>
                        </td>
                        <td>{resolveUserName(log.resourceID)}</td>
                        <td
                          className="audit-details-cell"
                          title={log.details || ""}
                        >
                          {log.details || "-"}
                        </td>
                        <td>{formatDateTime(log.timestamp)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > PAGE_SIZE && (
            <Pagination1
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              infoText={`Page ${currentPage} of ${totalPages}`}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
