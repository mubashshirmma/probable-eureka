import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ subtitle = 'Home' }) {
  const location = useLocation();

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-margin flex items-center justify-between gap-space-sm max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-space-sm min-w-0 text-inherit no-underline">
          <img
            alt="StudySaathi AI Logo"
            className="h-8 w-auto object-contain flex-shrink-0"
            src="https://lh3.googleusercontent.com/aida/AEtjO1U5Hn00h2H0TL7BbCuRbZgZBFHrg8f0KkPf8JVr28GieRip7ub7II3vWQR36WFgGfUFTn8E8mGIE6EGxq57n1209T_CFsM9Nql89um3TW34cRO0lZEgKPRgudDCKPc1F1nwdj3wC7fiT9XMzMj-7MIb7dLXZIBu6u_MHqcxiWiPJYWqWZkQmpAqSXWOl4sH_GwcyfbsdnA6d0xdmfuqCwI-Xj6rqoQjXZFvQyBzl30r"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight truncate font-bold">
              StudySaathi
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant truncate uppercase tracking-wider">
              {subtitle}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-space-xs">
          <nav aria-label="Header Navigation" className="hidden sm:flex items-center gap-space-xs">
            <Link
              to="/"
              className={`px-space-sm py-space-xs font-label-md text-label-md transition-colors ${
                location.pathname === '/'
                  ? 'text-secondary font-semibold'
                  : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              Home
            </Link>
            <a
              href="#features"
              className="px-space-sm py-space-xs text-on-surface-variant hover:text-secondary font-label-md text-label-md transition-colors"
            >
              Features
            </a>
            <Link
              to="/dashboard"
              className={`px-space-sm py-space-xs font-label-md text-label-md transition-colors ${
                location.pathname === '/dashboard'
                  ? 'text-secondary font-semibold'
                  : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              Dashboard
            </Link>
          </nav>

          <Link
            to="/dashboard"
            aria-label="Profile"
            className="w-11 h-11 flex items-center justify-center p-space-xs rounded-full hover:bg-surface-container-high transition-colors"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2inaHLQ74OZ4KmS2GFjbOrl2klrGE1LfmOzm4urXFfYw2r7Xx4JPMQWDi-RQ47Am_fNw0tWQ-Orh1nHogbBpPOElTba-UyZ7msEAhghSOersCmpazTJaNHTOHgSa1jjEx2u2zahGZ353MgrVPEFmi6ToI4Z8yh-Tg6MHwfU_OmWvdHriNOpPkfq2G0XJQ1c3vd8zALslqJtzOwFPF8XCmkHSbAxXZ_-LEKAYn8Gwf"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}

