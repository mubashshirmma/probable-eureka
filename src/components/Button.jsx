import React from 'react';
import { Link } from 'react-router-dom';

const VARIANTS = {
  primary: 'neu-btn--primary',
  secondary: '',
  subtle: 'neu-btn--subtle',
  dark: 'neu-btn--dark',
  outline: 'neu-btn--outline',
  ghost: 'neu-btn--ghost',
};

const SIZES = {
  sm: 'px-3.5 py-1.5 text-label-md rounded-lg gap-1.5 min-h-[40px]',
  md: 'px-5 py-2.5 text-label-lg rounded-xl gap-2 min-h-[44px]',
  lg: 'px-5 sm:px-6 py-3.5 text-title-md rounded-xl gap-2.5 min-h-[52px]',
};

export default function Button({
  children,
  to,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  iconRight,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  ...props
}) {
  const isDisabled = disabled || loading;
  const classes = [
    'neu-btn inline-flex items-center justify-center select-none whitespace-nowrap',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] || SIZES.md,
    loading ? 'is-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading ? (
        <span className="spinner" aria-hidden="true" />
      ) : (
        icon && <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{icon}</span>
      )}
      {children}
      {iconRight && !loading && (
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{iconRight}</span>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick} {...props}>
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        onClick={isDisabled ? (e) => e.preventDefault() : onClick}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </button>
  );
}
