"use client";

import { useUniversalTracking } from '@/hooks/useUniversalTracking';

export default function UniversalTracker() {
  useUniversalTracking();
  
  // This component doesn't render anything, it just handles tracking
  return null;
}