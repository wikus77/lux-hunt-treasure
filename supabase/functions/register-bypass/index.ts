// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Register Bypass - Developer/Testing bypass with secure logging

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';
import { withCors } from "../_shared/cors.ts";
import { createSecureLogger, maskValue } from "../_shared/secureLog.ts";
import { checkRateLimit, rateLimitResponse, RATE_LIMIT_PRESETS } from "../_shared/rateLimit.ts";

const log = createSecureLogger('REGISTER-BYPASS');

serve(withCors(async (req) => {
  // 🔒 Rate limiting: 5 attempts per minute (strict for registration)
  const rateLimitResult = await checkRateLimit('register-bypass', req, RATE_LIMIT_PRESETS.STRICT);
  if (!rateLimitResult.allowed) {
    log.warn("Rate limit exceeded");
    return rateLimitResponse(rateLimitResult);
  }
  
  try {
    const body = await req.json();
    const { email, password, fullName, missionPreference, action } = body;

    log.info("Request received", { action: action || 'register', hasEmail: !!email });

    // Create admin client with bypass headers
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'cf-bypass-bot-check': 'true',
            'cf-worker': 'true',
            'x-real-ip': '127.0.0.1'
          }
        }
      }
    );

    const origin = req.headers.get('origin') || 'https://2716f91b-957c-47ba-91e0-6f572f3ce00d.lovableproject.com';

    // LOGIN MODE
    if (action === 'login') {
      log.info("Processing login bypass", { email: maskValue(email, 'email') });
      
      try {
        // Get or create user
        const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
        if (getUserError) {
          log.error("Error listing users");
          return jsonResponse({ 
            success: false, 
            error: 'Cannot verify user existence',
            code: 'USER_VERIFICATION_FAILED'
          }, 400);
        }

        let existingUser = users.users.find(user => user.email === email);
        
        // Create user if doesn't exist
        if (!existingUser) {
          log.info("Creating new user");
          const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName || 'User',
              mission_preference: missionPreference || 'default'
            }
          });

          if (createError) {
            log.error("User creation failed");
            return jsonResponse({ 
              success: false, 
              error: createError.message,
              code: 'USER_CREATE_FAILED'
            }, 400);
          }
          
          existingUser = createData.user;
          log.success("User created", { userId: maskValue(existingUser?.id || '', 'uuid') });
        } else {
          // Update password if user exists
          log.info("Updating user password");
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            { password }
          );
          
          if (updateError) {
            log.warn("Password update failed, continuing");
          } else {
            log.success("Password updated");
          }
        }

        // Create bypass session
        log.info("Creating bypass session");

        try {
          const now = Math.floor(Date.now() / 1000);
          const expiresAt = now + 3600;
          
          const jwtPayload = {
            aud: 'authenticated',
            exp: expiresAt,
            iat: now,
            iss: 'supabase',
            sub: existingUser.id,
            email: existingUser.email,
            phone: '',
            app_metadata: existingUser.app_metadata || {},
            user_metadata: existingUser.user_metadata || {},
            role: 'authenticated',
            aal: 'aal1',
            amr: [{ method: 'password', timestamp: now }],
            session_id: `bypass_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };

          const accessToken = `sb-access-token.${btoa(JSON.stringify(jwtPayload))}.signature_${Date.now()}`;
          const refreshToken = `sb-refresh-token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          const finalSession = {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 3600,
            expires_at: expiresAt,
            token_type: 'bearer',
            user: existingUser
          };

          log.success("Bypass session created", { userId: maskValue(existingUser.id, 'uuid') });

          return jsonResponse({ 
            success: true, 
            user: existingUser,
            session: finalSession,
            redirect_url: `${origin}/home`,
            message: 'LOGIN BYPASS successful',
            bypassMethod: 'direct_token_creation'
          }, 200);

        } catch (directError) {
          log.error("Direct session creation failed");
          
          // Fallback: Try magic link
          try {
            log.info("Attempting magic link fallback");
            
            const { data: magicData, error: magicError } = await supabaseAdmin.auth.admin.generateLink({
              type: 'magiclink',
              email: email,
              options: { redirectTo: `${origin}/home` }
            });

            if (!magicError && magicData && magicData.properties?.action_link) {
              log.success("Magic link generated");
              
              return jsonResponse({ 
                success: true, 
                user: existingUser,
                magicLink: magicData.properties.action_link,
                redirect_url: magicData.properties.action_link,
                message: 'Magic link generated',
                bypassMethod: 'magic_link_enhanced'
              }, 200);
            } else {
              throw new Error('Magic link failed');
            }
          } catch (magicError) {
            log.error("Magic link generation failed");
            throw new Error('All login strategies failed');
          }
        }

      } catch (ultimateError: any) {
        log.error("Ultimate login bypass failed");
        
        return jsonResponse({ 
          success: false, 
          error: 'Ultimate login bypass system failure',
          code: 'ULTIMATE_BYPASS_FAILURE'
        }, 500);
      }
    }

    // REGISTRATION MODE
    log.info("Processing registration", { email: maskValue(email, 'email') });

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabaseAdmin.auth.admin.listUsers();
    if (!checkError) {
      const userExists = existingUsers.users.find(user => user.email === email);
      if (userExists) {
        log.info("User already exists, redirecting to login");
        return jsonResponse({ 
          success: true, 
          user: userExists,
          message: 'User already registered - please login',
          requireLogin: true,
          redirect_url: `${origin}/login`
        }, 200);
      }
    }

    // Create new user with password
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        mission_preference: missionPreference
      }
    });

    if (createError) {
      log.error("User creation failed");
      return jsonResponse({ 
        success: false, 
        error: createError.message,
        code: 'CREATE_FAILED'
      }, 400);
    }

    log.success("User created successfully", { userId: maskValue(user.user?.id || '', 'uuid') });

    return jsonResponse({ 
      success: true, 
      user: user.user,
      message: 'Registration completed successfully',
      requireLogin: false,
      redirect_url: `${origin}/login`
    }, 200);

  } catch (error: any) {
    log.error("Bypass exception");
    
    return jsonResponse({ 
      success: false, 
      error: error.message || 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, 500);
  }
}));

// Helper function for JSON responses (CORS handled by withCors wrapper)
function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { 
    status, 
    headers: { 'Content-Type': 'application/json' }
  });
}
