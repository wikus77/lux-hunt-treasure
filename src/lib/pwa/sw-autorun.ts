import { ensureSWAnyHost } from "@/lib/pwa/sw-register-anyhost";
try { ensureSWAnyHost(); } catch (e) { /* noop */ }
