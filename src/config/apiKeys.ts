/**
 * API Keys configuration file
 * All keys are loaded from environment variables for security
 */

// Google Maps API Key - loaded from environment
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Validate required API keys
if (!GOOGLE_MAPS_API_KEY && import.meta.env.PROD) {
  console.warn('⚠️ GOOGLE_MAPS_API_KEY not configured in production');
}

// Other API keys can be added here
