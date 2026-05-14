/**
 * Shared UI constants
 * --------------------
 * Single source of truth for all static data across the app.
 * Import from here instead of duplicating across pages.
 */

// ── Sites ─────────────────────────────────────────────────────────────────────

/** Array used in dropdowns (NewBooking) */
export const SITES = [
  { id: 1, name: 'Mumbai Warehouse' },
  { id: 2, name: 'Delhi Distribution Center' },
  { id: 3, name: 'Bengaluru Depot' },
  { id: 4, name: 'Chennai Hub' },
  { id: 5, name: 'Hyderabad Facility' },
  { id: 6, name: 'Kolkata Depot' },
  { id: 7, name: 'Pune Terminal' },
  { id: 8, name: 'Ahmedabad Crossdock' },
];

/** Map used to look up a name by numeric ID (BookingsList, BookingDetail) */
export const SITE_MAP = Object.fromEntries(SITES.map((s) => [s.id, s.name]));

/** Helper: resolve a site name from a numeric ID */
export const siteName = (id) => SITE_MAP[id] || `Site #${id}`;

// ── Special Handling Flags ────────────────────────────────────────────────────

export const HANDLING_FLAGS = [
  { key: 'FRAGILE',                label: 'Fragile' },
  { key: 'HEAVY',                  label: 'Heavy' },
  { key: 'HAZMAT',                 label: 'Hazmat' },
  { key: 'TEMPERATURE_CONTROLLED', label: 'Temperature Controlled' },
  { key: 'HIGH_VALUE',             label: 'High Value' },
];

// ── Booking Status Display Config ─────────────────────────────────────────────

export const STATUS_CONFIG = {
  SUBMITTED:  { label: 'Submitted',  cls: 'status-submitted'  },
  PLANNED:    { label: 'Planned',    cls: 'status-planned'    },
  DISPATCHED: { label: 'Dispatched', cls: 'status-dispatched' },
  IN_TRANSIT: { label: 'In Transit', cls: 'status-in-transit' },
  DELIVERED:  { label: 'Delivered',  cls: 'status-delivered'  },
  CANCELLED:  { label: 'Cancelled',  cls: 'status-cancelled'  },
};

// ── Shipper Status Display Config ─────────────────────────────────────────────

export const SHIPPER_STATUS_CONFIG = {
  ACTIVE:    { label: 'Active',    cls: 'status-created'   },
  INACTIVE:  { label: 'Inactive',  cls: 'status-pending'   },
  SUSPENDED: { label: 'Suspended', cls: 'status-cancelled' },
};

// ── User Roles ────────────────────────────────────────────────────────────────

/** Ordered list used in the Signup role dropdown */
export const USER_ROLES = [
  'Dispatcher',
  'Shipper',
  'Driver',
  'WarehouseManager',
  'BillingClerk',
  'FleetManager',
  'Analyst',
  'Admin',
];

// ── Exception Type Display Config ─────────────────────────────────────────────

export const EXCEPTION_TYPE_CONFIG = {
  DELAY:   { label: 'Delay',   cls: 'status-dispatched' },
  DAMAGE:  { label: 'Damage',  cls: 'status-cancelled'  },
  MISSING: { label: 'Missing', cls: 'status-pending'    },
};

// ── Exception Status Display Config ──────────────────────────────────────────

export const EXCEPTION_STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   cls: 'status-submitted' },
  IN_REVIEW: { label: 'In Review', cls: 'status-planned'   },
  RESOLVED:  { label: 'Resolved',  cls: 'status-delivered' },
  REJECTED:  { label: 'Rejected',  cls: 'status-cancelled' },
};

// ── Claim Status Display Config ───────────────────────────────────────────────

export const CLAIM_STATUS_CONFIG = {
  OPEN:         { label: 'Open',         cls: 'status-submitted' },
  UNDER_REVIEW: { label: 'Under Review', cls: 'status-planned'   },
  SETTLED:      { label: 'Settled',      cls: 'status-delivered' },
  DENIED:       { label: 'Denied',       cls: 'status-cancelled' },
  CANCELLED:    { label: 'Cancelled',    cls: 'status-pending'   },
};

// ── Dispatch Status Display Config ───────────────────────────────────────────

export const DISPATCH_STATUS_CONFIG = {
  CREATED:      { label: 'Created',      cls: 'status-created'    },
  PENDING:      { label: 'Pending',      cls: 'status-submitted'  },
  ASSIGNED:     { label: 'Assigned',     cls: 'status-planned'    },
  ACKNOWLEDGED: { label: 'Acknowledged', cls: 'status-dispatched' },
  IN_PROGRESS:  { label: 'In Progress',  cls: 'status-in-transit' },
  REASSIGNED:   { label: 'Reassigned',   cls: 'status-pending'    },
  COMPLETED:    { label: 'Completed',    cls: 'status-delivered'  },
  CANCELLED:    { label: 'Cancelled',    cls: 'status-cancelled'  },
};

// ── Driver Status Display Config ──────────────────────────────────────────────
export const DRIVER_STATUS_CONFIG = {
  AVAILABLE:   { label: 'Available',   cls: 'status-created'   },
  ASSIGNED:    { label: 'Assigned',    cls: 'status-planned'   },
  ON_ROUTE:    { label: 'On Route',    cls: 'status-in-transit'},
  UNAVAILABLE: { label: 'Unavailable', cls: 'status-pending'   },
  SUSPENDED:   { label: 'Suspended',   cls: 'status-cancelled' },
};

// ── Vehicle Type Config ───────────────────────────────────────────────────────

export const VEHICLE_TYPE_CONFIG = {
  VAN:     { label: 'Van'     },
  TRUCK:   { label: 'Truck'   },
  TRAILER: { label: 'Trailer' },
};

// ── Manifest / POD / Handover Configs ────────────────────────────────────────

export const POD_STATUS_CONFIG = {
  PENDING:  { label: 'Pending',  cls: 'status-submitted'  },
  UPLOADED: { label: 'Uploaded', cls: 'status-planned'    },
  VERIFIED: { label: 'Verified', cls: 'status-delivered'  },
  REJECTED: { label: 'Rejected', cls: 'status-cancelled'  },
};

export const POD_TYPE_CONFIG = {
  Photo:     { label: 'Photo'     },
  Signature: { label: 'Signature' },
};

// ── Role Redirect ─────────────────────────────────────────────────────────────

/** Map role → landing page after login */
export const ROLE_REDIRECT = {
  // Admin should land on bookings list (view all bookings)
  Admin:            '/bookings',
  Dispatcher:       '/bookings',
  Shipper:          '/bookings',
  FleetManager:     '/bookings',
  Driver:           '/bookings',
  WarehouseManager: '/bookings',
  BillingClerk:     '/bookings',
  Analyst:          '/bookings',
};
