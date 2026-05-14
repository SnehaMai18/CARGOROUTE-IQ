import React, { useEffect, useRef } from 'react';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import './ConfirmModal.css';

/**
 * Accessible confirmation modal for delete and edit actions.
 *
 * Props:
 *   isOpen       {boolean}  - whether the modal is visible
 *   type         {string}   - 'delete' | 'edit'
 *   title        {string}   - modal heading (optional, falls back to defaults)
 *   message      {string}   - body text (optional, falls back to defaults)
 *   confirmLabel {string}   - override confirm button label
 *   cancelLabel  {string}   - override cancel button label (default: "Cancel")
 *   onConfirm    {function} - called when confirm button is clicked
 *   onCancel     {function} - called when cancel / ESC / backdrop is clicked
 */
export default function ConfirmModal({
  isOpen,
  type = 'delete',
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  const modalRef = useRef(null);
  const confirmBtnRef = useRef(null);

  /* ── Keyboard handling: ESC to close + focus trap ── */
  useEffect(() => {
    if (!isOpen) return;

    // Auto-focus confirm button for quick keyboard access
    const t = setTimeout(() => confirmBtnRef.current?.focus(), 60);

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDelete = type === 'delete';
  const defaultTitle   = isDelete ? 'Confirm Delete' : 'Confirm Edit';
  const defaultMessage = isDelete
    ? 'Are you sure you want to delete this item? This action cannot be undone.'
    : 'Do you want to save changes to this item?';
  const defaultConfirmLabel = isDelete ? 'Delete' : 'Save Changes';

  return (
    <div
      className="confirm-modal-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="confirm-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={`confirm-modal-icon ${isDelete ? 'icon-delete' : 'icon-edit'}`}>
          {isDelete ? <FiTrash2 size={26} /> : <FiEdit2 size={24} />}
        </div>

        {/* Heading */}
        <h2 id="confirm-modal-title" className="confirm-modal-title">
          {title || defaultTitle}
        </h2>

        {/* Body */}
        <p className="confirm-modal-message">
          {message || defaultMessage}
        </p>

        {/* Buttons */}
        <div className="confirm-modal-actions">
          <button className="confirm-modal-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            className={`confirm-modal-confirm ${isDelete ? 'confirm-btn-delete' : 'confirm-btn-edit'}`}
            onClick={onConfirm}
          >
            {confirmLabel || defaultConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
