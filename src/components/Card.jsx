import React from 'react';

export default function Card({
  children,
  className = '',
  variant = 'lowest',
  hover = false,
  onClick,
  ...props
}) {
  const variants = {
    lowest: 'bg-surface-container-lowest text-on-surface shadow-sm',
    low: 'bg-surface-container-low text-on-surface shadow-sm',
    container: 'bg-surface-container text-on-surface shadow-sm',
    high: 'bg-surface-container-high text-on-surface',
    primary: 'bg-primary text-on-primary shadow-md',
  };

  const hoverClass = hover
    ? 'transition-all hover:shadow-md cursor-pointer active:scale-[0.99]'
    : '';

  return (
    <div
      className={`rounded-xl p-5 ${variants[variant] || variants.lowest} ${hoverClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

