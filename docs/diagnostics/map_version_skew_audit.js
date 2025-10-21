/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * MAP VERSION SKEW DIAGNOSTIC SCRIPT
 * 
 * USAGE:
 * 1. Open /map in browser
 * 2. Open DevTools Console
 * 3. Copy/paste this entire file
 * 4. Execute: await runMapDiagnostics()
 * 5. Screenshot all output
 * 6. Perform 5 hard refreshes (Cmd/Ctrl+Shift+R)
 * 7. Re-execute: await runMapDiagnostics() after each
 * 8. Compare BUILD_ID across all 5 runs
 */

async function runMapDiagnostics() {
  console.clear();
  console.log('🔍 M1SSION™ MAP DIAGNOSTIC SUITE - Version Skew Analysis');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const timestamp = new Date().toISOString();
  const results = {
    timestamp,
    test_number: (window.__M1_TEST_COUNT || 0) + 1,
    build_env: {},
    service_worker: {},
    feature_flags: {},
    living_map: {},
    agents_presence: {},
    geolocation: {},
    cache_status: {},
    network_chunks: {}
  };
  
  window.__M1_TEST_COUNT = results.test_number;
  
  // ═══════════════════════════════════════════════════════════
  // 1. BUILD & ENV CHECK
  // ═══════════════════════════════════════════════════════════
  console.log('📦 1. BUILD & ENVIRONMENT');
  console.log('─────────────────────────────');
  
  try {
    results.build_env = {
      BUILD_ID: import.meta.env.VITE_BUILD_ID || 'MISSING',
      MODE: import.meta.env.MODE || 'MISSING',
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
      PWA_VERSION: typeof __PWA_VERSION__ !== 'undefined' ? __PWA_VERSION__ : 'N/A'
    };
    
    console.table(results.build_env);
    
    if (results.build_env.BUILD_ID === 'MISSING') {
      console.error('❌ CRITICAL: BUILD_ID not exposed to runtime!');
    } else {
      console.log(`✅ BUILD_ID detected: ${results.build_env.BUILD_ID}`);
    }
  } catch (err) {
    console.error('❌ Failed to read BUILD_ENV:', err.message);
  }
  
  // ═══════════════════════════════════════════════════════════
  // 2. FEATURE FLAGS
  // ═══════════════════════════════════════════════════════════
  console.log('\n🎛️  2. FEATURE FLAGS');
  console.log('─────────────────────────────');
  
  try {
    results.feature_flags = {
      LIVING_MAP: import.meta.env.VITE_ENABLE_LIVING_MAP ?? '(unset)',
      WEATHER_OVERLAY: import.meta.env.VITE_WEATHER_OVERLAY ?? '(unset)',
      TERRAIN_URL: !!import.meta.env.VITE_TERRAIN_URL,
      CONTOUR_URL: !!import.meta.env.VITE_CONTOUR_URL,
      MAPBOX_TOKEN: !!import.meta.env.VITE_MAPBOX_TOKEN
    };
    
    console.table(results.feature_flags);
    
    // Check UI consistency
    const weatherVisible = document.querySelector('.m1-weather-layer')?.style.display !== 'none';
    const radarVisible = document.querySelector('.living-hud-glass')?.querySelector('[data-layer="radar"]');
    
    console.log(`\n🌦️  Weather overlay in DOM: ${weatherVisible ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    console.log(`📡 Radar HUD in DOM: ${radarVisible ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    
    if (results.feature_flags.WEATHER_OVERLAY === 'true' && !weatherVisible) {
      console.warn('⚠️  MISMATCH: WEATHER_OVERLAY=true but UI shows hidden!');
    }
  } catch (err) {
    console.error('❌ Failed to read FEATURE_FLAGS:', err.message);
  }
  
  // ═══════════════════════════════════════════════════════════
  // 3. SERVICE WORKER
  // ═══════════════════════════════════════════════════════════
  console.log('\n🔧 3. SERVICE WORKER');
  console.log('─────────────────────────────');
  
  try {
    if ('serviceWorker' in navigator) {
      const controller = navigator.serviceWorker.controller;
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      results.service_worker = {
        controller_url: controller?.scriptURL || 'NO_CONTROLLER',
        controller_state: controller?.state || 'N/A',
        registrations_count: registrations.length,
        registrations: registrations.map(reg => ({
          scope: reg.scope,
          active: reg.active?.scriptURL || 'none',
          waiting: reg.waiting?.scriptURL || 'none',
          installing: reg.installing?.scriptURL || 'none'
        }))
      };
      
      console.log('Controller:', results.service_worker.controller_url);
      console.log('Registrations:', results.service_worker.registrations_count);
      console.table(results.service_worker.registrations);
      
      if (registrations.length > 1) {
        console.warn('⚠️  MULTIPLE SERVICE WORKERS DETECTED - Possible conflict!');
      }
      
      if (!controller) {
        console.warn('⚠️  NO CONTROLLER - App not under SW control!');
      }
    } else {
      results.service_worker = { error: 'Service Workers not supported' };
      console.log('❌ Service Workers not supported');
    }
  } catch (err) {
    console.error('❌ Failed to inspect SERVICE_WORKER:', err.message);
  }
  
  // ═══════════════════════════════════════════════════════════
  // 4. CACHE STORAGE
  // ═══════════════════════════════════════════════════════════
  console.log('\n💾 4. CACHE STORAGE');
  console.log('─────────────────────────────');
  
  try {
    const cacheNames = await caches.keys();
    results.cache_status = {
      cache_count: cacheNames.length,
      cache_names: cacheNames,
      expected_pattern: 'm1ssion-*'
    };
    
    console.log(`Total caches: ${cacheNames.length}`);
    console.table(cacheNames.map((name, i) => ({ index: i, name })));
    
    // Check for stale caches
    const hasV2 = cacheNames.some(n => n.includes('-v2'));
    const hasV1 = cacheNames.some(n => n.includes('-v1'));
    const hasBuildId = cacheNames.some(n => /build-[a-z0-9]+/.test(n));
    
    if (hasV1 && hasV2) {
      console.warn('⚠️  STALE CACHE: Both v1 and v2 detected - cleanup needed!');
    }
    
    if (!hasBuildId && results.build_env.BUILD_ID !== 'MISSING') {
      console.warn('⚠️  CACHE VERSION MISMATCH: BUILD_ID exists but not in cache names!');
    }
    
    if (hasBuildId) {
      console.log('✅ BUILD_ID found in cache names (cache versioning active)');
    }
  } catch (err) {
    console.error('❌ Failed to inspect CACHE_STORAGE:', err.message);
  }
  
  // ═══════════════════════════════════════════════════════════
  // 5. LIVING MAP STATE
  // ═══════════════════════════════════════════════════════════
  console.log('\n🗺️  5. LIVING MAP STATE');
  console.log('─────────────────────────────');
  
  try {
    const livingMapEnabled = import.meta.env.VITE_ENABLE_LIVING_MAP !== 'false';
    const hudElement = document.querySelector('.living-hud-glass');
    const radarElement = document.querySelector('[data-layer="radar"]');
    
    results.living_map = {
      enabled_flag: livingMapEnabled,
      hud_in_dom: !!hudElement,
      radar_in_dom: !!radarElement,
      loading_text: hudElement?.textContent?.includes('Loading') || false
    };
    
    console.table(results.living_map);
    
    if (livingMapEnabled && !hudElement) {
      console.warn('⚠️  LIVING MAP: Enabled but HUD not in DOM - lazy load failed?');
    }
    
    if (results.living_map.loading_text) {
      console.warn('⚠️  LIVING MAP: Stuck on "Loading..." - chunk load timeout?');
    }
  } catch (err) {
    console.error('❌ Failed to check LIVING_MAP:', err.message);
  }
  
  // ═══════════════════════════════════════════════════════════
  // 6. AGENTS PRESENCE
  // ═══════════════════════════════════════════════════════════
  console.log('\n👥 6. AGENTS PRESENCE');
  console.log('─────────────────────────────');
  
  try {
    const debug = window.__M1_DEBUG;
    
    if (!debug) {
      console.warn('⚠️  window.__M1_DEBUG not available - diagnostics disabled?');
      results.agents_presence = { error: 'Debug object missing' };
    } else {
      results.agents_presence = {
        status: debug.presence?.status || 'N/A',
        state: debug.presence?.state || 'N/A',
        queued: debug.presence?.queued || false,
        count: debug.presence?.count || 0,
        rendered_count: debug.lastAgentsPresence?.length || 0,
        online_count: debug.agentsPresenceAll?.length || 0,
        has_coords: debug.lastAgentsPresence?.some(a => a.lat && a.lng) || false
      };
      
      console.table(results.agents_presence);
      
      // Check for self marker
      const selfMarker = document.querySelector('.m1-agent-dot--me');
      console.log(`🔴 Self marker in DOM: ${selfMarker ? '✅ VISIBLE' : '❌ MISSING'}`);
      
      if (results.agents_presence.status === 'SUBSCRIBED' && !selfMarker) {
        console.warn('⚠️  PRESENCE: SUBSCRIBED but no self marker - coords missing?');
      }
      
      if (results.agents_presence.state === 'error') {
        console.error('❌ PRESENCE: Error state - check Realtime connection!');
      }
      
      if (results.agents_presence.rendered_count === 0 && results.agents_presence.online_count > 0) {
        console.warn('⚠️  PRESENCE: Agents online but none rendered - coords missing!');
      }
    }
  } catch (err) {
    console.error('❌ Failed to check AGENTS_PRESENCE:', err.message);
  }
  
  // ═══════════════════════════════════════════════════════════
  // 7. GEOLOCATION
  // ═══════════════════════════════════════════════════════════
  console.log('\n📍 7. GEOLOCATION');
  console.log('─────────────────────────────');
  
  try {
    const debug = window.__M1_DEBUG;
    
    if (debug?.geo) {
      results.geolocation = {
        source: debug.geo.source || 'N/A',
        has_coords: !!(debug.geo.last?.lat && debug.geo.last?.lng),
        coords: debug.geo.last || null,
        error: debug.geo.error || null
      };
      
      console.table(results.geolocation);
      
      if (!results.geolocation.has_coords) {
        console.warn('⚠️  GEO: No coordinates available - both GPS and IP-Geo failed?');
      }
      
      if (results.geolocation.source === 'cached') {
        console.warn('⚠️  GEO: Using cached coords - real-time location failed!');
      }
    } else {
      console.warn('⚠️  window.__M1_DEBUG.geo not available');
      results.geolocation = { error: 'Debug geo object missing' };
    }
    
    // Check GPS permission
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      console.log(`🛰️  GPS Permission: ${permission.state.toUpperCase()}`);
      results.geolocation.gps_permission = permission.state;
    } catch (permErr) {
      console.log('ℹ️  GPS permission check not supported');
    }
  } catch (err) {
    console.error('❌ Failed to check GEOLOCATION:', err.message);
  }
  
  // ═══════════════════════════════════════════════════════════
  // 8. NETWORK CHUNKS (LAZY LOADING)
  // ═══════════════════════════════════════════════════════════
  console.log('\n📡 8. NETWORK CHUNKS');
  console.log('─────────────────────────────');
  console.log('ℹ️  Inspect Network tab → JS filter: "living" to see chunk hashes');
  console.log('   Expected chunks:');
  console.log('   - RadarOverlay.[hash].js');
  console.log('   - PortalsLayer.[hash].js');
  console.log('   - AgentsLayer.[hash].js');
  console.log('   - ControlZonesLayer.[hash].js');
  console.log('\n   ⚠️  If hashes change between refreshes → VERSION SKEW!');
  
  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 DIAGNOSTIC SUMMARY - TEST #' + results.test_number);
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('BUILD_ID:', results.build_env.BUILD_ID);
  console.log('MODE:', results.build_env.MODE);
  console.log('SW Controller:', results.service_worker.controller_url);
  console.log('Cache Count:', results.cache_status.cache_count);
  console.log('Living Map HUD:', results.living_map.hud_in_dom ? '✅' : '❌');
  console.log('Agents Presence:', results.agents_presence.status);
  console.log('Self Marker:', document.querySelector('.m1-agent-dot--me') ? '✅' : '❌');
  console.log('Geo Source:', results.geolocation.source);
  
  console.log('\n📸 NEXT STEPS:');
  console.log('1. Screenshot this entire console output');
  console.log('2. Hard refresh (Cmd/Ctrl+Shift+R)');
  console.log('3. Re-run: await runMapDiagnostics()');
  console.log('4. Repeat 5 times total');
  console.log('5. Compare BUILD_ID across all 5 runs');
  console.log('6. If BUILD_ID changes → VERSION SKEW CONFIRMED');
  console.log('7. If BUILD_ID same but markers/weather vary → CACHE ISSUE');
  
  console.log('\n💾 Results saved to: window.__M1_DIAGNOSTIC_RESULTS');
  window.__M1_DIAGNOSTIC_RESULTS = window.__M1_DIAGNOSTIC_RESULTS || [];
  window.__M1_DIAGNOSTIC_RESULTS.push(results);
  
  console.log('\n📋 To export all results:');
  console.log('copy(JSON.stringify(window.__M1_DIAGNOSTIC_RESULTS, null, 2))');
  
  return results;
}

// Auto-expose to window for easy access
window.runMapDiagnostics = runMapDiagnostics;

console.log('✅ Diagnostic script loaded!');
console.log('📝 Execute: await runMapDiagnostics()');
console.log('');

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
