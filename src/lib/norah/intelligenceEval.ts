// © 2025 Joseph MULÉ – M1SSION™ – Intelligence Evaluation Questions

export interface IntelligenceQuestion {
  query: string;
  category: string;
  expected_keywords: string[];
  contextual_reasoning_check: string; // What cross-module understanding we expect
}

export const INTELLIGENCE_EVAL_QUESTIONS: IntelligenceQuestion[] = [
  // Buzz Map System (5 questions)
  {
    query: "Come funziona il sistema BUZZ Map e come interagisce con Supabase Realtime?",
    category: "Buzz Map",
    expected_keywords: ["buzz", "map", "supabase", "realtime", "geolocation", "radius"],
    contextual_reasoning_check: "Should connect Buzz Map pricing with real-time updates"
  },
  {
    query: "Come viene calcolato il prezzo dinamico BUZZ e il radius di ricerca?",
    category: "Buzz Map",
    expected_keywords: ["pricing", "buzz", "radius", "dynamic", "subscription", "tier"],
    contextual_reasoning_check: "Should explain pricing tiers and radius correlation"
  },
  {
    query: "Quali sono i reward e i bonus XP del sistema BUZZ?",
    category: "Buzz Map",
    expected_keywords: ["reward", "xp", "buzz", "bonus", "leaderboard"],
    contextual_reasoning_check: "Should link XP to leaderboard progression"
  },
  {
    query: "Come funziona la mappa BUZZ con i marker geografici?",
    category: "Buzz Map",
    expected_keywords: ["map", "marker", "geolocation", "latitude", "longitude", "distance"],
    contextual_reasoning_check: "Should explain geolocation and marker placement"
  },
  {
    query: "Qual è la logica antiforcing del BUZZ per evitare abusi?",
    category: "Buzz Map",
    expected_keywords: ["antiforcing", "abuse", "cooldown", "rate", "limit"],
    contextual_reasoning_check: "Should connect cooldowns with subscription tiers"
  },

  // Push SAFE Guard (5 questions)
  {
    query: "Come funziona il Push SAFE Guard e perché è necessario?",
    category: "Push SAFE Guard",
    expected_keywords: ["push", "safe", "guard", "vapid", "notification", "security"],
    contextual_reasoning_check: "Should explain VAPID key protection and prebuild checks"
  },
  {
    query: "Qual è il flusso di notifiche push per iOS PWA vs Android?",
    category: "Push SAFE Guard",
    expected_keywords: ["ios", "pwa", "android", "fcm", "apns", "notification"],
    contextual_reasoning_check: "Should differentiate iOS fallback vs native Android push"
  },
  {
    query: "Come vengono gestite le vibrazioni aptiche nelle notifiche?",
    category: "Push SAFE Guard",
    expected_keywords: ["haptic", "vibration", "notification", "pattern", "buzz"],
    contextual_reasoning_check: "Should connect haptics to notification types"
  },
  {
    query: "Come il sistema push interagisce con Supabase Edge Functions?",
    category: "Push SAFE Guard",
    expected_keywords: ["edge", "function", "supabase", "push", "trigger", "delivery"],
    contextual_reasoning_check: "Should explain edge function role in push delivery"
  },
  {
    query: "Quali sono le politiche di privacy GDPR per le notifiche push?",
    category: "Push SAFE Guard",
    expected_keywords: ["gdpr", "privacy", "consent", "push", "token", "storage"],
    contextual_reasoning_check: "Should link GDPR consent to push subscription flow"
  },

  // Haptics (3 questions)
  {
    query: "Come vengono implementati i pattern di vibrazione aptica?",
    category: "Haptics",
    expected_keywords: ["haptic", "vibration", "pattern", "api", "navigator"],
    contextual_reasoning_check: "Should explain Vibration API usage"
  },
  {
    query: "Quali eventi trigger la vibrazione aptica in M1SSION?",
    category: "Haptics",
    expected_keywords: ["trigger", "event", "buzz", "notification", "leaderboard", "mission"],
    contextual_reasoning_check: "Should list all haptic trigger points"
  },
  {
    query: "Come viene gestita la compatibilità cross-browser per l'aptica?",
    category: "Haptics",
    expected_keywords: ["browser", "compatibility", "fallback", "vibration", "support"],
    contextual_reasoning_check: "Should explain feature detection and fallbacks"
  },

  // Missions & Clues (5 questions)
  {
    query: "Come funziona il sistema delle missioni settimanali?",
    category: "Missions",
    expected_keywords: ["mission", "weekly", "clue", "week", "rotation"],
    contextual_reasoning_check: "Should explain 4-week rotation cycle"
  },
  {
    query: "Qual è la logica antiforcing per le missioni?",
    category: "Missions",
    expected_keywords: ["antiforcing", "mission", "cooldown", "limit", "attempts"],
    contextual_reasoning_check: "Should connect mission limits to subscription tiers"
  },
  {
    query: "Come vengono distribuiti i premi delle missioni?",
    category: "Missions",
    expected_keywords: ["prize", "reward", "mission", "tier", "distribution"],
    contextual_reasoning_check: "Should link prizes to subscription levels"
  },
  {
    query: "Come funziona il Final Shot e quando si attiva?",
    category: "Missions",
    expected_keywords: ["final", "shot", "mission", "activation", "prize"],
    contextual_reasoning_check: "Should explain Final Shot trigger conditions"
  },
  {
    query: "Come vengono sincronizzate le missioni con il database Supabase?",
    category: "Missions",
    expected_keywords: ["supabase", "sync", "mission", "realtime", "database"],
    contextual_reasoning_check: "Should explain realtime updates for missions"
  },

  // Scheduler & Cron (3 questions)
  {
    query: "Come funziona lo Scheduler automatico di Norah AI?",
    category: "Scheduler",
    expected_keywords: ["scheduler", "cron", "automatic", "daily", "crawl", "embed"],
    contextual_reasoning_check: "Should explain 06:00 UTC crawl and 07:00 UTC embed"
  },
  {
    query: "Quali operazioni vengono eseguite dallo Scheduler giornaliero?",
    category: "Scheduler",
    expected_keywords: ["scheduler", "operation", "ingest", "embed", "kpi", "refresh"],
    contextual_reasoning_check: "Should list all scheduled operations"
  },
  {
    query: "Come il Cron interagisce con le Edge Functions Supabase?",
    category: "Scheduler",
    expected_keywords: ["cron", "edge", "function", "supabase", "trigger", "scheduler"],
    contextual_reasoning_check: "Should explain edge function invocation from cron"
  },

  // Privacy & Security (3 questions)
  {
    query: "Come viene garantita la sicurezza GDPR in M1SSION?",
    category: "Security",
    expected_keywords: ["gdpr", "privacy", "security", "consent", "data", "protection"],
    contextual_reasoning_check: "Should explain consent management and data handling"
  },
  {
    query: "Come vengono protette le VAPID keys nel Push SAFE Guard?",
    category: "Security",
    expected_keywords: ["vapid", "key", "security", "guard", "prebuild", "environment"],
    contextual_reasoning_check: "Should explain VAPID key protection mechanisms"
  },
  {
    query: "Quali misure di sicurezza proteggono i dati utente in Supabase?",
    category: "Security",
    expected_keywords: ["rls", "policy", "supabase", "security", "authentication", "row"],
    contextual_reasoning_check: "Should explain RLS policies and auth"
  },

  // Troubleshooting (3 questions)
  {
    query: "Come risolvere errori di boot nelle Edge Functions?",
    category: "Troubleshooting",
    expected_keywords: ["boot", "error", "edge", "function", "cors", "jwt"],
    contextual_reasoning_check: "Should explain common boot errors and solutions"
  },
  {
    query: "Come debuggare problemi di embedding in Norah AI?",
    category: "Troubleshooting",
    expected_keywords: ["debug", "embedding", "cloudflare", "error", "vector"],
    contextual_reasoning_check: "Should explain embedding troubleshooting steps"
  },
  {
    query: "Come verificare e riparare inconsistenze nel database Norah?",
    category: "Troubleshooting",
    expected_keywords: ["database", "inconsistency", "verify", "repair", "sync"],
    contextual_reasoning_check: "Should explain DB verification procedures"
  },

  // Developer Procedures (3 questions)
  {
    query: "Come si esegue il deploy delle Edge Functions Supabase?",
    category: "Developer",
    expected_keywords: ["deploy", "edge", "function", "supabase", "cli", "production"],
    contextual_reasoning_check: "Should explain deployment workflow"
  },
  {
    query: "Qual è il workflow completo di Norah AI da ingest a RAG?",
    category: "Developer",
    expected_keywords: ["workflow", "ingest", "embed", "rag", "search", "pipeline"],
    contextual_reasoning_check: "Should explain full RAG pipeline"
  },
  {
    query: "Come monitorare le performance di Norah AI in produzione?",
    category: "Developer",
    expected_keywords: ["monitor", "performance", "kpi", "metrics", "production"],
    contextual_reasoning_check: "Should explain monitoring and KPI tracking"
  },
];

