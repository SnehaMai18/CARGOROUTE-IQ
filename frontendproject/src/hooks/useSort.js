import { useState, useCallback } from 'react';

export default function useSort(initialDirection = 'none') {
  const [direction, setDirection] = useState(initialDirection);

  const toggle = useCallback(() => {
    setDirection((current) => {
      if (current === 'none' || current === 'desc') return 'asc';
      return 'desc';
    });
  }, []);

  const icon = direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕';

  return {
    direction,
    toggle,
    icon,
  };
}
