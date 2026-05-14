import { jwtDecode } from "jwt-decode";
 
export const getToken = () => localStorage.getItem("token");
 
export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
 
  try {
    const decoded = jwtDecode(token);
    // Backend puts email in 'sub' and role name in 'role'
    // Normalize role value so frontend comparisons match canonical names
    const rawRole = decoded.role || '';
    const compact = rawRole.replace(/^ROLE_/i, '').replace(/_/g, '').toLowerCase();
    const canonicalMap = {
      dispatcher: 'Dispatcher',
      shipper: 'Shipper',
      driver: 'Driver',
      warehousemanager: 'WarehouseManager',
      billingclerk: 'BillingClerk',
      fleetmanager: 'FleetManager',
      analyst: 'Analyst',
      admin: 'Admin'
    };
    const role = canonicalMap[compact] || decoded.role;
 
    // Extract userId/driverId from token (used for Driver acknowledgements and other role-based features)
    // Try multiple possible field names that backends might use - prioritize numeric IDs
    let userId = null;
    if (decoded.userId && !isNaN(decoded.userId)) userId = decoded.userId;
    else if (decoded.id && !isNaN(decoded.id)) userId = decoded.id;
    else if (decoded.driverId && !isNaN(decoded.driverId)) userId = decoded.driverId;
   
    // Extract shipperID from token (used for Shipper role to filter bookings)
    let shipperID = null;
    if (decoded.shipperID && !isNaN(decoded.shipperID)) shipperID = decoded.shipperID;
    else if (decoded.shipper_id && !isNaN(decoded.shipper_id)) shipperID = decoded.shipper_id;
   
    // Debug log to help troubleshoot
    if ((!userId && decoded.role?.toLowerCase().includes('driver')) || (!shipperID && decoded.role?.toLowerCase().includes('shipper'))) {
      console.debug('JWT Token Contents:', {
        allFields: Object.keys(decoded),
        decoded: decoded
      });
    }
 
    return {
      ...decoded,
      role,
      email: decoded.sub,
      userId, // User/Driver ID for role-based filtering (numeric)
      shipperID, // Shipper ID for role-based filtering (numeric)
      // Derive a display name from the email (part before @)
      name: decoded.name || decoded.sub?.split('@')[0] || 'User',
    };
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
};
 
export const logout = () => {
  localStorage.removeItem("token");
};
 