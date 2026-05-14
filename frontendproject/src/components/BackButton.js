import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * BackButton Component
 * Replaces Cancel buttons throughout the application.
 * Provides consistent navigation back to previous page.
 */
export default function BackButton({ to = -1, label = 'Back', className = '' }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (typeof to === 'number') {
      navigate(to);
    } else {
      navigate(to);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn-back ${className}`}
      aria-label={label}
    >
      ← {label}
    </button>
  );
}
