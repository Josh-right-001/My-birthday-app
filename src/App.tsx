/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { OnboardingFlow } from './components/OnboardingFlow';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  // Simple, robust hash-based routing that doesn't trigger blank frames
  const [isAdminRoute, setIsAdminRoute] = useState(
    window.location.hash === '#admin' || window.location.hash === '#/admin'
  );

  useEffect(() => {
    const handleHashChange = () => {
      const isHashMatch = window.location.hash === '#admin' || window.location.hash === '#/admin';
      setIsAdminRoute(isHashMatch);
      
      // Auto-scrolling to top on route shift to preserve elegant experience
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <>
      {isAdminRoute ? (
        <AdminDashboard />
      ) : (
        <OnboardingFlow />
      )}
    </>
  );
}
