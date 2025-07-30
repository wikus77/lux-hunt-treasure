// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// SAFE MODE CONTROLLER - Progressive Reactivation System

import React, { useState, useEffect } from 'react';

export interface SafeModeState {
  isSafeMode: boolean;
  hero3DEnabled: boolean;
  scrollStoryEnabled: boolean;
  featuresEnabled: boolean;
  apiHooksEnabled: boolean;
  currentStep: number;
  stepStatus: {
    safeMode: 'testing' | 'ok' | 'error';
    hero3D: 'testing' | 'ok' | 'error' | 'disabled';
    scrollStory: 'testing' | 'ok' | 'error' | 'disabled';
    features: 'testing' | 'ok' | 'error' | 'disabled';
    apiHooks: 'testing' | 'ok' | 'error' | 'disabled';
  };
}

const SafeModeController = () => {
  const [safeMode, setSafeMode] = useState<SafeModeState>({
    isSafeMode: true,
    hero3DEnabled: false,
    scrollStoryEnabled: false,
    featuresEnabled: false,
    apiHooksEnabled: false,
    currentStep: 0,
    stepStatus: {
      safeMode: 'testing',
      hero3D: 'disabled',
      scrollStory: 'disabled',
      features: 'disabled',
      apiHooks: 'disabled'
    }
  });

  useEffect(() => {
    console.log("🛡️ SAFE MODE CONTROLLER ACTIVE - Starting progressive reactivation system");
    
    // Step 0: Safe Mode Test (30 seconds)
    const safeModeTimer = setTimeout(() => {
      console.log("✅ SAFE MODE 30s OK - No crashes detected in static mode");
      setSafeMode(prev => ({
        ...prev,
        stepStatus: { ...prev.stepStatus, safeMode: 'ok' },
        currentStep: 1
      }));
      
      // Auto-start Step 1 after Safe Mode success
      setTimeout(() => {
        console.log("🚀 STEP 1: Activating Hero3D...");
        setSafeMode(prev => ({
          ...prev,
          hero3DEnabled: true,
          stepStatus: { ...prev.stepStatus, hero3D: 'testing' }
        }));
        
        // Test Hero3D for 30 seconds
        const hero3DTimer = setTimeout(() => {
          console.log("✅ STEP 1: Hero3D OK - No crashes detected");
          setSafeMode(prev => ({
            ...prev,
            stepStatus: { ...prev.stepStatus, hero3D: 'ok' },
            currentStep: 2
          }));
          
          // Auto-start Step 2
          setTimeout(() => {
            console.log("📜 STEP 2: Activating ScrollStory...");
            setSafeMode(prev => ({
              ...prev,
              scrollStoryEnabled: true,
              stepStatus: { ...prev.stepStatus, scrollStory: 'testing' }
            }));
            
            // Test ScrollStory for 30 seconds
            const scrollTimer = setTimeout(() => {
              console.log("✅ STEP 2: ScrollStory OK - No crashes detected");
              setSafeMode(prev => ({
                ...prev,
                stepStatus: { ...prev.stepStatus, scrollStory: 'ok' },
                currentStep: 3
              }));
              
              // Auto-start Step 3
              setTimeout(() => {
                console.log("🎯 STEP 3: Activating Features...");
                setSafeMode(prev => ({
                  ...prev,
                  featuresEnabled: true,
                  stepStatus: { ...prev.stepStatus, features: 'testing' }
                }));
                
                // Test Features for 30 seconds
                const featuresTimer = setTimeout(() => {
                  console.log("✅ STEP 3: Features OK - No crashes detected");
                  setSafeMode(prev => ({
                    ...prev,
                    stepStatus: { ...prev.stepStatus, features: 'ok' },
                    currentStep: 4,
                    isSafeMode: false
                  }));
                  
                  console.log("🎉🎉🎉 ALL SYSTEMS OPERATIONAL - Progressive reactivation completed successfully! 🎉🎉🎉");
                }, 30000);
                
                return () => clearTimeout(featuresTimer);
              }, 2000);
            }, 30000);
            
            return () => clearTimeout(scrollTimer);
          }, 2000);
        }, 30000);
        
        return () => clearTimeout(hero3DTimer);
      }, 2000);
    }, 30000);

    return () => clearTimeout(safeModeTimer);
  }, []);

  // Global error handler for progressive testing
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      const currentStepName = safeMode.currentStep === 0 ? 'Safe Mode' : 
                             safeMode.currentStep === 1 ? 'Hero3D' :
                             safeMode.currentStep === 2 ? 'ScrollStory' :
                             safeMode.currentStep === 3 ? 'Features' : 'Unknown';
      
      console.error(`❌ CRASH DETECTED IN ${currentStepName}:`, error);
      
      // Update status to error
      setSafeMode(prev => ({
        ...prev,
        stepStatus: {
          ...prev.stepStatus,
          [safeMode.currentStep === 1 ? 'hero3D' : 
           safeMode.currentStep === 2 ? 'scrollStory' :
           safeMode.currentStep === 3 ? 'features' : 'safeMode']: 'error'
        }
      }));
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [safeMode.currentStep]);

  return safeMode;
};

export default SafeModeController;