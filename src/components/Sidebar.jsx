import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './Navbar';

// Mobile bottom navigation. Hidden from tablet width up, where the header navigation takes over.
export default function Sidebar() {
  const location = useLocation();

  return (
    <nav
      aria-label="Primary Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 pb-safe pointer-events-none"
    >
      <div className="mx-auto max-w-xl px-3 pb-2">
        <div className="glass glass--strong pointer-events-auto h-[4.25rem] px-1.5 flex items-center justify-around !rounded-2xl">
          {NAV_ITEMS.map((item) => {
            const isCta = item.path === '/create';
            const isActive = location.pathname === item.path;

            if (isCta) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className="flex-1 flex flex-col items-center justify-center min-w-[44px] min-h-[44px] text-on-surface-variant"
                >
                  <span
                    className={`neu-btn neu-btn--primary -mt-6 w-12 h-12 rounded-full flex items-center justify-center ${
                      isActive ? 'ring-2 ring-white' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px]" aria-hidden="true">add</span>
                  </span>
                  <span className="font-label-sm text-label-sm mt-0.5 text-primary">Create</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] rounded-xl"
              >
                <span
                  className={`flex items-center justify-center w-11 h-8 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'neu-inset !rounded-full text-secondary'
                      : 'text-on-surface-variant'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[22px]"
                    aria-hidden="true"
                    style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 500" } : undefined}
                  >
                    {item.icon}
                  </span>
                </span>
                <span
                  className={`font-label-sm text-label-sm ${isActive ? 'text-secondary' : 'text-on-surface-variant'}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
