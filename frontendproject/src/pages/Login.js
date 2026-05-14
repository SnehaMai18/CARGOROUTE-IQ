import { useState, useContext } from "react";
import { loginUser } from "../api/authApi";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../utils/jwtUtils";
import "../styles/Auth.css";

// Map role → landing page
const ROLE_REDIRECT = {
  Admin:          '/dashboard',
  Dispatcher:     '/fleet/vehicles',
  FleetManager:   '/fleet/vehicles',
  Shipper:        '/bookings',
  Driver:         '/bookings',
  WarehouseManager: '/bookings',
  BillingClerk:   '/bookings',
  Analyst:        '/bookings',
};

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await loginUser(form);
      login(res.data.token);
      const user = getUserFromToken();
      
      // const redirect = ROLE_REDIRECT[user?.role] || '/dashboard';
      const redirect =  '/dashboard';
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <h1>CargoRoute IQ</h1>
        <p>
          Smart regional freight routing & load optimization platform.
        </p>
        <ul>
          <li>✔ Optimize routes</li>
          <li>✔ Reduce empty miles</li>
          <li>✔ Real‑time operations</li>
        </ul>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to continue</p>

          {/* Reserved error space - prevents layout shift */}
          <div className="error-container">
            {error && (
              <div className="auth-message auth-message-error">
                <span>⚠</span> {error}
              </div>
            )}
          </div>

          <input
            type="email"
            placeholder="Email address"
            required
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            required
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>

          <span className="link">
            New to CargoRoute? <a href="/signup">Create account</a>
          </span>
        </form>
      </div>
    </div>
  );
}
