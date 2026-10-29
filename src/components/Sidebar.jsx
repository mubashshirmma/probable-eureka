import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: 'home' },
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Create Set', path: '/create', icon: 'add', isCta: true },
    { label: 'Study', path: '/results', icon: 'menu_book' },
    { label: 'Quiz', path: '/quiz', icon: 'quiz' },
  ];

  return (
    <nav
      aria-label="Primary Navigation"
      className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.04)]"
    >
      <div className="h-16 px-space-xs flex items-center justify-around max-w-xl mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path && !item.isCta;

          if (item.isCta) {
            return (
              <Link
                key={item.label}
                to={item.path}
                className="flex-1 flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-space-xs text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <div className="w-10 h-10 -mt-3 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-[0_4px_10px_rgba(0,81,213,0.3)] active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-[22px]">
                    {item.icon}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex-1 flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-space-xs transition-colors ${
                isActive
                  ? 'text-secondary font-medium'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {item.icon}
              </span>
              <span className="font-label-sm text-label-sm mt-space-xs">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

