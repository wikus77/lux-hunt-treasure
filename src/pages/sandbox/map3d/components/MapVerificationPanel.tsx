import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface VerificationResult {
  step: string;
  status: 'pending' | 'pass' | 'fail';
  details: string;
  data?: any;
}

const MapVerificationPanel: React.FC = () => {
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runVerification = async () => {
    setIsRunning(true);
    const newResults: VerificationResult[] = [];

    // Step 1: Check debug helpers exist
    const step1: VerificationResult = {
      step: '1. Debug Helpers',
      status: 'pending',
      details: ''
    };
    const helpers = ['M1_MAP', '__inventoryLayers', '__whoDrawsHere', '__onlyUserAreas', '__killOverlay'];
    const missing = helpers.filter(h => !(window as any)[h]);
    step1.status = missing.length === 0 ? 'pass' : 'fail';
    step1.details = missing.length === 0 
      ? '✅ All helpers available' 
      : `❌ Missing: ${missing.join(', ')}`;
    newResults.push(step1);
    setResults([...newResults]);

    if (step1.status === 'fail') {
      setIsRunning(false);
      return;
    }

    await new Promise(r => setTimeout(r, 500));

    // Step 2: Inventory layers
    const step2: VerificationResult = {
      step: '2. Layer Inventory',
      status: 'pending',
      details: ''
    };
    try {
      const inventory = (window as any).__inventoryLayers?.();
      const circleLayers = inventory?.filter((l: any) => 
        l.id.includes('user-areas') || l.id.includes('search-areas')
      ) || [];
      step2.status = 'pass';
      step2.details = `Found ${circleLayers.length} circle layers`;
      step2.data = circleLayers;
      console.log('🔍 Circle layers:', circleLayers);
    } catch (e) {
      step2.status = 'fail';
      step2.details = `❌ Error: ${e}`;
    }
    newResults.push(step2);
    setResults([...newResults]);

    await new Promise(r => setTimeout(r, 500));

    // Step 3: Who draws at center
    const step3: VerificationResult = {
      step: '3. Who Draws Here',
      status: 'pending',
      details: ''
    };
    try {
      const map = (window as any).M1_MAP;
      const center = map.getCenter();
      const drawers = (window as any).__whoDrawsHere?.(center.lng, center.lat);
      const circleDrawers = drawers?.filter((d: any) => 
        d.layer.includes('fill') || d.layer.includes('border')
      ) || [];
      step3.status = 'pass';
      step3.details = circleDrawers.length > 0 
        ? `Drawing: ${circleDrawers.map((d: any) => d.layer).join(', ')}` 
        : '⚠️ No circles at center';
      step3.data = circleDrawers;
      console.log('🎯 Drawing at center:', circleDrawers);
    } catch (e) {
      step3.status = 'fail';
      step3.details = `❌ Error: ${e}`;
    }
    newResults.push(step3);
    setResults([...newResults]);

    await new Promise(r => setTimeout(r, 500));

    // Step 4: User-areas props (GeoJSON live)
    const step4: VerificationResult = {
      step: '4. User-Areas Props (GeoJSON)',
      status: 'pending',
      details: ''
    };
    try {
      const map = (window as any).M1_MAP;
      const source = map.getSource('user-areas');
      const data = source?._data || source?.serialize?.().data;
      const props = data?.features?.[0]?.properties;
      
      if (!props) {
        step4.status = 'fail';
        step4.details = '❌ No user-areas data';
      } else {
        step4.status = 'pass';
        step4.details = `L${props.level} · ${props.radius_km || props.radiusKm}km`;
        step4.data = props;
        console.log('🗺️ User-areas GeoJSON props:', props);
      }
    } catch (e) {
      step4.status = 'fail';
      step4.details = `❌ Error: ${e}`;
    }
    newResults.push(step4);
    setResults([...newResults]);

    await new Promise(r => setTimeout(r, 500));

    // Step 5: DB check (via supabase)
    const step5: VerificationResult = {
      step: '5. DB User Map Areas',
      status: 'pending',
      details: ''
    };
    try {
      const supabase = (window as any).supabase;
      if (!supabase) {
        step5.status = 'fail';
        step5.details = '❌ Supabase not available';
      } else {
        const { data: dbData, error } = await supabase
          .from('user_map_areas')
          .select('*')
          .eq('source', 'buzz_map')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error || !dbData) {
          step5.status = 'fail';
          step5.details = `❌ No DB data: ${error?.message || 'empty'}`;
        } else {
          step5.status = 'pass';
          step5.details = `Level ${dbData.level} · ${dbData.radius_km}km (DB)`;
          step5.data = dbData;
          console.log('💾 DB row:', dbData);
          
          // Compare with step 4
          const uaProps = newResults[3]?.data;
          if (uaProps && (uaProps.level !== dbData.level || uaProps.radiusKm !== dbData.radius_km)) {
            step5.details += ' ⚠️ MISMATCH with GeoJSON!';
          }
        }
      }
    } catch (e) {
      step5.status = 'fail';
      step5.details = `❌ Error: ${e}`;
    }
    newResults.push(step5);
    setResults([...newResults]);

    setIsRunning(false);
  };

  const clearUserAreas = () => {
    try {
      const map = (window as any).M1_MAP;
      const source = map.getSource('user-areas');
      source.setData({ type: 'FeatureCollection', features: [] });
      console.log('🧹 User-areas cleared');
    } catch (e) {
      console.error('❌ Clear failed:', e);
    }
  };

  const killOverlay = () => {
    try {
      (window as any).__killOverlay?.();
      console.log('🔪 Overlay killed');
    } catch (e) {
      console.error('❌ Kill overlay failed:', e);
    }
  };

  const onlyUserAreas = () => {
    try {
      (window as any).__onlyUserAreas?.();
      console.log('🎯 Only user-areas visible');
    } catch (e) {
      console.error('❌ onlyUserAreas failed:', e);
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[9999] bg-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 max-w-md max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-cyan-400 font-bold text-sm">MAP VERIFICATION</h3>
        <Button
          size="sm"
          onClick={runVerification}
          disabled={isRunning}
          className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs"
        >
          {isRunning ? '⏳ Running...' : '▶ Run Test'}
        </Button>
      </div>

      <div className="space-y-2 mb-4">
        {results.map((result, i) => (
          <div key={i} className="bg-black/50 rounded p-2 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className={
                result.status === 'pass' ? 'text-green-400' :
                result.status === 'fail' ? 'text-red-400' :
                'text-yellow-400'
              }>
                {result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏳'}
              </span>
              <span className="text-white font-medium">{result.step}</span>
            </div>
            <div className="text-gray-400 ml-6">{result.details}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={onlyUserAreas}
          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs flex-1"
        >
          🎯 Only UA
        </Button>
        <Button
          size="sm"
          onClick={clearUserAreas}
          className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs flex-1"
        >
          🧹 Clear UA
        </Button>
        <Button
          size="sm"
          onClick={killOverlay}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs flex-1"
        >
          🔪 Kill Overlay
        </Button>
      </div>

      <div className="mt-4 pt-4 border-t border-cyan-500/20 text-[10px] text-gray-500">
        Auto-verification panel • Press BUZZ MAP then re-run test to verify shrink
      </div>
    </div>
  );
};

export default MapVerificationPanel;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
