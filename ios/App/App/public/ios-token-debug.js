// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// CRITICAL iOS PWA Token Verification Script - Final Testing

window.M1SSIONTokenDebug = {
  // Complete token verification flow
  async verifyTokenFlow() {
    console.log('🔔 CRITICAL iOS PWA: Starting complete token verification...');
    
    const verification = {
      timestamp: new Date().toISOString(),
      environment: {
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isPWA: window.navigator.standalone === true,
        hostname: window.location.hostname,
        protocol: window.location.protocol
      },
      oneSignal: {},
      database: {},
      errors: []
    };

    try {
      // Step 1: Check OneSignal readiness
      if (typeof OneSignal !== 'undefined') {
        verification.oneSignal.sdkLoaded = true;
        
        try {
          const permission = await OneSignal.Notifications.permission;
          const isOptedIn = await OneSignal.User.PushSubscription.optedIn;
          const playerId = await OneSignal.User.PushSubscription.id;
          
          verification.oneSignal = {
            ...verification.oneSignal,
            permission,
            isOptedIn,
            playerId: playerId ? `${playerId.substring(0, 20)}...` : null,
            playerIdFull: playerId,
            playerIdLength: playerId ? playerId.length : 0
          };
          
          console.log('✅ OneSignal Status:', verification.oneSignal);
          
        } catch (error) {
          verification.errors.push(`OneSignal API Error: ${error.message}`);
          console.error('❌ OneSignal API Error:', error);
        }
      } else {
        verification.errors.push('OneSignal SDK not loaded');
      }

      // Step 2: Check database tokens
      if (window.supabase && verification.oneSignal.playerIdFull) {
        try {
          const { data: user } = await window.supabase.auth.getUser();
          
          if (user.user) {
            const { data: tokens, error } = await window.supabase
              .from('device_tokens')
              .select('*')
              .eq('user_id', user.user.id)
              .eq('device_type', 'onesignal');

            verification.database = {
              userAuthenticated: true,
              userId: user.user.id,
              tokensCount: tokens ? tokens.length : 0,
              tokens: tokens || [],
              hasMatchingToken: tokens ? tokens.some(t => t.token === verification.oneSignal.playerIdFull) : false
            };

            console.log('✅ Database Status:', verification.database);

          } else {
            verification.database.userAuthenticated = false;
            verification.errors.push('User not authenticated');
          }
        } catch (error) {
          verification.errors.push(`Database Error: ${error.message}`);
          console.error('❌ Database Error:', error);
        }
      }

      // Step 3: Generate recommendations
      const recommendations = [];
      
      if (!verification.oneSignal.permission) {
        recommendations.push('Request notification permission from user');
      }
      
      if (!verification.oneSignal.isOptedIn) {
        recommendations.push('User needs to opt-in to push notifications');
      }
      
      if (!verification.oneSignal.playerIdFull) {
        recommendations.push('OneSignal Player ID not generated - check permission flow');
      }
      
      if (verification.oneSignal.playerIdFull && !verification.database.hasMatchingToken) {
        recommendations.push('CRITICAL: Token exists in OneSignal but not saved to database');
      }

      verification.recommendations = recommendations;

      console.log('🎯 VERIFICATION COMPLETE:', verification);
      console.log('📋 RECOMMENDATIONS:', recommendations);

      // Step 4: Auto-fix if possible
      if (verification.oneSignal.playerIdFull && verification.database.userAuthenticated && !verification.database.hasMatchingToken) {
        console.log('🔧 ATTEMPTING AUTO-FIX: Saving missing token to database...');
        
        try {
          const { error } = await window.supabase
            .from('device_tokens')
            .upsert({
              user_id: verification.database.userId,
              token: verification.oneSignal.playerIdFull,
              device_type: 'onesignal',
              last_used: new Date().toISOString(),
              created_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,device_type'
            });

          if (error) {
            console.error('❌ AUTO-FIX FAILED:', error);
            verification.autoFix = { success: false, error: error.message };
          } else {
            console.log('✅ AUTO-FIX SUCCESS: Token saved to database');
            verification.autoFix = { success: true };
          }
        } catch (error) {
          console.error('❌ AUTO-FIX EXCEPTION:', error);
          verification.autoFix = { success: false, error: error.message };
        }
      }

      return verification;

    } catch (error) {
      console.error('❌ VERIFICATION FAILED:', error);
      verification.errors.push(`Verification failed: ${error.message}`);
      return verification;
    }
  },

  // Quick token status check
  async quickCheck() {
    try {
      const permission = await OneSignal.Notifications.permission;
      const playerId = await OneSignal.User.PushSubscription.id;
      
      console.log('🔔 Quick Check:', {
        permission,
        playerId: playerId ? `${playerId.substring(0, 20)}...` : null,
        timestamp: new Date().toISOString()
      });
      
      return { permission, playerId };
    } catch (error) {
      console.error('❌ Quick check failed:', error);
      return { error: error.message };
    }
  },

  // Force token save
  async forceSave() {
    try {
      const playerId = await OneSignal.User.PushSubscription.id;
      const { data: { user } } = await window.supabase.auth.getUser();
      
      if (!playerId) {
        throw new Error('No Player ID available');
      }
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await window.supabase
        .from('device_tokens')
        .upsert({
          user_id: user.id,
          token: playerId,
          device_type: 'onesignal',
          last_used: new Date().toISOString(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,device_type'
        });

      if (error) {
        throw error;
      }

      console.log('✅ Force save successful:', playerId);
      return { success: true, playerId };

    } catch (error) {
      console.error('❌ Force save failed:', error);
      return { success: false, error: error.message };
    }
  }
};

console.log('🔔 M1SSION™ Token Debug Tools loaded:');
console.log('• window.M1SSIONTokenDebug.verifyTokenFlow() - Complete verification');
console.log('• window.M1SSIONTokenDebug.quickCheck() - Quick status check');
console.log('• window.M1SSIONTokenDebug.forceSave() - Force token save');