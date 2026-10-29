import React from 'react';

// Soft blurred colour orbs behind every page. Purely decorative.
export default function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <span className="orb-1" />
      <span className="orb-2" />
      <span className="orb-3" />
    </div>
  );
}
