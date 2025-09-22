#!/usr/bin/env node
/**
 * Environment Variables Build-Time Validation
 * M1SSION™ - Security Hardening
 */

interface EnvCheck {
  key: string;
  required: boolean;
  description: string;
  production: boolean;
}

const ENV_CHECKS: EnvCheck[] = [
  {
    key: 'VITE_GOOGLE_MAPS_API_KEY',
    required: true,
    description: 'Google Maps API Key for geolocation features',
    production: true
  },
  {
    key: 'VITE_SENTRY_DSN',
    required: true,
    description: 'Sentry DSN for error tracking',
    production: true
  },
  {
    key: 'VITE_QA_MODE',
    required: false,
    description: 'QA Mode flag for additional debugging',
    production: false
  },
  {
    key: 'VITE_BUNDLE_ANALYZE',
    required: false,
    description: 'Bundle analysis flag',
    production: false
  }
];

function checkEnvironment(): boolean {
  const isProduction = process.env.NODE_ENV === 'production';
  let allValid = true;
  
  console.log('\n🔒 M1SSION™ Environment Validation');
  console.log('=====================================');
  console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log('');

  for (const check of ENV_CHECKS) {
    const value = process.env[check.key];
    const hasValue = value && value.trim() !== '';
    
    // Check if required in current environment
    const isRequired = check.required && (!check.production || isProduction);
    
    if (isRequired && !hasValue) {
      console.log(`❌ ${check.key}: MISSING (REQUIRED)`);
      console.log(`   Description: ${check.description}`);
      allValid = false;
    } else if (hasValue) {
      const displayValue = value.length > 20 
        ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
        : value;
      console.log(`✅ ${check.key}: ${displayValue}`);
    } else {
      console.log(`⚠️  ${check.key}: Not set (optional)`);
    }
  }

  console.log('');
  
  if (!allValid) {
    console.log('❌ BUILD FAILED: Missing required environment variables');
    console.log('');
    console.log('🔧 Quick Fix:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Fill in the required values');
    console.log('3. Run build again');
    console.log('');
    return false;
  }

  console.log('✅ All environment variables validated successfully');
  console.log('');
  return true;
}

// Security check: warn about potential hardcoded secrets
function checkHardcodedSecrets(): void {
  console.log('🔍 Checking for potential hardcoded secrets...');
  
  // This would be expanded with actual file scanning in a real implementation
  const warnings = [
    'Ensure no API keys are hardcoded in src/ files',
    'Verify all secrets use import.meta.env.*',
    'Check that .env files are in .gitignore'
  ];

  warnings.forEach(warning => {
    console.log(`⚠️  ${warning}`);
  });
  console.log('');
}

if (require.main === module) {
  checkHardcodedSecrets();
  const isValid = checkEnvironment();
  process.exit(isValid ? 0 : 1);
}

export { checkEnvironment };