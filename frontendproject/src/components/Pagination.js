import React from 'react';
import '../styles/Pagination.css';

/**
 * Compact Pagination Component
 * - Minimal design with Previous and Next buttons
 * - Shows page information and is responsive on mobile
 * - Avoids horizontal scroll by wrapping when needed
 */
export default function Pagination({ currentPage, totalPages, onPageChange, infoText }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination pagination-bar">
      <div className="pagination-info">
        {infoText || `Page ${currentPage} of ${totalPages}`}
      </div>

      <div className="pagination-controls">
        <button
          className="page-btn"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ‹ Prev
        </button>

        <button
          className="page-btn"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

