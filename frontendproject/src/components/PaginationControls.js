import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  totalItems = 0,
  className = '',
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) pages.push(1);
    if (start > 2) pages.push('...');

    for (let i = Math.max(1, start); i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push('...');
    if (end < totalPages) pages.push(totalPages);

    return pages;
  };

  return (
    <div className={`flex items-center justify-between px-4 py-3 sm:px-6 ${className}`}>
      {/* Mobile View */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Showing page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalPages}</span>
            {totalItems > 0 && (
              <> (<span className="font-medium text-gray-900">{totalItems}</span> total results)</>
            )}
          </p>
        </div>

        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm bg-white" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {getPageNumbers().map((page, idx) => (
              <button
                key={`${page}-${idx}`}
                disabled={page === '...' || page === currentPage}
                onClick={() => page !== '...' && onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 
                  ${page === currentPage 
                    ? 'z-10 bg-[#370a6e] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#370a6e]' 
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                  } 
                  ${page === '...' ? 'cursor-default ring-1 ring-inset ring-gray-300' : ''}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}