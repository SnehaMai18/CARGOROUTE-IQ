import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>CargoRoute IQ</h1>
        <p>Access Control System</p>
      </div>

      <div className="auth-right">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <h2>Access Denied</h2>
          <p className="subtitle">
            You do not have permission to access this page.
          </p>

          <button onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}
