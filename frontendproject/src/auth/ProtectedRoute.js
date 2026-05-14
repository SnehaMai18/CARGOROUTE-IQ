import { Navigate } from "react-router-dom";
import { getUserFromToken } from "../utils/jwtUtils";
import { hasPermission } from "../constants/roles";

/**
 * ProtectedRoute
 *  - role  : single string  (legacy)
 *  - roles : array of strings  (preferred, allows multiple roles)
 *  - permission : action name for modular permission checks
 *  - resource : resource key for permission checks
 * If neither is supplied, only authentication is checked.
 */
export default function ProtectedRoute({ children, role, roles, permission, resource }) {
  const user = getUserFromToken();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const allowed = roles ?? (role ? [role] : null);
  const hasRole = (value, current) =>
    String(value || '').trim().toLowerCase() === String(current || '').trim().toLowerCase();

  if (allowed && !allowed.some((r) => hasRole(r, user.role))) {
    return <Navigate to="/unauthorized" />;
  }

  if (permission && resource && !hasPermission(user.role, permission, resource)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
