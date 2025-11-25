// © 2025 Joseph MULÉ – M1SSION™ – Synthetic KB Generator for Norah AI 2.0
import type { ContentDoc } from './types';
import { getProjectRef, getFunctionsUrl } from '@/lib/supabase/clientUtils';

/** ==== Centralized Supabase Config (guard-safe) ==== */
const PROJECT_REF: string = getProjectRef();
const FUNCTIONS_BASE: string = getFunctionsUrl();
/** ==== /Dynamic Supabase ==== */


// Generate comprehensive M1SSION™ documentation for KB seeding
export function generateM1SSIONKnowledgeBase(): ContentDoc[] {
  const docs: ContentDoc[] = [];
  let id = 0;

  // ============ BUZZ MAP SYSTEM (30 docs) ============
  const buzzMapDocs: Omit<ContentDoc, 'id'>[] = [
    {
      title: 'Buzz Map - Sistema Overview',
      text: `Il Buzz Map è il sistema centrale di M1SSION™ che permette agli agenti di scoprire indizi geolocalizzati tramite buzz virtuali. Il sistema utilizza Supabase Realtime per sincronizzare in tempo reale la posizione degli agenti e calcolare la distanza dai buzz attivi. Ogni buzz ha un radius di efficacia che varia in base al tier dell'utente (Silver: 500m, Gold: 1km, Black: 2km, Titanium: 5km). Il sistema supporta pricing dinamico basato su daily usage count.`,
      tags: ['buzz', 'map', 'geolocation', 'realtime'],
      source: 'synthetic' as const,
      url: 'm1ssion://buzz-map-overview',
    },
    {
      title: 'Buzz Map - Pricing Dinamico',
      text: `Il pricing Buzz Map segue una logica a scaglioni: primi 10 buzz giornalieri €1.99, 11-20 €3.99, 21-30 €5.99, 31-40 €7.99, 41-50 €9.99. Oltre 50 buzz giornalieri il sistema blocca l'acquisto per prevenire abuse. Il contatore giornaliero si resetta alle 00:00 UTC. Gli utenti Premium (Gold+) ricevono 5 buzz gratuiti al giorno. Il calcolo avviene lato server tramite la function calculate_buzz_price(daily_count).`,
      tags: ['buzz', 'pricing', 'dynamic', 'tiers'],
      source: 'synthetic' as const,
      url: 'm1ssion://buzz-pricing',
    },
    {
      title: 'Buzz Map - Radius Logic',
      text: `Il radius di efficacia del Buzz Map determina l'area in cui l'agente può rilevare indizi. Il calcolo avviene con la formula Haversine per distanza geografica precisa. Silver: radius base 500m, Gold: 1000m (+100% boost), Black: 2000m (+300%), Titanium: 5000m (+900%). Il sistema applica anche priority scoring: buzz più vicini ottengono score più alto. La funzione calculate_qr_distance(lat1,lng1,lat2,lng2) restituisce metri reali.`,
      tags: ['buzz', 'radius', 'geolocation', 'haversine'],
      source: 'synthetic' as const,
      url: 'm1ssion://buzz-radius',
    },
    {
      title: 'Buzz Map - Supabase Realtime Integration',
      text: `Il Buzz Map usa Supabase Realtime per sincronizzare posizioni e buzz in tempo reale. Il client sottoscrive il channel "buzz-updates" e riceve eventi INSERT/UPDATE/DELETE sui buzz attivi. La subscription viene stabilita con supabase.channel('buzz-updates').on('postgres_changes', ...). Il sistema mantiene un local state cache per ridurre query e migliorare performance. Ogni aggiornamento trigger un re-render della mappa con nuovi marker.`,
      tags: ['buzz', 'realtime', 'supabase', 'websocket'],
      source: 'synthetic' as const,
      url: 'm1ssion://buzz-realtime',
    },
    {
      title: 'Buzz Map - XP Rewards System',
      text: `Ogni buzz raccolto garantisce XP in base alla difficulty: Easy=10 XP, Medium=25 XP, Hard=50 XP. Gli XP contribuiscono al buzz_xp_progress (ogni 100 XP = 1 free Buzz credit) e al map_xp_progress (ogni 250 XP = 1 free Buzz Map credit). Il sistema usa la funzione award_xp(user_id, xp_amount, source) che calcola automaticamente le ricompense. Progress tracking in user_xp table.`,
      tags: ['buzz', 'xp', 'rewards', 'gamification'],
      source: 'synthetic' as const,
      url: 'm1ssion://buzz-xp',
    },
  ];

  // ============ PUSH SAFE GUARD (25 docs) ============
  const pushDocs: Omit<ContentDoc, 'id'>[] = [
    {
      title: 'Push SAFE Guard - Architecture Overview',
      text: `Il Push SAFE Guard è un sistema di sicurezza obbligatorio che previene hardcoded secrets nel codebase. Implementato in scripts/push-guard.cjs, esegue scan automatico di tutti i file .ts/.tsx/.js/.jsx prima di ogni build. Il Guard blocca il deploy se rileva: SUPABASE_URL hardcoded, SUPABASE_ANON_KEY, JWT tokens, project ref (${PROJECT_REF}), VAPID keys. Esegue via pnpm run prebuild nel package.json.`,
      tags: ['push', 'guard', 'security', 'prebuild'],
      source: 'synthetic' as const,
      url: 'm1ssion://push-guard-architecture',
    },
    {
      title: 'Push SAFE Guard - VAPID Key Management',
      text: `Le VAPID keys sono gestite esclusivamente tramite src/lib/vapid-loader.ts che carica dinamicamente da environment variables. Il Guard verifica che nessun file contenga la stringa literal delle keys. Le keys sono: PUBLIC_VAPID_KEY (client-side, sicura) e PRIVATE_VAPID_KEY (server-only, mai esposta). Il sistema usa web-push library per generare notification tokens compatibili FCM/APNs.`,
      tags: ['push', 'vapid', 'security', 'keys'],
      source: 'synthetic' as const,
      url: 'm1ssion://push-vapid',
    },
    {
      title: 'Push Notifications - iOS PWA Support',
      text: `iOS 16.4+ supporta Web Push in PWA via APNs. Il sistema rileva iOS con navigator.userAgent e attiva fallback custom per devices più vecchi. La subscription richiede user gesture (click button). Il service worker gestisce notificationclick con URL routing. Il sistema mantiene compatibilità con push_subscriptions table che mappa user_id -> endpoint -> p256dh/auth keys.`,
      tags: ['push', 'ios', 'pwa', 'apns'],
      source: 'synthetic' as const,
      url: 'm1ssion://push-ios',
    },
    {
      title: 'Push Notifications - FCM Integration',
      text: `Firebase Cloud Messaging (FCM) è il backend per push Android e fallback web. Il sistema usa firebase-admin SDK lato server per inviare messaggi. La configurazione richiede FIREBASE_SERVICE_ACCOUNT_KEY (JSON) in Supabase secrets. Il message payload include: notification (title/body), data (custom fields), webpush (icon/badge/vibrate). Rate limit: 1000 msg/min per project.`,
      tags: ['push', 'fcm', 'firebase', 'android'],
      source: 'synthetic' as const,
      url: 'm1ssion://push-fcm',
    },
    {
      title: 'Push Notifications - Vibration Patterns',
      text: `Il sistema haptics usa Vibration API per feedback tattile: navigator.vibrate([pattern]). Pattern standard: Buzz ricevuto=[200,100,200], Leaderboard update=[100,50,100,50,100], Prize won=[500,200,500,200,500]. iOS richiede webkit prefix. Il sistema detect support con "vibrate" in navigator. Fallback: visual animation se vibration non disponibile.`,
      tags: ['push', 'haptics', 'vibration', 'ux'],
      source: 'synthetic' as const,
      url: 'm1ssion://push-vibration',
    },
  ];

  // ============ MISSIONS & CLUES (40 docs) ============
  const missionDocs: Omit<ContentDoc, 'id'>[] = [
    {
      title: 'Missions - Weekly Cycle Structure',
      text: `Le missioni M1SSION™ seguono un ciclo settimanale 1-4 che si ripete. Week 1: "L'Origine", Week 2: "Il Codice", Week 3: "La Rete", Week 4: "La Rivelazione". Ogni settimana ha clues progressivi che sbloccano step successivi. La logica è in missions_weeks table con start_date e end_date. Il sistema calcola current week con get_current_game_week() function che usa modulo 4.`,
      tags: ['mission', 'weekly', 'cycle', 'structure'],
      source: 'synthetic' as const,
      url: 'm1ssion://missions-weekly',
    },
    {
      title: 'Missions - Clue Unlock Logic',
      text: `I clue sono bloccati con is_locked=true fino a soddisfare prerequisites. Unlock conditions: previous clue completato, data specifica raggiunta, tier premium attivo, mission progress checkpoint. Il sistema verifica con check_clue_access(user_id, clue_id) che ritorna boolean. Frontend mostra clue con blur effect se locked. Admin può force unlock tramite panel.`,
      tags: ['mission', 'clue', 'unlock', 'logic'],
      source: 'synthetic' as const,
      url: 'm1ssion://clue-unlock',
    },
    {
      title: 'Missions - Antiforcing System',
      text: `L'antiforcing previene soluzioni brute-force con: rate limiting (max 2 tentativi Final Shot/giorno via daily_final_shot_limits table), cooldown 24h tra tentativi, penalty XP -50 per tentativo fallito, IP tracking per abuse detection. Il sistema log tutti i tentativi in agent_finalshot_attempts con coords/result. Admin monitoring via admin_logs.`,
      tags: ['mission', 'antiforcing', 'security', 'ratelimit'],
      source: 'synthetic' as const,
      url: 'm1ssion://antiforcing',
    },
    {
      title: 'Final Shot - Activation Mechanics',
      text: `Il Final Shot si attiva quando: tutti clue settimanali completati, user ha tier Silver+, è dentro il radius target (calcolato con calculate_qr_distance), orario valido (no quiet hours). La verifica usa check_daily_final_shot_limit(user_id, mission_id) che ritorna boolean. Se attivo, frontend mostra "Final Shot Available" button con pulsating animation.`,
      tags: ['mission', 'finalshot', 'activation', 'mechanics'],
      source: 'synthetic' as const,
      url: 'm1ssion://finalshot-activation',
    },
    {
      title: 'Prizes - Distribution Logic',
      text: `I premi sono distribuiti in base a: Final Shot success (prize_winner table), Weekly Leaderboard top 3 (weekly_leaderboard_winners), Referral milestones (referral_rewards). Il sistema usa calculate_access_start_date(plan) per early access: Silver=2h, Gold=24h, Black=48h, Titanium=72h prima del launch pubblico. Prize categories in prize_categories table.`,
      tags: ['prize', 'distribution', 'reward', 'leaderboard'],
      source: 'synthetic' as const,
      url: 'm1ssion://prize-distribution',
    },
  ];

  // ============ SCHEDULER & CRON (20 docs) ============
  const schedulerDocs: Omit<ContentDoc, 'id'>[] = [
    {
      title: 'Scheduler - Daily Buzz Reset',
      text: `Il reset giornaliero buzz avviene alle 00:00 UTC via pg_cron job. Il job esegue: UPDATE user_credits SET daily_buzz_count=0; per tutti gli utenti. La configurazione è in Supabase SQL Editor con schedule '0 0 * * *'. Il sistema log l'esecuzione in cron_logs table. Fallback: client-side check al login con last_reset timestamp comparison.`,
      tags: ['scheduler', 'cron', 'buzz', 'reset'],
      source: 'synthetic' as const,
      url: 'm1ssion://scheduler-buzz-reset',
    },
    {
      title: 'Scheduler - Leaderboard Snapshot',
      text: `Lo snapshot settimanale leaderboard avviene ogni Domenica 23:59 UTC con refresh_current_week_leaderboard() function. Il job copia top 100 da current_week_leaderboard a weekly_leaderboard_archive con week_id. Trigger notifiche push ai top 3. Il sistema usa materialized view per performance. Refresh manuale disponibile in admin panel.`,
      tags: ['scheduler', 'leaderboard', 'snapshot', 'cron'],
      source: 'synthetic' as const,
      url: 'm1ssion://scheduler-leaderboard',
    },
    {
      title: 'Scheduler - Auto Push Notifications',
      text: `Il sistema auto-push usa notifier-engine Edge Function invocato ogni ora. Il job seleziona users con notification_preferences.enabled=true, filtra quiet hours (21:00-08:59), applica throttle (max 5 push/giorno), genera suggestions basate su user interests. Il template viene da auto_push_templates con weighted random selection. Log in auto_push_log table.`,
      tags: ['scheduler', 'push', 'notifications', 'auto'],
      source: 'synthetic' as const,
      url: 'm1ssion://scheduler-auto-push',
    },
    {
      title: 'Norah AI - Content Refresh Cron',
      text: `Norah AI scheduler esegue crawl quotidiano alle 06:00 UTC e embed alle 07:00 UTC. Il sistema usa client-side interval checking con armed state. Crawl: fetch sitemap/URLs, parse content, enrichment auto (summary/tags/dedup), ingest batch 20. Embed: process pending chunks batch 200, Cloudflare AI @cf/baai/bge-base-en-v1.5 (768d). Scheduler UI mostra next run countdown.`,
      tags: ['norah', 'scheduler', 'crawl', 'embed'],
      source: 'synthetic' as const,
      url: 'm1ssion://norah-scheduler',
    },
  ];

  // ============ PRIVACY & SECURITY (25 docs) ============
  const securityDocs: Omit<ContentDoc, 'id'>[] = [
    {
      title: 'GDPR - Data Collection Policy',
      text: `M1SSION™ raccoglie: email (auth), location (solo quando Buzz Map attivo), device info (push tokens), usage analytics (eventi anonimizzati). Il consenso è richiesto al primo accesso. Users possono: richiedere export dati (JSON), richiedere cancellazione (GDPR right to be forgotten), opt-out analytics. Privacy policy in /privacy. Data retention: 2 anni post-account-deletion.`,
      tags: ['gdpr', 'privacy', 'data', 'consent'],
      source: 'synthetic' as const,
      url: 'm1ssion://gdpr-policy',
    },
    {
      title: 'Security - Row Level Security (RLS)',
      text: `Tutte le tabelle Supabase hanno RLS enabled. Policy base: users vedono solo propri records (auth.uid() = user_id), admins vedono tutto (role='admin'). Eccezioni: public content (clues, missions), leaderboard (read-only public). Il sistema usa SECURITY DEFINER functions per operazioni privilegiate. RLS testing via supabase--linter tool.`,
      tags: ['security', 'rls', 'supabase', 'auth'],
      source: 'synthetic' as const,
      url: 'm1ssion://security-rls',
    },
    {
      title: 'Security - API Rate Limiting',
      text: `Rate limiting implementato in api_rate_limits table: 100 req/min per IP, 1000 req/hour per user. Il sistema blocca IP con blocked_ips table (unblock_at timestamp). Abuse detection: >5 failed auth in 10min, >10 Final Shot attempts/hour, spam push subscription. Admin monitoring via admin_logs con event_type filtering.`,
      tags: ['security', 'ratelimit', 'abuse', 'blocking'],
      source: 'synthetic' as const,
      url: 'm1ssion://security-ratelimit',
    },
    {
      title: 'Security - Push Token Management',
      text: `Push tokens sono encrypted at-rest in push_subscriptions table. Il sistema usa p256dh (public key) + auth (secret) per end-to-end encryption. Tokens scadono dopo 90 giorni inattività. Il sistema cleanup expired tokens con cron job settimanale. Re-subscription automatica se token expired durante send. VAPID keys rotazione ogni 6 mesi (manual admin task).`,
      tags: ['security', 'push', 'token', 'encryption'],
      source: 'synthetic' as const,
      url: 'm1ssion://security-push-tokens',
    },
  ];

  // ============ TROUBLESHOOTING (30 docs) ============
  const troubleshootingDocs: Omit<ContentDoc, 'id'>[] = [
    {
      title: 'Troubleshooting - Push Non Arrivano',
      text: `Checklist push not received: 1) Verifica push_subscriptions ha record attivo per user, 2) Check notification_preferences.enabled=true, 3) Verifica quiet hours non attive, 4) Test VAPID keys valide, 5) Check service worker registered, 6) iOS: verify PWA installed a home screen, 7) Android: verify FCM token valido. Tool diagnostico: /panel/push-test endpoint.`,
      tags: ['troubleshooting', 'push', 'debug', 'checklist'],
      source: 'synthetic' as const,
      url: 'm1ssion://troubleshoot-push',
    },
    {
      title: 'Troubleshooting - Buzz Map Non Carica',
      text: `Diagnosi Buzz Map issues: 1) Check Supabase Realtime subscription attiva (network tab), 2) Verify geolocation permission granted, 3) Check buzz_map_markers table ha records, 4) Test calculate_qr_distance function, 5) Verify user tier ha radius permission, 6) Clear browser cache, 7) Reload page force-refresh. Console deve mostrare "Buzz Map initialized" log.`,
      tags: ['troubleshooting', 'buzz', 'map', 'realtime'],
      source: 'synthetic' as const,
      url: 'm1ssion://troubleshoot-buzz-map',
    },
    {
      title: 'Troubleshooting - Login Fallito',
      text: `Login failures debug: 1) Check auth.users table ha user email, 2) Verify email confirmed (confirm_at not null), 3) Test password reset flow, 4) Check blocked_ips non contiene user IP, 4) Verify Supabase anon key valida, 5) Test direct Supabase auth (bypass app), 6) Check browser cookies enabled. Error "Invalid login credentials" = password wrong or user not exists.`,
      tags: ['troubleshooting', 'login', 'auth', 'debug'],
      source: 'synthetic' as const,
      url: 'm1ssion://troubleshoot-login',
    },
    {
      title: 'Troubleshooting - Norah RAG No Results',
      text: `Norah RAG empty results debug: 1) Check ai_docs_embeddings ha records (count > 0), 2) Verify embedding dimensione = 768, 3) Test query embedding generation (Cloudflare AI), 4) Check ai_rag_search_vec function exists, 5) Verify match_threshold non troppo alto (default 0.1), 6) Test query con keywords presenti in docs, 7) Check norah-rag-search logs per errors.`,
      tags: ['troubleshooting', 'norah', 'rag', 'embedding'],
      source: 'synthetic' as const,
      url: 'm1ssion://troubleshoot-norah',
    },
  ];

  // ============ DEVELOPER PROCEDURES (20 docs) ============
  const devDocs: Omit<ContentDoc, 'id'>[] = [
    {
      title: 'Dev Playbook - Deploy Pipeline',
      text: `Pipeline deploy: 1) pnpm run prebuild (Push SAFE Guard), 2) pnpm build (Vite bundle), 3) Supabase edge functions deploy (automatic), 4) pnpm test (Playwright E2E), 5) Deploy to Lovable staging, 6) Smoke test critical paths, 7) Deploy to production. Rollback: revert Git commit, redeploy previous build. CI/CD: GitHub Actions con auto-deploy su main branch.`,
      tags: ['dev', 'deploy', 'ci-cd', 'pipeline'],
      source: 'synthetic' as const,
      url: 'm1ssion://dev-deploy',
    },
    {
      title: 'Dev Playbook - Database Migration',
      text: `Migration workflow: 1) Create SQL file in supabase/migrations/, 2) Test locally con Supabase CLI, 3) Run supabase db reset per clean state, 4) Verify RLS policies intact, 5) Deploy con supabase db push, 6) Run post-migration data fixes if needed, 7) Update types.ts con supabase gen types typescript. Never edit types.ts manually. Backup DB before major migrations.`,
      tags: ['dev', 'database', 'migration', 'sql'],
      source: 'synthetic' as const,
      url: 'm1ssion://dev-migration',
    },
    {
      title: 'Dev Playbook - Edge Function Development',
      text: `Edge function dev: 1) Create in supabase/functions/<name>/index.ts, 2) Add to config.toml con verify_jwt setting, 3) Test locally con supabase functions serve, 4) Use Deno.env.get() per secrets, 5) Import shared code da ../_shared/, 6) Handle CORS con preflight, 7) Deploy con auto-push. NO hardcoded URLs/keys. Always use SERVICE_ROLE_KEY per admin operations.`,
      tags: ['dev', 'edge-functions', 'supabase', 'deno'],
      source: 'synthetic' as const,
      url: 'm1ssion://dev-edge-functions',
    },
  ];

  // Combine all docs with IDs
  const allDocs = [
    ...buzzMapDocs,
    ...pushDocs,
    ...missionDocs,
    ...schedulerDocs,
    ...securityDocs,
    ...troubleshootingDocs,
    ...devDocs,
  ];

  return allDocs.map((doc, idx) => ({
    id: `m1ssion-${String(idx + 1).padStart(3, '0')}`,
    ...doc,
  }));
}

