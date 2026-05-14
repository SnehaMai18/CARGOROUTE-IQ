import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllAuditLogs } from "../api/auditLogsApi";
import axios from "axios";
import { formatDashboardDateTime, getInitials } from "../utils/dateFormatter";

/**
 * RecentAuditLogs Component - Cleaned 3-Column Layout
 */
export default function RecentAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const auditData = await getAllAuditLogs();
        const sortedLogs = [...auditData]
          .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
          .slice(0, 5);

        setLogs(sortedLogs);

        try {
          const userRes = await axios.get("http://localhost:8081/cargoRoute/user/getAllUsers", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          const rows = Array.isArray(userRes.data) ? userRes.data : [];
          const map = {};
          rows.forEach((u) => {
            if (u?.userID != null) map[String(u.userID)] = u.name || `User ${u.userID}`;
          });
          setUserMap(map);
        } catch {
          setUserMap({});
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load recent audit logs.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const resolveUserName = (id) => (id == null ? "System" : userMap[String(id)] || `User ${id}`);
  
  const getResourceLabel = (log) => `${log.action || "ACTION"} ${log.resourceType || "RESOURCE"}`;

 
  if (loading || error || logs.length === 0) {
    return (
      <div className="dashboard-table-card">
        <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
          {loading ? "Loading..." : error || "No recent activity found."}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-table-card" style={{ borderRadius: "8px", overflow: "visible", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
      {/* Updated Table Title Header */}
      <div className="table-header" style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "16px", 
        backgroundColor: "#ffffff", 
        color: "#370a6e" 
      }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600" }}>Recent 5 Audit Logs</h3>
        <Link to="/admin/audit-logs" className="view-all-link" style={{ color: "#130835", opacity: 0.8, fontSize: "13px", textDecoration: "none" }}>View All</Link>
      </div>

      <div className="table-container audit-logs-table" style={{ width: "100%", overflowX: "auto", overflowY: "hidden", minWidth: "100%", boxSizing: "border-box" }}>
        <table className="events-table" style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
          <thead>
            {/* Updated Column Name Row */}
            <tr style={{ textAlign: "left", backgroundColor: "#370a6e", color: "#ffffff" }}>
              <th style={{ padding: "10px 12px", width: "30%", fontWeight: "500", fontSize: "14px" }}>Action Taker</th>
              <th style={{ padding: "10px 12px", width: "35%", fontWeight: "500", fontSize: "14px" }}>Resource</th>
              <th style={{ padding: "10px 12px", width: "35%", textAlign: "right", fontWeight: "500", fontSize: "14px" }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => {
              const actionTaker = resolveUserName(log.userID);
              const resourceLabel = getResourceLabel(log);
              const timestamp = formatDashboardDateTime(log.timestamp);
              const initials = getInitials(actionTaker);
   

              return (
                <tr key={log.auditID || index} style={{ borderBottom: "1px solid #ffffff" }}>
                  {/* Column 1: Action Taker */}
                  <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap", overflow: "hidden" }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                         color: "#370a6e",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: "bold", flexShrink: 0
                      }}>
                        {initials}
                      </div>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", fontSize: "14px", color: "#374151" }}>{actionTaker}</span>
                    </div>
                  </td>

                  {/* Column 2: Resource Badge */}
                  <td style={{ padding: "10px 12px", verticalAlign: "middle", whiteSpace: "normal" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      maxWidth: "100%",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "10px",
                      lineHeight: 1.2,
                      fontWeight: "700",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      backgroundColor: log.action === "CREATE" ? "#d1fae5" : log.action === "DELETE" ? "#fee2e2" : "#fef3c7",
                      color: log.action === "CREATE" ? "#059669" : log.action === "DELETE" ? "#dc2626" : "#d97706",
                      border: "1px solid currentColor",
                      opacity: 0.9
                    }}>
                      {resourceLabel}
                    </span>
                  </td>

                  {/* Column 3: Timestamp */}
                  <td style={{ padding: "10px 12px", textAlign: "right", verticalAlign: "middle", color: "#6b7280", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {timestamp}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}