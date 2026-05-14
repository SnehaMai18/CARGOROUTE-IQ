/**
 * Standardized role constants used throughout the application
 */
export const ROLES = [
  "Admin",
  "Driver",
  "Shipper",
  "Dispatcher",
  "FleetManager",
  "BillingClerk",
  "WarehouseManager",
  "Analyst",
];

/**
 * Get normalized role (case-insensitive comparison)
 */
export const normalizeRole = (role) => {
  if (!role) return null;
  const normalized = String(role).trim();
  const found = ROLES.find(r => r.toLowerCase() === normalized.toLowerCase());
  return found || normalized;
};

/**
 * Role-based permissions mapping
 * Defines what each role can view, create, edit, etc.
 */
export const ROLE_PERMISSIONS = {
  Admin: {
    view: ['all'],
    create: ['all'],
    edit: ['all'],
    delete: ['all'],
    dashboard: 'admin'
  },
  Driver: {
    view: ['driver-portal', 'own-bookings', 'assigned-dispatch', 'manifest', 'handover', 'pod', 'assigned-vehicles'],
    create: ['driver-status-update', 'dispatch-acknowledge', 'pod-upload'],
    edit: ['own-driver-details'],
    delete: [],
    dashboard: 'driver'
  },
  Shipper: {
    view: ['own-bookings', 'pod-own-bookings', 'exceptions-own', 'claims-own'],
    create: ['bookings', 'exceptions', 'claims', 'import-bookings'],
    edit: [],
    delete: [],
    dashboard: 'shipper'
  },
  Dispatcher: {
    view: ['all-bookings', 'exceptions', 'claims', 'dispatch', 'driver-acknowledgements', 'manifest', 'handover', 'pod'],
    create: ['dispatch', 'edit-exception-status'],
    edit: ['booking-status', 'dispatch'],
    delete: [],
    dashboard: 'dispatcher'
  },
  FleetManager: {
    view: ['vehicles', 'drivers', 'routes', 'routing-rules', 'loads', 'dispatch', 'acknowledgements', 'manifest', 'handover', 'pod', 'all-bookings', 'exceptions', 'claims'],
    create: ['vehicles', 'routes', 'routing-rules', 'loads'],
    edit: ['vehicles', 'routes', 'routing-rules', 'loads'],
    delete: [],
    dashboard: 'fleet-manager'
  },
  BillingClerk: {
    view: ['billing', 'billing-lines', 'invoices', 'tariffs', 'dispatch', 'manifest', 'handover', 'pod', 'all-bookings', 'exceptions', 'claims'],
    create: [],
    edit: [],
    delete: [],
    dashboard: 'billing-clerk'
  },
  WarehouseManager: {
    view: ['dispatch', 'pod', 'all-bookings', 'exceptions', 'claims'],
    create: ['manifest', 'handover'],
    edit: ['manifest', 'handover'],
    delete: [],
    dashboard: 'warehouse-manager'
  },
  Analyst: {
    view: ['all'],
    create: [],
    edit: [],
    delete: [],
    dashboard: 'analyst'
  }
};

/**
 * Check if a role has permission for a specific action on a resource
 */
export const hasPermission = (role, action, resource) => {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  if (permissions[action]?.includes('all') || permissions[action]?.includes(resource)) return true;
  return false;
};