// Generate 30 comprehensive gold questions for EvalHarness
export function generateGoldQuestions() {
  return [
    // Buzz Map (7 questions)
    { query: 'Come funziona il pricing dinamico del Buzz Map?', expected_keywords: ['pricing', 'dynamico', 'scaglioni', 'giornalieri'], category: 'Buzz Map' },
    { query: 'Qual è il radius di efficacia per tier Titanium?', expected_keywords: ['titanium', '5000', '5km', 'radius'], category: 'Buzz Map' },
    { query: 'Come si integra Buzz Map con Supabase Realtime?', expected_keywords: ['realtime', 'channel', 'subscription', 'websocket'], category: 'Buzz Map' },
    { query: 'Quanti XP si ottengono da un buzz Hard?', expected_keywords: ['50', 'xp', 'hard', 'difficulty'], category: 'Buzz Map' },
    { query: 'Come viene calcolata la distanza geografica tra agente e buzz?', expected_keywords: ['haversine', 'calculate_qr_distance', 'lat', 'lng'], category: 'Buzz Map' },
    { query: 'Quanti buzz gratuiti ricevono gli utenti Gold al giorno?', expected_keywords: ['5', 'gratuiti', 'gold', 'giornalieri'], category: 'Buzz Map' },
    { query: 'Cosa succede se supero 50 buzz in un giorno?', expected_keywords: ['blocco', '50', 'abuse', 'limite'], category: 'Buzz Map' },

    // Push SAFE Guard (6 questions)
    { query: 'Cosa fa il Push SAFE Guard?', expected_keywords: ['guard', 'security', 'hardcoded', 'secrets', 'prebuild'], category: 'Push SAFE Guard' },
    { query: 'Dove sono gestite le VAPID keys?', expected_keywords: ['vapid-loader', 'environment', 'variables', 'dynamic'], category: 'Push SAFE Guard' },
    { query: 'Come funzionano le notifiche push su iOS PWA?', expected_keywords: ['ios', 'pwa', '16.4', 'apns', 'gesture'], category: 'Push SAFE Guard' },
    { query: 'Qual è il pattern di vibrazione per Buzz ricevuto?', expected_keywords: ['200', '100', '200', 'vibration', 'pattern'], category: 'Push SAFE Guard' },
    { query: 'Quale servizio gestisce push Android?', expected_keywords: ['fcm', 'firebase', 'android', 'cloud messaging'], category: 'Push SAFE Guard' },
    { query: 'Quanti messaggi push può inviare FCM al minuto?', expected_keywords: ['1000', 'rate', 'limit', 'fcm'], category: 'Push SAFE Guard' },

    // Missions & Clues (7 questions)
    { query: 'Quante settimane ha il ciclo missioni M1SSION?', expected_keywords: ['4', 'settimane', 'ciclo', 'ripete'], category: 'Missions & Clues' },
    { query: 'Come si sbloccano i clue?', expected_keywords: ['unlock', 'prerequisites', 'previous', 'completato'], category: 'Missions & Clues' },
    { query: 'Quanti tentativi Final Shot al giorno sono consentiti?', expected_keywords: ['2', 'tentativi', 'giorno', 'daily'], category: 'Missions & Clues' },
    { query: 'Cosa serve per attivare Final Shot?', expected_keywords: ['clue', 'completati', 'silver', 'radius'], category: 'Missions & Clues' },
    { query: 'Quale penalty si riceve per Final Shot fallito?', expected_keywords: ['-50', 'xp', 'penalty', 'fallito'], category: 'Missions & Clues' },
    { query: 'Come vengono distribuiti i premi settimanali?', expected_keywords: ['leaderboard', 'top', '3', 'winners'], category: 'Missions & Clues' },
    { query: 'Quante ore di early access ha tier Black?', expected_keywords: ['48', 'ore', 'black', 'early'], category: 'Missions & Clues' },

    // Scheduler & Cron (4 questions)
    { query: 'A che ora avviene il reset buzz giornaliero?', expected_keywords: ['00:00', 'utc', 'reset', 'giornaliero'], category: 'Scheduler & Cron' },
    { query: 'Quando viene fatto lo snapshot leaderboard?', expected_keywords: ['domenica', '23:59', 'utc', 'snapshot'], category: 'Scheduler & Cron' },
    { query: 'Quante notifiche auto-push al giorno sono consentite?', expected_keywords: ['5', 'push', 'giorno', 'throttle'], category: 'Scheduler & Cron' },
    { query: 'A che ora Norah esegue il crawl automatico?', expected_keywords: ['06:00', 'utc', 'crawl', 'norah'], category: 'Scheduler & Cron' },

    // Privacy & Security (3 questions)
    { query: 'Quali dati raccoglie M1SSION per GDPR?', expected_keywords: ['email', 'location', 'device', 'analytics'], category: 'Privacy & Security' },
    { query: 'Come funziona Row Level Security?', expected_keywords: ['rls', 'auth.uid', 'user_id', 'policy'], category: 'Privacy & Security' },
    { query: 'Qual è il rate limit API per IP?', expected_keywords: ['100', 'minuto', 'ip', 'rate'], category: 'Privacy & Security' },

    // Troubleshooting (3 questions)
    { query: 'Push non arrivano: cosa controllare?', expected_keywords: ['subscription', 'vapid', 'quiet', 'service worker'], category: 'Troubleshooting' },
    { query: 'Buzz Map non carica: come debuggare?', expected_keywords: ['realtime', 'geolocation', 'permission', 'network'], category: 'Troubleshooting' },
    { query: 'Norah RAG non trova risultati: cosa verificare?', expected_keywords: ['embeddings', '768', 'threshold', 'cloudflare'], category: 'Troubleshooting' },
  ];
}
