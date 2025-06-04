
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDynamicIsland } from './useDynamicIsland';
import { useMissionManager } from './useMissionManager';

export const useDynamicIslandStressTest = () => {
  const navigate = useNavigate();
  const { startActivity, endActivity } = useDynamicIsland();
  const { currentMission } = useMissionManager();

  const runStressTest = useCallback(async () => {
    if (!currentMission) {
      console.warn('⚠️ No current mission available for stress test');
      return;
    }

    console.log('🧪 Starting Dynamic Island stress test sequence...');
    
    const routes = ['/buzz', '/games', '/notifications', '/home', '/map', '/buzz'];
    const activities = [
      {
        missionId: `stress-buzz-${Date.now()}`,
        title: '🔍 Buzz Test',
        status: 'Area generazione test',
        progress: 20,
      },
      {
        missionId: `stress-games-${Date.now()}`,
        title: '🎮 Games Test',
        status: 'Minigioco test',
        progress: 40,
      },
      {
        missionId: `stress-notifications-${Date.now()}`,
        title: '📨 Notifications Test',
        status: 'Notifiche test',
        progress: 60,
      },
      {
        missionId: `stress-home-${Date.now()}`,
        title: '🏠 Home Test',
        status: 'Missione test attiva',
        progress: 80,
      },
      {
        missionId: `stress-map-${Date.now()}`,
        title: '🗺️ Map Test',
        status: 'Esplorazione test',
        progress: 90,
      },
      {
        missionId: `stress-final-${Date.now()}`,
        title: '🎯 Final Test',
        status: 'Test completato',
        progress: 100,
      },
    ];

    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const activity = activities[i];
      
      console.log(`🧪 Step ${i + 1}: Navigating to ${route} and starting activity`);
      
      // Naviga alla route
      navigate(route);
      
      // Piccola pausa per permettere il render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Avvia la nuova attività (endActivity automatico per chiudere la precedente)
      await startActivity(activity);
      
      // Pausa tra le azioni
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`✅ Step ${i + 1} completed: ${route} with activity "${activity.title}"`);
    }
    
    // Chiusura finale
    console.log('🧪 Stress test completed - closing final activity');
    await endActivity();
    
    console.log('✅ Dynamic Island stress test sequence completed successfully');
  }, [navigate, startActivity, endActivity, currentMission]);

  const runQuickNavigationTest = useCallback(async () => {
    console.log('⚡ Starting quick navigation test...');
    
    const routes = ['/games', '/notifications', '/home'];
    
    for (const route of routes) {
      navigate(route);
      await new Promise(resolve => setTimeout(resolve, 200)); // Navigazione molto rapida
    }
    
    console.log('⚡ Quick navigation test completed');
  }, [navigate]);

  return {
    runStressTest,
    runQuickNavigationTest,
  };
};
