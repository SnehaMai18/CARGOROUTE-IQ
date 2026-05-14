import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { getTaskById, updateTask, getEntityName } from "../../api/taskApi";
import { getUserFromToken } from "../../utils/jwtUtils";
import axios from "axios";
import "../../styles/Tasks.css";
 
const DRIVER_ROLE = "DRIVER";
 
const getUserId = (user) => {
  const raw = user?.userId ?? user?.userID ?? user?.id ?? null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};
 
const normalizeStatus = (status) => {
  const s = String(status || "PENDING").replace(/\s|_/g, "").toUpperCase();
  if (s === "INPROGRESS") return "INPROGRESS";
  if (s === "COMPLETED") return "COMPLETED";
  if (s === "CANCELLED") return "CANCELLED";
  return "PENDING";
};
 
const statusText = (status) => {
  if (status === "INPROGRESS") return "In Progress";
  if (status === "COMPLETED") return "Completed";
  if (status === "CANCELLED") return "Cancelled";
  return "Pending";
};
 
export default function TaskDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = getUserFromToken() || {};
  const role = String(user?.role || "").toUpperCase();
  const isDriver = role === DRIVER_ROLE;
  const currentUserId = getUserId(user);
 
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userMap, setUserMap] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ description: "", status: "PENDING", dueDate: "" });
  const [saving, setSaving] = useState(false);
 
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getTaskById(id);
        setTask(res.data);
        setEditForm({
          description: res?.data?.description || "",
          status: normalizeStatus(res?.data?.status),
          dueDate: res?.data?.dueDate || "",
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load task.");
        setTask(null);
      } finally {
        setLoading(false);
      }
    };
 
    load();
  }, [id]);
 
  useEffect(() => {
    const loadUsersMap = async () => {
      try {
        const res = await axios.get("http://localhost:8080/cargoRoute/user/getAllUsers", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const rows = Array.isArray(res.data) ? res.data : [];
        const map = {};
        rows.forEach((u) => {
          if (u?.userID != null) map[String(u.userID)] = u.name || `User ${u.userID}`;
        });
        setUserMap(map);
      } catch {
        setUserMap({});
      }
    };
    loadUsersMap();
  }, []);
 
  const blockedByScope = useMemo(() => {
    if (!task) return false;
    if (!isDriver) return false;
    if (currentUserId == null) return true;
    return Number(task.assignedTo) !== currentUserId;
  }, [task, isDriver, currentUserId]);
 
  const normalizedStatus = normalizeStatus(task?.status);
 
  const assigneeName = task?.assignedTo != null
    ? userMap[String(task.assignedTo)] || `User ${task.assignedTo}`
    : "-";
 
  const handleSaveEdits = async () => {
    if (!task?.taskID) return;
    setSaving(true);
    setError("");
    try {
      const res = await updateTask(task.taskID, {
        description: editForm.description,
        status: editForm.status,
        dueDate: editForm.dueDate,
      });
      setTask(res?.data || task);
      setEditMode(false);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to update task right now.");
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Layout>
      <div className="bookings-page">
        <div className="page-header">
          <div className="header-left">
            <div className="page-title-group">
              <span className="page-title-icon">✓</span>
              <h1 className="page-title">Task Details</h1>
            </div>
            <p className="page-subtitle">Review task information</p>
          </div>
          <div className="header-actions">
            <button className="notification-action-btn btn-secondary" onClick={() => navigate("/tasks")} title="Back">← </button>
            {!loading && !error && task && !blockedByScope && (
              <button className="notification-action-btn btn-secondary" onClick={() => setEditMode((v) => !v)}>
                {editMode ? " RESET" : "EDIT"}
              </button>
            )}
          </div>
        </div>
 
        {loading ? (
          <div className="content-card"><div className="empty-state">Loading task...</div></div>
        ) : error ? (
          <div className="tasks-error">⚠ {error}</div>
        ) : blockedByScope ? (
          <div className="tasks-error">⚠ You are not allowed to view this task.</div>
        ) : !task ? (
          <div className="content-card"><div className="empty-state">Task not found.</div></div>
        ) : (
          <div className="content-card">
            <div className="tasks-detail-grid">
              <div className="tasks-detail-row"><span>Task Reference</span><strong>{task.taskID ?? "-"}</strong></div>
              <div className="tasks-detail-row">
                <span>Workflow Status</span>
                <strong>
                  {editMode ? (
                    <select
                      className="filter-select-custom"
                      value={editForm.status}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="INPROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  ) : (
                    <span className={`tasks-status tasks-status-${normalizedStatus.toLowerCase()}`}>{statusText(normalizedStatus)}</span>
                  )}
                </strong>
              </div>
              <div className="tasks-detail-row"><span>Assigned To</span><strong>{assigneeName}</strong></div>
             
              <div className="tasks-detail-row">
                <span>Planned Due Date</span>
                <strong>
                  {editMode ? (
                    <input
                      type="date"
                      className="filter-select-custom"
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                    />
                  ) : (
                    task.dueDate || "-"
                  )}
                </strong>
              </div>
            </div>
 
            <div className="tasks-detail-description">
              <h3>Task Summary</h3>
              {editMode ? (
                <textarea
                  className="filter-select-custom"
                  style={{ width: "100%", minHeight: "120px" }}
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              ) : (
                <p>{task.description || "-"}</p>
              )}
            </div>
 
            {editMode && (
              <div className="form-actions" style={{ marginTop: 14 }}>
                <button className="notification-action-btn btn-secondary" onClick={() => {
                  setEditMode(false);
                  setEditForm({ description: task.description || "", status: normalizeStatus(task.status), dueDate: task.dueDate || "" });
                }}>
                  RESET
                </button>
                <button className="notification-action-btn btn-primary" onClick={handleSaveEdits} disabled={saving}>
                  {saving ? "💾 Saving..." : "SAVE"}
                </button>
              </div>
            )}
            {editMode && (
              <div className="inline-note">
                If save fails, backend update endpoint may be unavailable.
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
 
 
 