import React from 'react';
import PropTypes from 'prop-types';
import './Pagination1.css';

const Pagination1 = ({ currentPage, totalPages, onPageChange, infoText }) => {
  if (totalPages <= 0) return null;

  return (
    <div className="pagination1-container">
      <div className="pagination1-info">{infoText || `Page ${currentPage} of ${totalPages}`}</div>

      <div className="pagination1-controls">
        <button
          className="pagination1-nav"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          type="button"
        >
          ◀ Prev
        </button>

        {currentPage > 1 && <span className="pagination1-ellipsis">...</span>}

        <button className="pagination1-button active" type="button">
          {currentPage}
        </button>

        {currentPage < totalPages && <span className="pagination1-ellipsis">...</span>}

        <button
          className="pagination1-nav"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          type="button"
        >
          Next ▶
        </button>
      </div>
    </div>
  );
};

Pagination1.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  infoText: PropTypes.string,
};

export default Pagination1;