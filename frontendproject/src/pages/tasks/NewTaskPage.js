import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { createTask } from "../../api/taskApi";
import { getUserFromToken } from "../../utils/jwtUtils";
import axios from "axios";
import "../../styles/Tasks.css";
 
const DRIVER_ROLE = "DRIVER";
 
// All database tables as entity types
const ENTITY_TYPES = [
  { id: 1, label: "User" },
  { id: 2, label: "AuditLog" },
  { id: 3, label: "Shipper" },
  { id: 4, label: "Booking" },
  { id: 5, label: "Vehicle" },
  { id: 6, label: "Driver" },
  { id: 7, label: "VehicleAvailability" },
  { id: 8, label: "Load" },
  { id: 9, label: "Route" },
  { id: 10, label: "RoutingRule" },
  { id: 11, label: "Dispatch" },
  { id: 12, label: "DriverAck" },
  { id: 13, label: "Manifest" },
  { id: 14, label: "Handover" },
  { id: 15, label: "ProofOfDelivery" },
  { id: 16, label: "Tariff" },
  { id: 17, label: "BillingLine" },
  { id: 18, label: "Invoice" },
  { id: 19, label: "Exception" },
  { id: 20, label: "Claim" },
  { id: 21, label: "Report" },
  { id: 22, label: "KPI" },
  { id: 23, label: "Notification" },
  { id: 24, label: "Task" },
];
 
const getUserId = (user) => {
  const raw = user?.userId ?? user?.userID ?? user?.id ?? null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};
 
export default function NewTaskPage() {
  const navigate = useNavigate();
  const user = getUserFromToken() || {};
  const role = String(user?.role || "").toUpperCase();
  const currentUserId = getUserId(user);
  const isDriver = role === DRIVER_ROLE;
 
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [form, setForm] = useState({
    assignedTo: isDriver ? String(currentUserId ?? "") : "",
    relatedEntityType: "",
    description: "",
    dueDate: "",
    status: "PENDING",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({});
 
  // Fetch all users on mount
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await axios.get("http://localhost:8080/cargoRoute/user/getAllUsers", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const list = Array.isArray(res.data) ? res.data : [];
        setUsers(list);
      } catch (err) {
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);
 
  const validation = useMemo(() => {
    const e = {};
    if (!form.assignedTo) e.assignedTo = "Assignee is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.dueDate) e.dueDate = "Due date is required";
    return e;
  }, [form]);
 
  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };
 
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Mark all fields as touched on submit
    setTouched({ assignedTo: true, description: true, dueDate: true, relatedEntityType: true, status: true });
    if (Object.keys(validation).length > 0) {
      setError("Please complete required fields.");
      return;
    }
 
    setSaving(true);
    try {
      const res = await createTask({
        assignedTo: Number(form.assignedTo),
        relatedEntityID: form.relatedEntityType === "" ? null : form.relatedEntityType,
        description: form.description,
        dueDate: form.dueDate,
        status: form.status,
      });
 
      const newId = res?.data?.taskID;
      if (newId) {
        navigate(`/tasks/${newId}`);
      } else {
        navigate("/tasks");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create task.");
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Layout>
      <div className="tasks-page">
        <div className="tasks-header">
          <button className="tasks-btn tasks-btn-back" onClick={() => navigate("/tasks")} title="Back" style={{color: '#111'}}>
            ←
          </button>
          <div>
            <h1 className="tasks-title">Add Task</h1>
            <p className="tasks-subtitle">Create a new task and assign ownership</p>
          </div>
        </div>
 
        {error && <div className="tasks-error">⚠ {error}</div>}
 
        <form id="task-form" className="tasks-form-card" onSubmit={onSubmit}>
          <div className="tasks-form-grid">
            <div className="tasks-form-field">
              <label>Assigned To *</label>
              <select
                value={form.assignedTo}
                onChange={(e) => onChange("assignedTo", e.target.value)}
                disabled={isDriver || loadingUsers}
              >
                <option value="">Select a user...</option>
                {users.map((u) => (
                  <option key={u.userID} value={String(u.userID)}>
                    {u.name || "Unknown"} - {u.role || "N/A"}
                  </option>
                ))}
              </select>
              <small>{touched.assignedTo && validation.assignedTo ? validation.assignedTo : " "}</small>
            </div>
 
            <div className="tasks-form-field">
              <label>Related Table</label>
              <select
                value={form.relatedEntityType}
                onChange={(e) => onChange("relatedEntityType", e.target.value)}
              >
                <option value="">Select a table...</option>
                {ENTITY_TYPES.map((et) => (
                  <option key={et.id} value={et.id}>
                    {et.label}
                  </option>
                ))}
              </select>
              <small> </small>
            </div>
 
            <div className="tasks-form-field tasks-form-field-full">
              <label>Description *</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => onChange("description", e.target.value)}
                placeholder="Describe the action item"
              />
              <small>{touched.description && validation.description ? validation.description : " "}</small>
            </div>
 
            <div className="tasks-form-field">
              <label>Due Date *</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => onChange("dueDate", e.target.value)}
              />
              <small>{touched.dueDate && validation.dueDate ? validation.dueDate : " "}</small>
            </div>
 
            <div className="tasks-form-field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => onChange("status", e.target.value)}>
                <option value="PENDING">Pending</option>
                <option value="INPROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <small> </small>
            </div>
          </div>
 
          <div className="tasks-form-actions">
       
            <button type="submit" className="tasks-btn tasks-btn-primary" title="Create Task" disabled={saving}>
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
 
 