import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { getAllTasks, getEntityName } from "../../api/taskApi";
import { getUserFromToken } from "../../utils/jwtUtils";
import "../../styles/Tasks.css";
import Pagination1 from "../../components/Pagination1";
 
const DRIVER_ROLE = "DRIVER";
const PAGE_SIZE = 6;
 
 
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
 
const priorityFromTask = (task) => {
  const explicit = String(task?.priority || "").toUpperCase();
  if (["URGENT", "HIGH", "MEDIUM", "LOW"].includes(explicit)) return explicit;
 
  const text = String(task?.description || "").toLowerCase();
  if (/(damage|exception|urgent|critical|blocked|breach)/.test(text)) return "URGENT";
  if (/(review|consolidate|audit|escalat|risk)/.test(text)) return "HIGH";
  if (/(assign|check|update|follow|verify)/.test(text)) return "MEDIUM";
  return "LOW";
};
 
const formatDueDateTime = (dueDate) => {
  if (!dueDate) return "-";
  const asDateTime = String(dueDate).includes("T") ? dueDate : `${dueDate}T12:00:00`;
  const d = new Date(asDateTime);
  if (Number.isNaN(d.getTime())) return String(dueDate);
  return d.toLocaleString();
};
 
const getRelatedLabel = (task) => {
  if (task?.relatedCode) return task.relatedCode;
  const desc = String(task?.description || "");
  const match = desc.match(/(BK\d+|LD[-\dA-Z]+|EXC\d+)/i);
  if (match?.[1]) return match[1].toUpperCase();
  return getEntityName(task?.relatedEntityID) || "-";
};
 
const statusText = (status) => {
  if (status === "INPROGRESS") return "In Progress";
  if (status === "COMPLETED") return "Completed";
  if (status === "CANCELLED") return "Cancelled";
  return "Pending";
};
 
export default function TasksPage() {
  const navigate = useNavigate();
  const user = getUserFromToken() || {};
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
 
  const role = String(user?.role || "").toUpperCase();
  const isDriver = role === DRIVER_ROLE;
  const currentUserId = getUserId(user);
 
 
 
  const loadTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllTasks();
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load tasks.");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    loadTasks();
  }, []);
 
  const visibleTasks = useMemo(() => {
    if (!isDriver) return tasks;
    if (currentUserId == null) return [];
    return tasks.filter((t) => Number(t.assignedTo) === currentUserId);
  }, [tasks, isDriver, currentUserId]);
 
  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visibleTasks.filter((t) => {
      const normalized = normalizeStatus(t.status);
      const matchesStatus = statusFilter === "ALL" || normalized === statusFilter;
      const matchesSearch =
        !q ||
        String(t.taskID ?? "").toLowerCase().includes(q) ||
        String(t.description ?? "").toLowerCase().includes(q) ||
        String(t.relatedEntityID ?? "").toLowerCase().includes(q) ||
        String(t.assignedTo ?? "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [visibleTasks, search, statusFilter]);
 
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
 
const paginatedTasks = filteredTasks.slice(
  (currentPage - 1) * PAGE_SIZE,
  currentPage * PAGE_SIZE
);
 
 
  useEffect(() => {
  setCurrentPage(1);
}, [search, statusFilter, visibleTasks]);
 
 
  const stats = useMemo(() => {
    const normalized = visibleTasks.map((t) => normalizeStatus(t.status));
    return {
      total: visibleTasks.length,
      pending: normalized.filter((s) => s === "PENDING").length,
      inProgress: normalized.filter((s) => s === "INPROGRESS").length,
      completed: normalized.filter((s) => s === "COMPLETED").length,
    };
  }, [visibleTasks]);
 
  return (
    <Layout>
      <div className="tasks-page">
        <div className="tasks-header">
          <div>
            <div className="page-title-group">
              <span className="page-title-icon">📋</span>
              <h1 className="tasks-title">Tasks</h1>
            </div>
            <p className="tasks-subtitle">
              Manage your tasks and action items
            </p>
          </div>
          <div className="tasks-header-actions">
            <button
              className="btn-primary expand-btn icon-btn"
              title="Create Task"
              onClick={() => navigate('/tasks/new')}
            >
              <span className="expand-btn-icon">+</span>
              <span className="expand-btn-label">Create Task</span>
            </button>
          </div>
        </div>
 
        {error && <div className="tasks-error">⚠ {error}</div>}
 
        <div className="tasks-stats-grid">
          <div className="tasks-stat-card">
            <div className="tasks-stat-label">Total Tasks</div>
            <div className="tasks-stat-value">{stats.total}</div>
          </div>
          <div className="tasks-stat-card tasks-stat-pending">
            <div className="tasks-stat-label">Pending</div>
            <div className="tasks-stat-value">{stats.pending}</div>
          </div>
          <div className="tasks-stat-card tasks-stat-progress">
            <div className="tasks-stat-label">In Progress</div>
            <div className="tasks-stat-value">{stats.inProgress}</div>
          </div>
          <div className="tasks-stat-card tasks-stat-completed">
            <div className="tasks-stat-label">Completed</div>
            <div className="tasks-stat-value">{stats.completed}</div>
          </div>
        </div>
 
        <div className="tasks-card">
          <div className="tasks-toolbar">
            <div className="tasks-search-wrapper">
              <span className="tasks-search-icon">🔍</span>
              <input
                className="tasks-search"
                placeholder="Search by task id, description, entity id, assignee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="status-dropdown-wrapper">
              <select
                className="status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Status</option>
                <option value="PENDING">Pending</option>
                <option value="INPROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
 
          <div className="tasks-section-head">
            <h3>All Tasks</h3>
          </div>
 
          {loading ? (
            <div className="tasks-empty">Loading tasks...</div>
          ) : paginatedTasks.length === 0 ? (
            <div className="tasks-empty">No tasks found.</div>
          ) : (
            <div className="tasks-list">
              {paginatedTasks.map((t) => {
                const normalized = normalizeStatus(t.status);
                const priority = priorityFromTask(t);
                return (
                  <div className="task-item" key={t.taskID ?? `${t.description}-${t.assignedTo}-${t.dueDate}`}>
                    <div className="task-item-top">
                     
                      <span className={`tasks-status tasks-status-${normalized.toLowerCase()}`}>{statusText(normalized)}</span>
                    </div>
 
                    <div className="task-due">Due: {formatDueDateTime(t.dueDate)}</div>
                    <p className="task-desc">{t.description || "-"}</p>
 
                    <div className="task-bottom">
 
                      <button
                        className="task-view-btn"
                        onClick={() => t?.taskID && navigate(`/tasks/${t.taskID}`)}
                        disabled={!t?.taskID}
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
 
          {!loading && filteredTasks.length > PAGE_SIZE && (
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
 
 