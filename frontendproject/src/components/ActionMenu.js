import React, { useState } from 'react';

const ActionMenu = React.forwardRef(({ id, actions, ariaLabel = 'Actions' }, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    setIsOpen(false);
    action.onClick();
  };

  return (
    <div className="kebab-menu-wrapper" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className={`kebab-trigger ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label={ariaLabel}
      >
        …
      </button>

      {isOpen && (
        <div className="kebab-dropdown-card">
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
      )}
    </div>
  );
});

ActionMenu.displayName = 'ActionMenu';
export default ActionMenu;
