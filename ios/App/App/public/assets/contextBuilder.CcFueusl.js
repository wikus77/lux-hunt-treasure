import { s as supabase } from './index.BEQCqgv7.js';
import './three-vendor.B3e0mz6d.js';
import './react-vendor.CAU3V3le.js';
import './ui-vendor.CkkPodTS.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
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
  }
}
async function buildNorahContext() {
  const cached = getCachedAgent();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
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
