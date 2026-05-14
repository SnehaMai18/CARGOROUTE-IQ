import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../api/authApi";
import { USER_ROLES } from "../utils/constants";
import "../styles/Auth.css";

const SIGNUP_ROLES = USER_ROLES || [
  "Dispatcher",
  "Shipper",
  "Driver",
  "WarehouseManager",
  "BillingClerk",
  "FleetManager",
  "Analyst",
  "Admin"
];

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Dispatcher",
    password: "",
    confirmPassword: "",
    status: "ACTIVE"
  });

  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  /* ───────────── Validation (same standard as admin create user) ───────────── */

  const validateSignup = () => {
    const e = {};

    if (!form.name.trim()) {
      e.name = "Name is required";
    } else if (/\s{2,}/.test(form.name)) {
      e.name = "Avoid consecutive spaces";
    }

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = "Enter a valid email";
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      e.phone = "Phone must be exactly 10 digits";
    }

    if (!form.password) {
      e.password = "Password is required";
    } else if (form.password.length < 8) {
      e.password = "Minimum 8 characters required";
    }

    if (!form.confirmPassword) {
      e.confirmPassword = "Confirm your password";
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }

    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ───────────── Submit ───────────── */

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await signupUser(form);
      setMessage({
        type: "success",
        text: "Account created successfully! Redirecting to login…"
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Signup failed. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>CargoRoute IQ</h1>
        <p>Build smarter logistics operations.</p>
      </div>

      <div className="auth-right">
        <form className="auth-card" onSubmit={handleSignup} noValidate>
          <h2>Create Account</h2>
          <p className="subtitle">Get started with CargoRoute IQ</p>

          <input
            placeholder="Full Name"
            className={formErrors.name ? "input-error" : ""}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <small className="field-error">{formErrors.name || " "}</small>

          <input
            placeholder="Email Address"
            type="email"
            className={formErrors.email ? "input-error" : ""}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <small className="field-error">{formErrors.email || " "}</small>

          <input
            placeholder="Phone Number"
            className={formErrors.phone ? "input-error" : ""}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <small className="field-error">{formErrors.phone || " "}</small>

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {SIGNUP_ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <small className="field-error"> </small>

          <input
            type="password"
            placeholder="Create Password"
            className={formErrors.password ? "input-error" : ""}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <small className="field-error">{formErrors.password || " "}</small>

          <input
            type="password"
            placeholder="Confirm Password"
            className={formErrors.confirmPassword ? "input-error" : ""}
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
          />
          <small className="field-error">
            {formErrors.confirmPassword || " "}
          </small>

          {message.text && (
            <div className={`auth-message auth-message-${message.type}`}>
              <span>{message.type === "success" ? "✔" : "⚠"}</span>{" "}
              {message.text}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create"}
          </button>

          <span className="link">
            Already have an account? <a href="/login">Login</a>
          </span>
        </form>
      </div>
    </div>
  );
}