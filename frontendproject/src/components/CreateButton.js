import React from 'react';

/**
 * CreateButton Component
 * Consistent button for creating new items across the application.
 * Follows Fleet Registry pattern with tooltip and styling.
 */
export default function CreateButton({
  onClick,
  label = 'Create',
  tooltip = 'Create new item',
  disabled = false,
  className = '',
  showLabel = true,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-primary create-button ${className}`}
      title={tooltip}
      aria-label={tooltip}
    >
      <span className="plus-icon">+</span>
      {showLabel && <span className="button-label">{label}</span>}
    </button>
  );
}
