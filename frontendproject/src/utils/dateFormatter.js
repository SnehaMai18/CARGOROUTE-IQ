/**
 * Date formatting utilities for consistent timestamp display across the app
 */

/**
 * Format ISO timestamp to dashboard format (e.g., "May 06, 11:18 PM")
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} Formatted timestamp or "-" if invalid
 */
export const formatDashboardDateTime = (timestamp) => {
  if (!timestamp) return "-";
  
  try {
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    
    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    // Format: "May 06, 11:18 PM"
    const options = {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    return date.toLocaleString("en-US", options);
  } catch {
    return "-";
  }
};

/**
 * Format ISO timestamp to full datetime (e.g., "May 06, 2025, 11:18 PM")
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} Formatted timestamp or "-" if invalid
 */
export const formatFullDateTime = (timestamp) => {
  if (!timestamp) return "-";
  
  try {
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    
    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString();
  } catch {
    return "-";
  }
};

/**
 * Get initials from a user name for avatar display
 * @param {string} name - User name (e.g., "John Doe")
 * @returns {string} Initials (e.g., "JD")
 */
export const getInitials = (name) => {
  if (!name || typeof name !== "string") return "U";
  
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("")
    .substring(0, 2) || "U";
};
