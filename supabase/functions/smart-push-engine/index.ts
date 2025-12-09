// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// SMART PUSH ENGINE - Sistema notifiche intelligenti e personalizzate
// Gestisce: AION Briefing, Classifica, Motivazionali, Misteriose, Comportamentali

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import webpush from 'npm:web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
}

interface UserData {
  id: string;
  agent_code: string;
  full_name: string;
  pulse_energy: number;
  streak_days: number;
  clues_count: number;
  rank: number;
  m1u_balance: number;
  last_buzz_at: string | null;
  last_aion_chat_at: string | null;
  last_session_at: string | null;
  lat: number | null;
  lng: number | null;
}

interface Template {
  id: string;
  template_key: string;
  category: string;
  title: string;
  body: string;
  deeplink: string;
  trigger_type: string;
  trigger_condition: any;
  max_per_day: number;
  priority: number;
  weight: number;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { 
      trigger = 'cron', // 'cron', 'event', 'test'
      template_key = null, // Force specific template
      user_id = null, // Force specific user (for testing)
      event_data = {} // Event-specific data
    } = body;

    console.log(`🧠 [SMART-PUSH] Starting - trigger: ${trigger}, template: ${template_key || 'auto'}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // VAPID setup
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
    const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:support@m1ssion.eu';
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    // Get current Rome time
    const now = new Date();
    const romeTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
    const currentHour = romeTime.getHours();
    const currentDay = romeTime.getDay(); // 0 = Sunday
    const today = now.toISOString().split('T')[0];

    console.log(`🧠 [SMART-PUSH] Rome time: ${currentHour}:00, Day: ${currentDay}`);

    // Get eligible templates based on trigger
    let templatesQuery = supabase
      .from('smart_push_templates')
      .select('*')
      .eq('enabled', true);

    if (template_key) {
      templatesQuery = templatesQuery.eq('template_key', template_key);
    } else if (trigger === 'cron') {
      templatesQuery = templatesQuery.eq('trigger_type', 'cron');
    }

    const { data: templates, error: tplError } = await templatesQuery;

    if (tplError || !templates?.length) {
      console.log('🧠 [SMART-PUSH] No eligible templates found');
      return json({ success: true, message: 'No templates to process' });
    }

    // Filter templates by time conditions for CRON triggers
    const eligibleTemplates = templates.filter((t: Template) => {
      if (trigger !== 'cron') return true;
      
      const cond = t.trigger_condition || {};
      
      // Check hour match
      if (cond.hour !== undefined && cond.hour !== currentHour) return false;
      
      // Check day match (for weekly)
      if (cond.day !== undefined && cond.day !== currentDay) return false;
      
      // Random probability
      if (cond.random && cond.probability) {
        return Math.random() < cond.probability;
      }
      
      // Random weekly (send once per week randomly)
      if (cond.random_weekly) {
        // Only on a random day, at a specific time
        const randomDayThisWeek = Math.floor(Math.random() * 7);
        return currentDay === randomDayThisWeek && currentHour === 19;
      }
      
      return true;
    });

    if (!eligibleTemplates.length) {
      console.log('🧠 [SMART-PUSH] No templates match current time conditions');
      return json({ success: true, message: 'No templates for current time' });
    }

    console.log(`🧠 [SMART-PUSH] ${eligibleTemplates.length} eligible templates`);

    // Get target users
    let usersQuery = supabase.rpc('get_smart_push_users', { p_date: today });
    
    if (user_id) {
      // For testing: single user
      const { data: singleUser } = await supabase
        .from('profiles')
        .select('id, agent_code, full_name, pulse_energy')
        .eq('id', user_id)
        .single();
      
      if (!singleUser) {
        return json({ success: false, error: 'User not found' }, 404);
      }
    }

    // Get all users with their stats
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        agent_code,
        full_name,
        pulse_energy
      `)
      .limit(user_id ? 1 : 1000);

    if (usersError || !users?.length) {
      console.log('🧠 [SMART-PUSH] No users found');
      return json({ success: true, message: 'No users' });
    }

    // Get activity stats for users
    const userIds = users.map(u => u.id);
    const { data: activityStats } = await supabase
      .from('user_activity_stats')
      .select('*')
      .in('user_id', userIds);

    const statsMap = new Map(activityStats?.map(s => [s.user_id, s]) || []);

    // Get today's push log for frequency cap
    const { data: todayLogs } = await supabase
      .from('smart_push_log')
      .select('user_id, template_key')
      .eq('sent_at::date', today);

    const userLogCount = new Map<string, Map<string, number>>();
    todayLogs?.forEach(log => {
      if (!userLogCount.has(log.user_id)) {
        userLogCount.set(log.user_id, new Map());
      }
      const templateCounts = userLogCount.get(log.user_id)!;
      templateCounts.set(log.template_key, (templateCounts.get(log.template_key) || 0) + 1);
    });

    // Get M1U balances
    const { data: m1uData } = await supabase
      .from('m1_units')
      .select('user_id, units')
      .in('user_id', userIds);

    const m1uMap = new Map(m1uData?.map(m => [m.user_id, m.units]) || []);

    // Get leaderboard ranks
    const { data: leaderboardData } = await supabase
      .from('leaderboard_view')
      .select('user_id, rank')
      .in('user_id', userIds);

    const rankMap = new Map(leaderboardData?.map(l => [l.user_id, l.rank]) || []);

    // Get clues count
    const { data: cluesData } = await supabase
      .from('clue_unlocks')
      .select('user_id')
      .in('user_id', userIds);

    const cluesCount = new Map<string, number>();
    cluesData?.forEach(c => {
      cluesCount.set(c.user_id, (cluesCount.get(c.user_id) || 0) + 1);
    });

