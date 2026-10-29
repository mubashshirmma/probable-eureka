import React from 'react';
import { Link } from 'react-router-dom';

export default function Button({
  children,
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  iconRight,
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all select-none';

  const variants = {
    primary:
      'bg-secondary hover:bg-secondary-container text-on-secondary shadow-md active:scale-[0.98]',
    secondary:
      'bg-surface-container hover:bg-surface-container-high text-primary shadow-sm active:scale-[0.98]',
    subtle:
      'bg-surface-container-low hover:bg-surface-container text-primary active:scale-[0.98]',
    dark:
      'bg-primary hover:bg-primary-container text-on-primary shadow-md active:scale-[0.98]',
    outline:
      'border border-outline/20 text-primary hover:bg-surface-container-low active:scale-[0.98]',
    ghost:
      'text-on-surface-variant hover:text-primary hover:bg-surface-container-high active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-label-md rounded-lg gap-1.5 min-h-[36px]',
    md: 'px-4 py-2.5 text-label-lg rounded-lg gap-2 min-h-[42px]',
    lg: 'px-6 py-4 text-title-md rounded-xl gap-2.5 min-h-[50px]',
  };

  const combinedClasses = `${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
  } ${className}`;

  const content = (
    <>
      {icon && (
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      )}
      {children}
      {iconRight && (
        <span className="material-symbols-outlined text-[20px]">{iconRight}</span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedClasses} onClick={onClick} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {content}
    </button>
  );
}

