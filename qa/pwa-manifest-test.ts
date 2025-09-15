// M1SSION™ — PWA Manifest & Icons QA Test Suite
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

/**
 * PWA Manifest and Icon Verification Tests
 * Tests PWA installability, manifest compliance, and icon presence
 */

export interface PWATestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
  score?: number;
}

export const runPWAManifestTests = async (): Promise<PWATestResult[]> => {
  const results: PWATestResult[] = [];

  // Test 1: Manifest.json structure
  try {
    const manifestResponse = await fetch('/manifest.json');
    const manifest = await manifestResponse.json();
    
    results.push({
      test: 'Manifest JSON Structure',
      status: manifest.name && manifest.short_name && manifest.start_url ? 'PASS' : 'FAIL',
      details: `Name: ${manifest.name}, Short Name: ${manifest.short_name}, Start URL: ${manifest.start_url}`
    });

    // Test 2: PWA Display Mode
    results.push({
      test: 'PWA Display Mode',
      status: manifest.display === 'standalone' ? 'PASS' : 'FAIL',
      details: `Display mode: ${manifest.display}`
    });

    // Test 3: Theme and Background Colors
    results.push({
      test: 'Theme & Background Colors',
      status: manifest.theme_color && manifest.background_color ? 'PASS' : 'FAIL',
      details: `Theme: ${manifest.theme_color}, Background: ${manifest.background_color}`
    });

    // Test 4: Icons availability
    const iconTests = await Promise.all(
      manifest.icons.map(async (icon: any) => {
        try {
          const iconResponse = await fetch(icon.src);
          return {
            src: icon.src,
            status: iconResponse.ok ? 'PASS' : 'FAIL',
            size: icon.sizes
          };
        } catch {
          return {
            src: icon.src,
            status: 'FAIL',
            size: icon.sizes
          };
        }
      })
    );

    results.push({
      test: 'Icon Files Availability',
      status: iconTests.every(t => t.status === 'PASS') ? 'PASS' : 'FAIL',
      details: iconTests.map(t => `${t.src} (${t.size}): ${t.status}`).join(', ')
    });

  } catch (error) {
    results.push({
      test: 'Manifest Fetch',
      status: 'FAIL',
      details: `Error loading manifest: ${error.message}`
    });
  }

  // Test 5: Apple Touch Icon
  try {
    const appleIconResponse = await fetch('/apple-touch-icon.png');
    results.push({
      test: 'Apple Touch Icon',
      status: appleIconResponse.ok ? 'PASS' : 'FAIL',
      details: `Apple touch icon availability: ${appleIconResponse.status}`
    });
  } catch {
    results.push({
      test: 'Apple Touch Icon',
      status: 'FAIL',
      details: 'Apple touch icon not accessible'
    });
  }

  // Test 6: Favicon
  try {
    const faviconResponse = await fetch('/favicon.ico');
    results.push({
      test: 'Favicon',
      status: faviconResponse.ok ? 'PASS' : 'FAIL',
      details: `Favicon availability: ${faviconResponse.status}`
    });
  } catch {
    results.push({
      test: 'Favicon',
      status: 'FAIL',
      details: 'Favicon not accessible'
    });
  }

  return results;
};