    // Get push subscriptions
    const { data: subscriptions } = await supabase
      .from('webpush_subscriptions')
      .select('*')
      .in('user_id', userIds)
      .eq('is_active', true);

    const subMap = new Map<string, any[]>();
    subscriptions?.forEach(sub => {
      if (!subMap.has(sub.user_id)) {
        subMap.set(sub.user_id, []);
      }
      subMap.get(sub.user_id)!.push(sub);
    });

    // Process each user
    let sentCount = 0;
    let skippedCount = 0;
    const logsToInsert: any[] = [];

    for (const user of users) {
      // Skip if no subscription
      const userSubs = subMap.get(user.id);
      if (!userSubs?.length) {
        skippedCount++;
        continue;
      }

      const stats = statsMap.get(user.id) || {};
      const userLogs = userLogCount.get(user.id) || new Map();

      // Count total notifications today for this user
      let totalToday = 0;
      userLogs.forEach(count => totalToday += count);

      // Max 3 regular + 1 AION per day
      const maxRegular = 3;
      const regularToday = totalToday - (userLogs.get('aion_briefing') || 0);

      // Select best template for this user
      const userTemplates = eligibleTemplates.filter((t: Template) => {
        // Check frequency cap
        const templateCount = userLogs.get(t.template_key) || 0;
        if (templateCount >= t.max_per_day) return false;

        // AION is exempt from regular limit
        if (t.category === 'aion') return true;

        // Check regular limit
        if (regularToday >= maxRegular) return false;

        // Check behavior conditions
        const cond = t.trigger_condition || {};
        
        if (cond.days_since_aion_chat) {
          const lastChat = stats.last_aion_chat_at ? new Date(stats.last_aion_chat_at) : null;
          if (lastChat) {
            const daysSince = Math.floor((now.getTime() - lastChat.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince < cond.days_since_aion_chat) return false;
          }
        }

        if (cond.has_m1u) {
          const balance = m1uMap.get(user.id) || 0;
          if (balance <= 0) return false;
        }

        if (cond.hours_since_buzz) {
          const lastBuzz = stats.last_buzz_at ? new Date(stats.last_buzz_at) : null;
          if (lastBuzz) {
            const hoursSince = Math.floor((now.getTime() - lastBuzz.getTime()) / (1000 * 60 * 60));
            if (hoursSince < cond.hours_since_buzz) return false;
          }
        }

        if (cond.clues_above) {
          const clues = cluesCount.get(user.id) || 0;
          if (clues < cond.clues_above) return false;
        }

        return true;
      });

      if (!userTemplates.length) {
        skippedCount++;
        continue;
      }

      // Select template by priority and weight
      userTemplates.sort((a: Template, b: Template) => b.priority - a.priority);
      const selectedTemplate = userTemplates[0];

      // Render variables
      const variables: Record<string, string> = {
        agent_code: user.agent_code || 'Agente',
        full_name: user.full_name || 'Agente',
        streak_days: String(stats.current_streak || 0),
        clues_count: String(cluesCount.get(user.id) || 0),
        rank: String(rankMap.get(user.id) || '?'),
        m1u_balance: String(m1uMap.get(user.id) || 0),
        days_since_chat: stats.last_aion_chat_at 
          ? String(Math.floor((now.getTime() - new Date(stats.last_aion_chat_at).getTime()) / (1000 * 60 * 60 * 24)))
          : '∞',
        hours_since_buzz: stats.last_buzz_at
          ? String(Math.floor((now.getTime() - new Date(stats.last_buzz_at).getTime()) / (1000 * 60 * 60)))
          : '24+',
        // Event data
        ...event_data
      };

      const renderedTitle = renderTemplate(selectedTemplate.title, variables);
      const renderedBody = renderTemplate(selectedTemplate.body, variables);

      // Send notification
      const payload = JSON.stringify({
        title: renderedTitle,
        body: renderedBody,
        icon: '/icons/192.png',
        badge: '/icons/72.png',
        tag: `smart-push-${selectedTemplate.template_key}`,
        data: {
          url: selectedTemplate.deeplink,
          template_key: selectedTemplate.template_key,
          category: selectedTemplate.category
        }
      });

      for (const sub of userSubs) {
        try {
          const keys = sub.keys || {};
          const p256dh = keys.p256dh || sub.p256dh;
          const auth = keys.auth || sub.auth;

          if (!p256dh || !auth || !sub.endpoint) continue;

          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh, auth } },
            payload
          );
          sentCount++;
        } catch (error: any) {
          // Handle expired subscriptions
          if (error.statusCode === 410) {
            await supabase
              .from('webpush_subscriptions')
              .update({ is_active: false })
              .eq('id', sub.id);
          }
        }
      }

      // Log the notification
      logsToInsert.push({
        user_id: user.id,
        template_key: selectedTemplate.template_key,
        title_sent: renderedTitle,
        body_sent: renderedBody,
        deeplink: selectedTemplate.deeplink
      });
    }

    // Insert logs
    if (logsToInsert.length > 0) {
      await supabase.from('smart_push_log').insert(logsToInsert);
    }

    console.log(`🧠 [SMART-PUSH] Complete: sent=${sentCount}, skipped=${skippedCount}`);

    return json({
      success: true,
      stats: {
        templates_checked: eligibleTemplates.length,
        users_processed: users.length,
        notifications_sent: sentCount,
        users_skipped: skippedCount
      }
    });

  } catch (error: any) {
    console.error('❌ [SMART-PUSH] Error:', error);
    return json({ success: false, error: error.message }, 500);
  }
});

function renderTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™