export interface IntelligenceMetrics {
  pass1: number;
  pass3: number;
  contextual_reasoning: number;
  semantic_depth: number;
  cross_module_understanding: number;
  intelligence_gain: number;
}

export function calculateIntelligenceMetrics(results: any[]): IntelligenceMetrics {
  const pass1Count = results.filter(r => r.pass1).length;
  const pass3Count = results.filter(r => r.pass3).length;
  
  const pass1 = (pass1Count / results.length) * 100;
  const pass3 = (pass3Count / results.length) * 100;
  
  // Calculate contextual reasoning (how well keywords match)
  const avgKeywordMatch = results.reduce((sum, r) => 
    sum + (r.matchedKeywords.length / r.totalKeywords), 0
  ) / results.length;
  const contextual_reasoning = avgKeywordMatch * 10;
  
  // Calculate semantic depth (how many hits per query)
  const avgHits = results.reduce((sum, r) => sum + r.hits, 0) / results.length;
  const semantic_depth = Math.min(10, (avgHits / 3) * 10);
  
  // Calculate cross-module understanding (citation quality)
  const citationQuality = results.filter(r => r.hasCitation).length / results.length;
  const cross_module_understanding = citationQuality * 10;
  
  // Calculate intelligence gain vs baseline (baseline: 40% pass@1, 60% pass@3)
  const baseline_score = (40 + 60) / 2;
  const current_score = (pass1 + pass3) / 2;
  const intelligence_gain = ((current_score - baseline_score) / baseline_score) * 100;
  
  return {
    pass1,
    pass3,
    contextual_reasoning,
    semantic_depth,
    cross_module_understanding,
    intelligence_gain,
  };
}

export function generateIntelligenceVerdict(metrics: IntelligenceMetrics): string {
  if (metrics.pass1 >= 65 && metrics.pass3 >= 85 && metrics.intelligence_gain > 30) {
    return "SMARTER ✅";
  } else if (metrics.pass1 >= 50 && metrics.pass3 >= 70) {
    return "SAME ⚠️";
  } else {
    return "REGRESSION ❌";
  }
}
