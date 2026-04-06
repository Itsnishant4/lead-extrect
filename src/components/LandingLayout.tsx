'use client';

import React, { useState, useEffect } from 'react';
import { LandingHeader } from './LandingHeader';

interface LandingLayoutProps {
  banner?: React.ReactNode;
  children: React.ReactNode;
}

export function LandingLayout({ banner, children }: LandingLayoutProps) {
  const [hasBanner, setHasBanner] = useState(false);

  useEffect(() => {
    // Check if banner content is present (not null/undefined)
    setHasBanner(!!banner);
  }, [banner]);

  return (
    <>
      {banner}
      <LandingHeader hasBanner={hasBanner} />
      {children}
    </>
  );
}
