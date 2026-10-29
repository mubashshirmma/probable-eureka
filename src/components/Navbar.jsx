import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoMark from './LogoMark';

// Same destinations as the bottom bar, so desktop and mobile always agree.
export const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: 'home' },
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Create', path: '/create', icon: 'add_circle' },
  { label: 'Study', path: '/results', icon: 'menu_book' },
  { label: 'Quiz', path: '/quiz', icon: 'quiz' },
];

export default function Navbar({ subtitle = 'Home' }) {
  const location = useLocation();

  return (
    <header className="fixed top-0 inset-x-0 z-50 pt-safe">
      <div className="mx-auto max-w-7xl px-3 sm:px-5 pt-2">
        <div className="glass glass--strong h-14 sm:h-16 px-3 sm:px-4 flex items-center justify-between gap-space-sm !rounded-2xl">
          <Link to="/" className="flex items-center gap-space-sm min-w-0 text-inherit no-underline rounded-xl">
            <LogoMark className="h-9 w-9 flex-shrink-0" />
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight truncate font-bold">
                StudySaathi
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate uppercase tracking-wider">
                {subtitle}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-space-sm">
            {/* Desktop navigation. On phones the bottom bar does this job. */}
            <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="nav-item font-label-lg text-label-lg"
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link to="/dashboard" aria-label="Profile and dashboard" className="neu-icon neu-icon--round !w-11 !h-11 !p-0.5">
              <img
                alt=""
                className="w-full h-full rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2inaHLQ74OZ4KmS2GFjbOrl2klrGE1LfmOzm4urXFfYw2r7Xx4JPMQWDi-RQ47Am_fNw0tWQ-Orh1nHogbBpPOElTba-UyZ7msEAhghSOersCmpazTJaNHTOHgSa1jjEx2u2zahGZ353MgrVPEFmi6ToI4Z8yh-Tg6MHwfU_OmWvdHriNOpPkfq2G0XJQ1c3vd8zALslqJtzOwFPF8XCmkHSbAxXZ_-LEKAYn8Gwf"
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
