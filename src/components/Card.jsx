import React from 'react';

// Glass is the card surface. Variants change the tint, never the style language.
const VARIANTS = {
  lowest: 'glass',
  low: 'glass glass--soft',
  container: 'glass glass--soft',
  high: 'glass glass--soft',
  primary: 'glass glass--accent',
};

export default function Card({
  children,
  className = '',
  variant = 'lowest',
  hover = false,
  onClick,
  onKeyDown,
  ...props
}) {
  // A clickable card is a button for keyboard and screen-reader users.
  const interactive = typeof onClick === 'function';
  const handleKeyDown = (event) => {
    onKeyDown?.(event);
    if (interactive && !event.defaultPrevented && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(event);
    }
  };

  return (
    <div
      className={`p-5 ${VARIANTS[variant] || VARIANTS.lowest} ${
        hover || interactive ? 'glass-lift cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
      onKeyDown={interactive ? handleKeyDown : onKeyDown}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
