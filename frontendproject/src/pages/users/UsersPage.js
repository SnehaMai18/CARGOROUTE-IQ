import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../components/Layout";
import DashboardTemplate from "../../components/DashboardTemplate";
import Pagination1 from "../../components/Pagination1";
import axios from "axios";
import { ROLES } from "../../constants/roles";
import "../../styles/Users.css";

const PAGE_SIZE = 6;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");
  const [openActionsUserId, setOpenActionsUserId] = useState(null);
  const openUpRef = useRef({});
  const actionsRef = useRef(null);

  useEffect(() => {
  const handler = (e) => {
    if (actionsRef.current && !actionsRef.current.contains(e.target)) {
      setOpenActionsUserId(null);
    }
  };
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, []);

  const [newUser, setNewUser] = useState({
  name: "",
  email: "",
  phone: "",
  role: "Dispatcher",
  password: "",
  confirmPassword: "",
  status: "ACTIVE"
  });

  const [formErrors, setFormErrors] = useState({});

  /* ────────────────── API ────────────────── */

  const loadUsers = async () => {
    const res = await axios.get(
      "http://localhost:8081/cargoRoute/user/getAllUsers",
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    setUsers(res.data || []);
  };

  useEffect(() => {
    loadUsers();
  }, []);




  const validateNewUser = () => {
  const e = {};
  if (!newUser.name.trim()) e.name = "Name is required";
  if (/\s{2,}/.test(newUser.name)) e.name = "Avoid consecutive spaces";
  if (!newUser.email.trim()) e.email = "Email is required";
  if (!/^\S+@\S+\.\S+$/.test(newUser.email)) e.email = "Enter a valid email";
  if (!/^[0-9]{10}$/.test(newUser.phone)) e.phone = "Phone must be 10 digits";
  if (!newUser.password) e.password = "Password is required";
  if (newUser.password.length < 8) e.password = "Minimum 8 characters";
  if (newUser.password !== newUser.confirmPassword)
    e.confirmPassword = "Passwords do not match";

  setFormErrors(e);
  return Object.keys(e).length === 0;
};

  /* ────────────────── FILTERING ────────────────── */

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q);

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [users]);

  const getUserId = (user) => Number(user?.userID ?? user?.id ?? user?.userId) || 0;
  const sortedUsers = useMemo(() => [...filteredUsers].sort((a, b) => getUserId(b) - getUserId(a)), [filteredUsers]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE));

  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /* ────────────────── STATS ────────────────── */

  const stats = {
    total: users.length,
    active: users.filter((u) => String(u.status).toLowerCase() === "active").length,
    inactive: users.filter((u) => String(u.status).toLowerCase() === "inactive").length,
    admins: users.filter((u) => u.role === "Admin").length
  };

  const handleExport = () => {
    // TODO: implement export behavior
  };

  const handleCreateUser = async () => {
  if (!validateNewUser()) return;

  try {
    await axios.post(
      "http://localhost:8081/cargoRoute/auth/signup",
      newUser,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    setShowCreate(false);
    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "Dispatcher",
      password: "",
      confirmPassword: "",
      status: "ACTIVE"
    });
    setFormErrors({});
    loadUsers();
  } catch (err) {
    setError(err?.response?.data?.message || "Unable to create user.");
  }
};

  /* ────────────────── RENDER ────────────────── */

  return (
    <Layout>
      <DashboardTemplate
        title="User Management"
        subtitle="Manage users, roles, and access control"
        actionButtonLabel="+"
        onActionButtonClick={() => setShowCreate(true)}
        kpiCards={[
          { label: 'TOTAL USERS', value: stats.total },
          { label: 'ACTIVE', value: stats.active },
          { label: 'INACTIVE', value: stats.inactive },
          { label: 'ADMINS', value: stats.admins },
        ]}
        contentCardTitle="All Users"
        searchPlaceholder="Search by name, email or role..."
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        filters={[
          {
            label: 'Role',
            value: roleFilter,
            options: [
              { label: 'All Roles', value: 'ALL' },
              ...ROLES.map((r) => ({ label: r, value: r })),
            ],
            onChange: (e) => setRoleFilter(e.target.value),
          },
        ]}
        exportButtonLabel="Export"
        onExport={handleExport}
        error={error}
      >
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No users found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.userID}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge role-${u.role}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${String(u.status).toLowerCase()}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>{u.phone}</td>
                    <td className="actions-cell" onClick={(e) => e.stopPropagation()} ref={openActionsUserId === u.userID ? actionsRef : null}>
                      <div className="kebab-menu-wrapper">
                        <button
                          className={`kebab-trigger ${openActionsUserId === u.userID ? 'active' : ''}`}
                          onClick={(e) => {
                            if (openActionsUserId === u.userID) {
                              setOpenActionsUserId(null);
                              return;
                            }
                            
                            // Calculate position immediately
                            const rect = e.target.closest('.kebab-menu-wrapper').getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const spaceAbove = rect.top;
                            const dropdownHeight = 50; // approximate height
                            const shouldOpenUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
                            
                            openUpRef.current[u.userID] = shouldOpenUp;
                            setOpenActionsUserId(u.userID);
                          }}
                          title="Actions"
                          type="button"
                        >
                          ...
                        </button>
                        {openActionsUserId === u.userID && (
                          <div className={`kebab-dropdown-card ${openUpRef.current[u.userID] ? 'open-up' : ''}`}>
                            <button
                              className="kebab-item"
                              onClick={() => {
                                setSelectedUser(u);
                                setOpenActionsUserId(null);
                              }}
                              type="button"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="table-pagination">
              <Pagination1
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                infoText={`Page ${currentPage} of ${totalPages}`}
              />
            </div>
          )}
        </div>
      </DashboardTemplate>

      {/* ── EDIT USER MODAL (unchanged) ── */}
        {selectedUser && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-header">
              <h3>Edit User</h3>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>
                ✕
              </button>
              </div>

              <label>Email</label>
              <input value={selectedUser.email} disabled />

              <label>Role</label>
              <select
                value={selectedUser.role}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
              >
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>

              <label>Status</label>
              <select
                value={selectedUser.status}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, status: e.target.value })
                }
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              <div className="modal-actions">
                <button
                  className="primary"
                  onClick={async () => {
                    await axios.put(
                      `http://localhost:8081/cargoRoute/user/${selectedUser.userID}`,
                      { role: selectedUser.role, status: selectedUser.status },
                      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                    );
                    setSelectedUser(null);
                    loadUsers();
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE USER MODAL (unchanged) ── */}
        {showCreate && (
  <div className="modal-backdrop">
    <div className="modal-card modal-card-create">
      <div className="modal-header">
        <h3>Create New User</h3>
        <button className="modal-close" onClick={() => setShowCreate(false)}>
          ✕
        </button>
      </div>

      <div className="form-grid-2">
        <div className="form-field">
          <label>Name</label>
          <input
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <small className="field-error">{formErrors.name || " "}</small>
        </div>

        <div className="form-field">
          <label>Email</label>
          <input
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <small className="field-error">{formErrors.email || " "}</small>
        </div>

        <div className="form-field">
          <label>Phone</label>
          <input
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
          />
          <small className="field-error">{formErrors.phone || " "}</small>
        </div>

        <div className="form-field">
          <label>Role</label>
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Password</label>
          <input
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <small className="field-error">{formErrors.password || " "}</small>
        </div>

        <div className="form-field">
          <label>Confirm Password</label>
          <input
            type="password"
            value={newUser.confirmPassword}
            onChange={(e) =>
              setNewUser({ ...newUser, confirmPassword: e.target.value })
            }
          />
          <small className="field-error">
            {formErrors.confirmPassword || " "}
          </small>
        </div>
      </div>

      <div className="modal-actions">
        <button
          onClick={() => {
            setNewUser({
              name: "",
              email: "",
              phone: "",
              role: "Dispatcher",
              password: "",
              confirmPassword: "",
              status: "ACTIVE"
            });
            setFormErrors({});
          }}
        >
          Reset
        </button>

        <button className="primary" onClick={handleCreateUser}>
          Create
        </button>
      </div>
    </div>
  </div>
)}
    </Layout>
  );
}
