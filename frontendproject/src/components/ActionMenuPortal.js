import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './ActionMenuPortal.css';

/**
 * ActionMenuPortal - A portal-based action menu component
 * 
 * Features:
 * - Uses React Portal to render at document.body level, avoiding overflow issues
 * - Calculates position using getBoundingClientRect() for accurate viewport placement
 * - Fixed positioning to prevent layout impacts
 * - Smart viewport awareness to prevent menu from going off-screen
 * - Consistent styling with FleetRegistry menu
 */
const ActionMenuPortal = React.forwardRef(
  ({ id, actions, ariaLabel = 'Actions', className = '' }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    const calculateMenuPosition = () => {
      if (!triggerRef.current) return { top: 0, left: 0 };

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const padding = 10;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const menuRect = menuRef.current?.getBoundingClientRect();
      const menuHeight = menuRect?.height || 150;
      const menuWidth = menuRect?.width || 140;

      let top = triggerRect.bottom + padding;
      let left = triggerRect.right - menuWidth;

      if (top + menuHeight > viewportHeight && triggerRect.top - menuHeight - padding > 0) {
        top = triggerRect.top - menuHeight - padding;
      }

      if (left + menuWidth > viewportWidth - padding) {
        left = viewportWidth - menuWidth - padding;
      }

      if (left < padding) {
        left = padding;
      }

      return { top, left };
    };

    // Close menu when clicking outside
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (e) => {
        // Don't close if clicking on the trigger button itself or inside the menu
        if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
        setIsOpen(false);
      };

      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    // Update menu position when it opens, on scroll, or on resize
    useEffect(() => {
      if (!isOpen || !triggerRef.current) return;

      const calculatePosition = () => {
        setMenuPosition(calculateMenuPosition());
      };

      calculatePosition();

      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);

      return () => {
        window.removeEventListener('scroll', calculatePosition, true);
        window.removeEventListener('resize', calculatePosition);
      };
    }, [isOpen, actions]);

    const handleToggle = (e) => {
      e.stopPropagation();
      if (!isOpen) {
        setMenuPosition(calculateMenuPosition());
      }
      setIsOpen((current) => !current);
    };

    const handleActionClick = (e, action) => {
      e.stopPropagation();
      setIsOpen(false);
      action.onClick();
    };

    const menuContent = isOpen && (
      <div
        ref={menuRef}
        className="kebab-dropdown-card portal-menu"
        style={{
          position: 'fixed',
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
          zIndex: 10000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {actions.map((action, index) => (
          <button
            key={action.key || action.label || index}
            type="button"
            className={action.danger ? 'delete-item' : ''}
            onClick={(e) => handleActionClick(e, action)}
          >
            {action.label}
          </button>
        ))}
      </div>
    );

    const portalContainer = typeof document !== 'undefined' ? document.body : null;

    return (
      <>
        <div
          className={`kebab-menu-wrapper ${className}`}
          ref={ref}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            ref={triggerRef}
            type="button"
            className={`kebab-trigger ${isOpen ? 'active' : ''}`}
            onClick={handleToggle}
            aria-label={ariaLabel}
            id={id}
          >
            …
          </button>
        </div>

        {/* Portal renders menu at document.body level */}
        {portalContainer && ReactDOM.createPortal(menuContent, portalContainer)}
      </>
    );
  }
);

ActionMenuPortal.displayName = 'ActionMenuPortal';
export default ActionMenuPortal;
