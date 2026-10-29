import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

// Slim glass header for focused screens (quiz, score): back control, logo, title, one action on the right.
export default function FocusHeader({ title, backTo, onBack, backLabel = 'Go back', action }) {
  const backIcon = <span className="material-symbols-outlined text-[22px]" aria-hidden="true">arrow_back</span>;

  return (
    <header className="fixed top-0 inset-x-0 z-50 pt-safe">
      <div className="mx-auto max-w-3xl px-3 sm:px-5 pt-2">
        <div className="glass glass--strong h-14 px-3 flex items-center justify-between gap-space-sm !rounded-2xl">
          <div className="flex items-center gap-space-sm min-w-0">
            {backTo ? (
              <Link to={backTo} aria-label={backLabel} className="neu-icon neu-icon--round neu-icon--sm !w-10 !h-10">
                {backIcon}
              </Link>
            ) : (
              <button type="button" onClick={onBack} aria-label={backLabel} className="neu-icon neu-icon--round neu-icon--sm !w-10 !h-10">
                {backIcon}
              </button>
            )}
            <Logo size="sm" showName={false} className="sm:hidden" />
            <Logo size="sm" className="hidden sm:inline-flex" />
            <h1 className="font-headline-sm text-headline-sm text-primary tracking-tight truncate font-bold">{title}</h1>
          </div>
          {action}
        </div>
      </div>
    </header>
  );
}
