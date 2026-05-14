import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { hasPermission } from '../constants/roles';

export default function PermissionGate({ action = 'view', resource, fallback = null, children }) {
  const { user } = useContext(AuthContext);
  const role = String(user?.role || '').trim();

  if (!role || !resource) {
    return fallback;
  }

  return hasPermission(role, action, resource) ? children : fallback;
}
