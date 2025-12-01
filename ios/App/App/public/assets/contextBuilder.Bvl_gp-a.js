import { s as supabase } from './index.B1pZJRDR.js';
import './three-vendor.wwSanNQ8.js';
import './react-vendor.CAU3V3le.js';
import './ui-vendor.DoN6OTIp.js';
import './supabase-vendor.CghLtY7N.js';
import './animation-vendor.Bezovbgp.js';
import './map-vendor.Dz2XYzxS.js';
import './stripe-vendor.BaJG9Xy1.js';
import './router-vendor.opNAzTki.js';

const CACHE_KEY = "norah_agent_cache";
const CACHE_TTL = 6 * 60 * 60 * 1e3;
function getCachedAgent() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached);
    const now = Date.now();
    if (now - data.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
function setCachedAgent(code, username) {
  try {
    const data = {
      code,
      username,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("[Norah] Failed to cache agent:", error);
  }
}
async function buildNorahContext() {
  const cached = getCachedAgent();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      console.warn("[Norah] No session token available");
      if (cached) {
        return {
          agent: { code: cached.code, username: cached.username },
          mission: null,
          stats: { clues: 0, buzz_today: 0, finalshot_today: 0 },
          clues: [],
          finalshot_recent: [],
          recent_msgs: []
        };
      }
      throw new Error("No authentication token");
    }
    const { data, error } = await supabase.functions.invoke("get-norah-context", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-client-version": "norah-v6.6"
      }
    });
    if (error) {
      console.warn("[Norah] Edge function error:", error);
      if (cached) {
        console.log("[Norah] Using cached agent due to edge error");
        return {
          agent: { code: cached.code, username: cached.username },
          mission: null,
          stats: { clues: 0, buzz_today: 0, finalshot_today: 0 },
          clues: [],
          finalshot_recent: [],
          recent_msgs: []
        };
      }
      throw error;
    }
    const normalized = {
      agent: {
        code: data?.agent?.code || cached?.code || "AG-UNKNOWN",
        username: data?.agent?.username || cached?.username || null
      },
      mission: data?.mission || null,
      stats: {
        clues: data?.stats?.clues || 0,
        buzz_today: data?.stats?.buzz_today || 0,
        finalshot_today: data?.stats?.finalshot_today || 0
      },
      clues: data?.clues || [],
      finalshot_recent: data?.finalshot_recent || [],
      recent_msgs: data?.recent_msgs || []
    };
    if (normalized.agent.code && normalized.agent.code !== "AG-UNKNOWN") {
      setCachedAgent(normalized.agent.code, normalized.agent.username);
    }
    return normalized;
  } catch (error) {
    console.error("[Norah] Context build failed:", error);
    return {
      agent: cached ? { code: cached.code, username: cached.username } : { code: "AG-UNKNOWN", username: null },
      mission: null,
      stats: { clues: 0, buzz_today: 0, finalshot_today: 0 },
      clues: [],
      finalshot_recent: [],
      recent_msgs: []
    };
  }
}

export { buildNorahContext };
