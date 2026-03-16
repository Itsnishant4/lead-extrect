'use client';

import { useEffect, useCallback, useRef } from 'react';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAutomation } from '@/context/AutomationContext';

const TOUR_STEPS: DriveStep[] = [
  {
    popover: {
      title: 'Welcome to LeadSpotter!',
      description: 'Let\'s take a quick tour to help you get started extracting leads from Google Maps.',
    },
  },
  {
    element: '#tour-nav-search',
    popover: {
      title: 'Search',
      description: 'Search for any business type in any location. Results appear instantly with contact details, ratings, and more.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-nav-bulk',
    popover: {
      title: 'Bulk Extraction',
      description: 'Upload a list of keywords to extract leads in bulk. Paste them or import from a file.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-nav-campaigns',
    popover: {
      title: 'Campaigns',
      description: 'Track all your extraction tasks. Monitor progress, pause, resume, or retry failed campaigns.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-nav-dashboard',
    popover: {
      title: 'Dashboard',
      description: 'View your extraction analytics, credit usage, top categories, and recent activity at a glance.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-profile',
    popover: {
      title: 'Your Account',
      description: 'Access your profile, subscription & billing, notifications, and settings from here.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    popover: {
      title: 'You\'re all set!',
      description: 'Start by searching for a business type like "restaurants in New York". You can replay this tour anytime from Settings.',
    },
  },
];

// Steps without the dashboard tab (for logoDashboard navStyle)
const TOUR_STEPS_NO_DASHBOARD = TOUR_STEPS.filter(
  (step) => step.element !== '#tour-nav-dashboard'
);

const ONBOARDING_KEY = 'onboardingCompleted';

export function useOnboarding() {
  const { settings, updateSetting } = useAutomation();
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  const isCompleted = !!settings[ONBOARDING_KEY];

  const startTour = useCallback((force = false) => {
    // Check if the tour-nav elements exist (we're on a page with DashboardHeader)
    const navEl = document.getElementById('tour-nav');
    if (!navEl) return;

    // Determine which steps to use based on whether dashboard tab exists
    const hasDashboardTab = !!document.getElementById('tour-nav-dashboard');
    const steps = hasDashboardTab ? TOUR_STEPS : TOUR_STEPS_NO_DASHBOARD;

    const driverInstance = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 0, 0.55)',
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: 'leadspotter-tour',
      steps,
      onDestroyStarted: () => {
        if (!force) {
          updateSetting(ONBOARDING_KEY, true);
        }
        driverInstance.destroy();
      },
    });

    driverRef.current = driverInstance;

    // Small delay to ensure DOM is settled
    setTimeout(() => {
      driverInstance.drive();
    }, 500);
  }, [updateSetting]);

  const replayTour = useCallback(() => {
    startTour(true);
  }, [startTour]);

  // Auto-start on first visit
  useEffect(() => {
    if (!isCompleted) {
      // Delay to let the page render fully
      const timer = setTimeout(() => {
        startTour(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, startTour]);

  return { isCompleted, startTour, replayTour };
}
