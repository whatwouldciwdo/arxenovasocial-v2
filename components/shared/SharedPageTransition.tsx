import React from 'react';

// Barba remains the navigation and animation owner. This component only
// consolidates the persistent visual transition contract.
export default function SharedPageTransition() {
  return <div className="transition_screen" />;
}
