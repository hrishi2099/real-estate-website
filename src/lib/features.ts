// Feature flags for controlling feature rollouts
export const FEATURE_FLAGS = {
  // Google Earth Integration
  GOOGLE_EARTH_ENABLED: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_EARTH === 'true',

  // KML File Upload
  KML_UPLOAD_ENABLED: process.env.NEXT_PUBLIC_ENABLE_KML_UPLOAD === 'true',

  // Future features can be added here
  // ADVANCED_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
} as const;

// Helper function to check if a feature is enabled
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature];
}

// Development helper - shows all feature flags status
export function getFeatureStatus() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 Feature Flags Status:', FEATURE_FLAGS);
  }
  return FEATURE_FLAGS;
}