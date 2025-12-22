const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index.BEQCqgv7.js","assets/three-vendor.B3e0mz6d.js","assets/react-vendor.CAU3V3le.js","assets/ui-vendor.CkkPodTS.js","assets/supabase-vendor.Be5pfGoK.js","assets/animation-vendor.BBMfCuXy.js","assets/map-vendor.DP0KRNIP.js","assets/stripe-vendor.DYHkqekj.js","assets/router-vendor.opNAzTki.js","assets/index.D6lIHvJk.css"])))=>i.map(i=>d[i]);
import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { c as createLucideIcon, s as supabase, a6 as useToast, B as Button, F as FileText, aL as Map$1, v as Card, A as CardHeader, H as CardTitle, N as CardDescription, O as CardContent, r as Textarea, a4 as LoaderCircle, I as Input, aW as Checkbox, a5 as Badge, bx as getProjectRef, by as getFunctionsUrl, bz as Progress, Z as Zap, aD as Play, V as ScrollArea, e as ue, bA as Brain, T as Target, bB as TrendingUp, bc as CircleCheck, bC as Download, an as CircleX, J as Clock, x as RefreshCw, Q as Activity, ak as CircleCheckBig, ac as Tabs, ad as TabsList, ae as TabsTrigger, af as TabsContent } from './index.BEQCqgv7.js';
import { _ as __vitePreload, c as create } from './three-vendor.B3e0mz6d.js';
import { T as TestTube } from './test-tube.Ck18vXQW.js';
import { P as Pause } from './pause.5qOwhCHd.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const ChartNoAxesColumnIncreasing = createLucideIcon("ChartNoAxesColumnIncreasing", [
  ["line", { x1: "12", x2: "12", y1: "20", y2: "10", key: "1vz5eb" }],
  ["line", { x1: "18", x2: "18", y1: "20", y2: "4", key: "cun8e5" }],
  ["line", { x1: "6", x2: "6", y1: "20", y2: "16", key: "hq0ia6" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Link2 = createLucideIcon("Link2", [
  ["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }],
  ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }],
  ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Upload = createLucideIcon("Upload", [
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["polyline", { points: "17 8 12 3 7 8", key: "t8dd8p" }],
  ["line", { x1: "12", x2: "12", y1: "3", y2: "15", key: "widbto" }]
]);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function normalizeUuid(input) {
  if (typeof input !== "string" || !input) return "";
  let cleaned = input.trim();
  cleaned = cleaned.replace(/^"+|"+$/g, "");
  cleaned = cleaned.replace(/^'+|'+$/g, "");
  cleaned = cleaned.trim();
  if (!UUID_REGEX.test(cleaned)) {
    return "";
  }
  return cleaned;
}
function generateNormalizedUuid() {
  const raw = crypto.randomUUID();
  return normalizeUuid(raw);
}

const ALLOWLIST = [
  /\.m1ssion\.pages\.dev$/i,
  /\.lovableproject\.com$/i,
  /\.lovable\.app$/i,
  /^localhost$/i,
  /^127\.0\.0\.1$/i
];
function isOriginAllowed(origin) {
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    return ALLOWLIST.some((pattern) => pattern.test(host));
  } catch {
    return false;
  }
}
function assertAllowedOrHint(origin) {
  if (!isOriginAllowed(origin)) ;
}
function getCurrentOrigin() {
  return typeof window !== "undefined" ? window.location.origin : "https://m1ssion.pages.dev";
}

const isPreview = typeof window !== "undefined" && window.location.hostname.includes("lovable");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function checkOrigin() {
  if (typeof window === "undefined") return;
  const origin = getCurrentOrigin();
  if (!isOriginAllowed(origin)) {
    assertAllowedOrHint(origin);
    throw new Error("Origin not allowed for Norah Functions. Please use *.m1ssion.pages.dev");
  }
}
function getClientId() {
  try {
    const key = "norah_cid";
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    const valid = normalizeUuid(stored || "");
    if (valid) return valid;
    const fresh = generateNormalizedUuid();
    if (typeof localStorage !== "undefined") localStorage.setItem(key, fresh);
    return fresh;
  } catch {
    return generateNormalizedUuid();
  }
}
function isRetryable(err) {
  const msg = String(err?.message ?? err ?? "").toLowerCase();
  return [
    "failed to fetch",
    "failed to send",
    "networkerror",
    "aborterror",
    "operation was aborted",
    "network request failed"
  ].some((s) => msg.includes(s));
}
async function invokePOST(fn, body, phase) {
  checkOrigin();
  const corr = getClientId();
  const cleanCid = normalizeUuid(corr) || corr;
  if (!cleanCid) {
    throw new Error("Invalid client_id (UUID)");
  }
  const headers = { "x-norah-cid": cleanCid };
  const enrichedBody = { ...body || {}, client_id: cleanCid };
  let delay = 250;
  for (let i = 0; i < 3; i++) {
    try {
      if (isPreview && i > 0) await sleep(400);
      const { data, error } = await supabase.functions.invoke(fn, {
        body: enrichedBody,
        headers
      });
      if (error) throw error;
      if (typeof localStorage !== "undefined" && localStorage.NORAH_DEBUG === "1") {
      }
      return data;
    } catch (e) {
      if (!isRetryable(e) || i === 2) {
        throw e;
      }
      await sleep(delay);
      delay = Math.min(delay * 2, 800);
    }
  }
  throw new Error(`invokePOST fellthrough: ${fn}`);
}
async function getFunctionJSON(path, phase) {
  checkOrigin();
  const { getFunctionsUrl, getSupabaseAnonKey } = await __vitePreload(async () => { const { getFunctionsUrl, getSupabaseAnonKey } = await import('./index.BEQCqgv7.js').then(n => n.bV);return { getFunctionsUrl, getSupabaseAnonKey }},true?__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]):void 0);
  const url = `${getFunctionsUrl()}/${path}`;
  const key = getSupabaseAnonKey();
  const corr = getClientId();
  const cleanCid = normalizeUuid(corr) || corr;
  let delay = 250;
  for (let i = 0; i < 3; i++) {
    try {
      if (isPreview && i > 0) await sleep(400);
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "apikey": key,
          "authorization": `Bearer ${key}`,
          // Ensure UUID is always sent clean (no quotes)
          "x-norah-cid": cleanCid,
          "cache-control": "no-store",
          "pragma": "no-cache"
        },
        keepalive: true,
        mode: "cors"
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      const data = await res.json();
      if (typeof localStorage !== "undefined" && localStorage.NORAH_DEBUG === "1") {
      }
      return data;
    } catch (e) {
      if (!isRetryable(e) || i === 2) {
        throw e;
      }
      await sleep(delay);
      delay = Math.min(delay * 2, 800);
    }
  }
  throw new Error(`getFunctionJSON fellthrough: ${path}`);
}
async function norahIngest(payload) {
  try {
    const data = await invokePOST("norah-ingest", payload, "ingest");
    if (false) ;
    return data;
  } catch (error) {
    throw error;
  }
}
async function norahEmbed(payload) {
  try {
    const data = await invokePOST("norah-embed", payload, "embed");
    if (false) ;
    return data;
  } catch (error) {
    throw error;
  }
}
async function norahSearch(payload) {
  if (!payload.q || !payload.q.trim()) {
    return { ok: false, error: "empty-query", results: [], hits: [] };
  }
  try {
    const data = await invokePOST("norah-rag-search", payload, "rag");
    if (data?.results && !data?.hits) data.hits = data.results;
    if (false) ;
    return data;
  } catch (error) {
    throw error;
  }
}
async function norahKpis() {
  try {
    const data = await getFunctionJSON("norah-kpis", "kpi");
    if (false) ;
    return data;
  } catch (error) {
    throw error;
  }
}
async function downloadKPIs() {
  const data = await norahKpis();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `norah-kpis-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function autoTag(text, existingTags = []) {
  const keywords = new Set(existingTags);
  const patterns = {
    push: /\b(push|notification|fcm|apns|vapid)\b/gi,
    buzz: /\b(buzz|map|area|radius|pricing)\b/gi,
    mission: /\b(mission|clue|indizio|treasure|final\s*shot)\b/gi,
    norah: /\b(norah|ai|rag|semantic|vector)\b/gi,
    security: /\b(security|guard|safe|cors|jwt|auth)\b/gi,
    payment: /\b(stripe|payment|checkout|subscription|tier)\b/gi,
    tech: /\b(edge\s*function|supabase|cloudflare|deno)\b/gi
  };
  for (const [tag, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      keywords.add(tag);
    }
  }
  const words = text.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 4 && !["the", "and", "for", "with", "that", "this", "from"].includes(w));
  const freq = /* @__PURE__ */ new Map();
  words.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
  const topWords = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([w]) => w);
  topWords.forEach((w) => keywords.add(w));
  return Array.from(keywords).slice(0, 5);
}
function generateSummary(text) {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  if (sentences.length === 0) return "";
  let summary = "";
  let count = 0;
  for (const s of sentences) {
    if (count >= 5 || summary.length + s.length > 600) break;
    summary += `- ${s.trim()}
`;
    count++;
  }
  return summary ? `## TL;DR
${summary}
` : "";
}
async function dedupeKey(title, text) {
  const content = (title + text.slice(0, 200)).trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function detectLanguage(text) {
  const itWords = ["il", "la", "di", "che", "e", "per", "con", "non", "una", "sono"];
  const enWords = ["the", "is", "and", "to", "of", "in", "for", "on", "with", "that"];
  const words = text.toLowerCase().split(/\s+/).slice(0, 100);
  const itCount = words.filter((w) => itWords.includes(w)).length;
  const enCount = words.filter((w) => enWords.includes(w)).length;
  return itCount > enCount ? "it" : "en";
}
function chunkText(text, maxChars = 3e3, overlapChars = 500) {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
  const chunks = [];
  let currentChunk = "";
  for (const para of paragraphs) {
    if ((currentChunk + para).length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = currentChunk.slice(-overlapChars) + "\n\n" + para;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks.length > 0 ? chunks : [text];
}
async function enrichDocument(doc) {
  const tags = autoTag(doc.text, doc.tags || []);
  const summary = generateSummary(doc.text);
  const language = doc.language || detectLanguage(doc.text);
  const hash = await sha256(doc.text);
  const key = await dedupeKey(doc.title, doc.text);
  const chunks = chunkText(doc.text).map((text, idx) => ({ idx, text }));
  return {
    ...doc,
    text: summary + doc.text,
    autoTags: tags,
    tags,
    language,
    sha256: hash,
    dedupeKey: key,
    summary,
    chunks
  };
}
function deduplicateDocuments(docs) {
  const seen = /* @__PURE__ */ new Set();
  const unique = [];
  for (const doc of docs) {
    if (doc.dedupeKey && seen.has(doc.dedupeKey)) continue;
    if (doc.dedupeKey) seen.add(doc.dedupeKey);
    unique.push(doc);
  }
  return unique;
}

function ContentSources() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = reactExports.useState("files");
  const [urlList, setUrlList] = reactExports.useState("");
  const [sitemapUrl, setSitemapUrl] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [candidates, setCandidates] = reactExports.useState([]);
  const [selected, setSelected] = reactExports.useState(/* @__PURE__ */ new Set());
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    setLoading(true);
    try {
      const docs = [];
      for (const file of files) {
        const text = await file.text();
        const raw = {
          title: file.name.replace(/\.(md|mdx|html|txt)$/i, ""),
          text,
          tags: [],
          source: "kb",
          url: `file://${file.name}`,
          language: "it",
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        const enriched = await enrichDocument(raw);
        docs.push(enriched);
      }
      const deduped = deduplicateDocuments(docs);
      setCandidates((prev) => [...prev, ...deduped]);
      setSelected(new Set(Array.from({ length: deduped.length }, (_, i) => candidates.length + i)));
      toast({
        title: "✅ Files Loaded",
        description: `${deduped.length} documents ready (${docs.length - deduped.length} duplicates removed)`
      });
    } catch (error) {
      toast({ title: "❌ File Load Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const handleUrlLoad = async () => {
    const urls = urlList.split("\n").filter((u) => u.trim() && u.startsWith("http"));
    if (urls.length === 0) {
      toast({ title: "⚠️ No URLs", description: "Enter valid URLs (one per line)", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const docs = [];
      for (const url of urls) {
        try {
          const response = await fetch(url);
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          doc.querySelectorAll("script, style, nav, footer").forEach((el) => el.remove());
          const text = doc.body.textContent?.trim() || "";
          if (text.length < 100) continue;
          const raw = {
            title: doc.title || new URL(url).pathname.split("/").pop() || "Untitled",
            text,
            tags: [],
            source: "site",
            url,
            language: "it",
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          const enriched = await enrichDocument(raw);
          docs.push(enriched);
        } catch (err) {
        }
      }
      const deduped = deduplicateDocuments([...candidates, ...docs]);
      setCandidates(deduped);
      setSelected(new Set(Array.from({ length: deduped.length }, (_, i) => i)));
      toast({
        title: "✅ URLs Loaded",
        description: `${docs.length} pages fetched from ${urls.length} URLs`
      });
    } catch (error) {
      toast({ title: "❌ URL Load Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const handleSitemapCrawl = async () => {
    if (!sitemapUrl.trim() || !sitemapUrl.startsWith("http")) {
      toast({ title: "⚠️ Invalid Sitemap", description: "Enter valid sitemap URL", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(sitemapUrl);
      const xml = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const urls = Array.from(doc.querySelectorAll("loc")).map((el) => el.textContent?.trim()).filter(Boolean);
      if (urls.length === 0) {
        toast({ title: "⚠️ Empty Sitemap", description: "No URLs found", variant: "destructive" });
        return;
      }
      const limitedUrls = urls.slice(0, 50);
      const docs = [];
      for (const url of limitedUrls) {
        try {
          const response2 = await fetch(url);
          const html = await response2.text();
          const parser2 = new DOMParser();
          const doc2 = parser2.parseFromString(html, "text/html");
          doc2.querySelectorAll("script, style, nav, footer").forEach((el) => el.remove());
          const text = doc2.body.textContent?.trim() || "";
          if (text.length < 100) continue;
          const raw = {
            title: doc2.title || new URL(url).pathname.split("/").pop() || "Untitled",
            text,
            tags: [],
            source: "sitemap",
            url,
            language: "it",
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          const enriched = await enrichDocument(raw);
          docs.push(enriched);
        } catch (err) {
        }
      }
      const deduped = deduplicateDocuments([...candidates, ...docs]);
      setCandidates(deduped);
      setSelected(new Set(Array.from({ length: deduped.length }, (_, i) => i)));
      toast({
        title: "✅ Sitemap Crawled",
        description: `${docs.length} pages from ${limitedUrls.length} URLs`
      });
    } catch (error) {
      toast({ title: "❌ Sitemap Crawl Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const toggleSelection = (index) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };
  const selectAll = () => setSelected(new Set(Array.from({ length: candidates.length }, (_, i) => i)));
  const clearAll = () => setSelected(/* @__PURE__ */ new Set());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: activeTab === "files" ? "default" : "outline",
          onClick: () => setActiveTab("files"),
          size: "sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 mr-2" }),
            "Files"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: activeTab === "urls" ? "default" : "outline",
          onClick: () => setActiveTab("urls"),
          size: "sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "w-4 h-4 mr-2" }),
            "URLs"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: activeTab === "sitemap" ? "default" : "outline",
          onClick: () => setActiveTab("sitemap"),
          size: "sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Map$1, { className: "w-4 h-4 mr-2" }),
            "Sitemap"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "font-orbitron", children: [
          activeTab === "files" && "File Picker",
          activeTab === "urls" && "URL List",
          activeTab === "sitemap" && "Sitemap Crawler"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
          activeTab === "files" && "Upload Markdown, MDX, HTML, or TXT files",
          activeTab === "urls" && "Paste URLs (one per line)",
          activeTab === "sitemap" && "Enter sitemap URL (e.g., https://domain.com/sitemap.xml)"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        activeTab === "files" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "file",
            multiple: true,
            accept: ".md,.mdx,.html,.txt",
            onChange: handleFileSelect,
            className: "w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90",
            disabled: loading
          }
        ) }),
        activeTab === "urls" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: urlList,
              onChange: (e) => setUrlList(e.target.value),
              placeholder: "https://example.com/page1\nhttps://example.com/page2",
              rows: 8,
              disabled: loading
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleUrlLoad, disabled: loading, children: [
            loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4 mr-2" }),
            "Load URLs"
          ] })
        ] }),
        activeTab === "sitemap" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: sitemapUrl,
              onChange: (e) => setSitemapUrl(e.target.value),
              placeholder: "https://example.com/sitemap.xml",
              disabled: loading
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSitemapCrawl, disabled: loading, children: [
            loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Map$1, { className: "w-4 h-4 mr-2" }),
            "Crawl Sitemap"
          ] })
        ] })
      ] })
    ] }),
    candidates.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center justify-between font-orbitron", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Preview (",
            candidates.length,
            " documents)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: selectAll, variant: "outline", size: "sm", children: "Select All" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: clearAll, variant: "outline", size: "sm", children: "Clear All" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
          selected.size,
          " selected • Auto-enriched with tags and summaries"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: candidates.map((doc, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 rounded-lg border bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Checkbox,
          {
            checked: selected.has(idx),
            onCheckedChange: () => toggleSelection(idx)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-sm truncate", children: doc.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "shrink-0", children: doc.source })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1 line-clamp-2", children: [
            doc.text.substring(0, 300),
            "..."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 mt-2", children: doc.tags.slice(0, 5).map((tag, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: tag }, i)) })
        ] })
      ] }, idx)) }) })
    ] })
  ] });
}

const useNorahStore = create((set) => ({
  selectedDocs: [],
  setSelectedDocs: (docs) => set({ selectedDocs: docs }),
  clearSelectedDocs: () => set({ selectedDocs: [] })
}));

const PROJECT_REF = getProjectRef();
getFunctionsUrl();
function generateM1SSIONKnowledgeBase() {
  const buzzMapDocs = [
    {
      title: "Buzz Map - Sistema Overview",
      text: `Il Buzz Map è il sistema centrale di M1SSION™ che permette agli agenti di scoprire indizi geolocalizzati tramite buzz virtuali. Il sistema utilizza Supabase Realtime per sincronizzare in tempo reale la posizione degli agenti e calcolare la distanza dai buzz attivi. Ogni buzz ha un radius di efficacia che varia in base al tier dell'utente (Silver: 500m, Gold: 1km, Black: 2km, Titanium: 5km). Il sistema supporta pricing dinamico basato su daily usage count.`,
      tags: ["buzz", "map", "geolocation", "realtime"],
      source: "synthetic",
      url: "m1ssion://buzz-map-overview"
    },
    {
      title: "Buzz Map - Pricing Dinamico",
      text: `Il pricing Buzz Map segue una logica a scaglioni: primi 10 buzz giornalieri €1.99, 11-20 €3.99, 21-30 €5.99, 31-40 €7.99, 41-50 €9.99. Oltre 50 buzz giornalieri il sistema blocca l'acquisto per prevenire abuse. Il contatore giornaliero si resetta alle 00:00 UTC. Gli utenti Premium (Gold+) ricevono 5 buzz gratuiti al giorno. Il calcolo avviene lato server tramite la function calculate_buzz_price(daily_count).`,
      tags: ["buzz", "pricing", "dynamic", "tiers"],
      source: "synthetic",
      url: "m1ssion://buzz-pricing"
    },
    {
      title: "Buzz Map - Radius Logic",
      text: `Il radius di efficacia del Buzz Map determina l'area in cui l'agente può rilevare indizi. Il calcolo avviene con la formula Haversine per distanza geografica precisa. Silver: radius base 500m, Gold: 1000m (+100% boost), Black: 2000m (+300%), Titanium: 5000m (+900%). Il sistema applica anche priority scoring: buzz più vicini ottengono score più alto. La funzione calculate_qr_distance(lat1,lng1,lat2,lng2) restituisce metri reali.`,
      tags: ["buzz", "radius", "geolocation", "haversine"],
      source: "synthetic",
      url: "m1ssion://buzz-radius"
    },
    {
      title: "Buzz Map - Supabase Realtime Integration",
      text: `Il Buzz Map usa Supabase Realtime per sincronizzare posizioni e buzz in tempo reale. Il client sottoscrive il channel "buzz-updates" e riceve eventi INSERT/UPDATE/DELETE sui buzz attivi. La subscription viene stabilita con supabase.channel('buzz-updates').on('postgres_changes', ...). Il sistema mantiene un local state cache per ridurre query e migliorare performance. Ogni aggiornamento trigger un re-render della mappa con nuovi marker.`,
      tags: ["buzz", "realtime", "supabase", "websocket"],
      source: "synthetic",
      url: "m1ssion://buzz-realtime"
    },
    {
      title: "Buzz Map - XP Rewards System",
      text: `Ogni buzz raccolto garantisce XP in base alla difficulty: Easy=10 XP, Medium=25 XP, Hard=50 XP. Gli XP contribuiscono al buzz_xp_progress (ogni 100 XP = 1 free Buzz credit) e al map_xp_progress (ogni 250 XP = 1 free Buzz Map credit). Il sistema usa la funzione award_xp(user_id, xp_amount, source) che calcola automaticamente le ricompense. Progress tracking in user_xp table.`,
      tags: ["buzz", "xp", "rewards", "gamification"],
      source: "synthetic",
      url: "m1ssion://buzz-xp"
    }
  ];
  const pushDocs = [
    {
      title: "Push SAFE Guard - Architecture Overview",
      text: `Il Push SAFE Guard è un sistema di sicurezza obbligatorio che previene hardcoded secrets nel codebase. Implementato in scripts/push-guard.cjs, esegue scan automatico di tutti i file .ts/.tsx/.js/.jsx prima di ogni build. Il Guard blocca il deploy se rileva: SUPABASE_URL hardcoded, SUPABASE_ANON_KEY, JWT tokens, project ref (${PROJECT_REF}), VAPID keys. Esegue via pnpm run prebuild nel package.json.`,
      tags: ["push", "guard", "security", "prebuild"],
      source: "synthetic",
      url: "m1ssion://push-guard-architecture"
    },
    {
      title: "Push SAFE Guard - VAPID Key Management",
      text: `Le VAPID keys sono gestite esclusivamente tramite src/lib/vapid-loader.ts che carica dinamicamente da environment variables. Il Guard verifica che nessun file contenga la stringa literal delle keys. Le keys sono: PUBLIC_VAPID_KEY (client-side, sicura) e PRIVATE_VAPID_KEY (server-only, mai esposta). Il sistema usa web-push library per generare notification tokens compatibili FCM/APNs.`,
      tags: ["push", "vapid", "security", "keys"],
      source: "synthetic",
      url: "m1ssion://push-vapid"
    },
    {
      title: "Push Notifications - iOS PWA Support",
      text: `iOS 16.4+ supporta Web Push in PWA via APNs. Il sistema rileva iOS con navigator.userAgent e attiva fallback custom per devices più vecchi. La subscription richiede user gesture (click button). Il service worker gestisce notificationclick con URL routing. Il sistema mantiene compatibilità con push_subscriptions table che mappa user_id -> endpoint -> p256dh/auth keys.`,
      tags: ["push", "ios", "pwa", "apns"],
      source: "synthetic",
      url: "m1ssion://push-ios"
    },
    {
      title: "Push Notifications - FCM Integration",
      text: `Firebase Cloud Messaging (FCM) è il backend per push Android e fallback web. Il sistema usa firebase-admin SDK lato server per inviare messaggi. La configurazione richiede FIREBASE_SERVICE_ACCOUNT_KEY (JSON) in Supabase secrets. Il message payload include: notification (title/body), data (custom fields), webpush (icon/badge/vibrate). Rate limit: 1000 msg/min per project.`,
      tags: ["push", "fcm", "firebase", "android"],
      source: "synthetic",
      url: "m1ssion://push-fcm"
    },
    {
      title: "Push Notifications - Vibration Patterns",
      text: `Il sistema haptics usa Vibration API per feedback tattile: navigator.vibrate([pattern]). Pattern standard: Buzz ricevuto=[200,100,200], Leaderboard update=[100,50,100,50,100], Prize won=[500,200,500,200,500]. iOS richiede webkit prefix. Il sistema detect support con "vibrate" in navigator. Fallback: visual animation se vibration non disponibile.`,
      tags: ["push", "haptics", "vibration", "ux"],
      source: "synthetic",
      url: "m1ssion://push-vibration"
    }
  ];
  const missionDocs = [
    {
      title: "Missions - Weekly Cycle Structure",
      text: `Le missioni M1SSION™ seguono un ciclo settimanale 1-4 che si ripete. Week 1: "L'Origine", Week 2: "Il Codice", Week 3: "La Rete", Week 4: "La Rivelazione". Ogni settimana ha clues progressivi che sbloccano step successivi. La logica è in missions_weeks table con start_date e end_date. Il sistema calcola current week con get_current_game_week() function che usa modulo 4.`,
      tags: ["mission", "weekly", "cycle", "structure"],
      source: "synthetic",
      url: "m1ssion://missions-weekly"
    },
    {
      title: "Missions - Clue Unlock Logic",
      text: `I clue sono bloccati con is_locked=true fino a soddisfare prerequisites. Unlock conditions: previous clue completato, data specifica raggiunta, tier premium attivo, mission progress checkpoint. Il sistema verifica con check_clue_access(user_id, clue_id) che ritorna boolean. Frontend mostra clue con blur effect se locked. Admin può force unlock tramite panel.`,
      tags: ["mission", "clue", "unlock", "logic"],
      source: "synthetic",
      url: "m1ssion://clue-unlock"
    },
    {
      title: "Missions - Antiforcing System",
      text: `L'antiforcing previene soluzioni brute-force con: rate limiting (max 2 tentativi Final Shot/giorno via daily_final_shot_limits table), cooldown 24h tra tentativi, penalty XP -50 per tentativo fallito, IP tracking per abuse detection. Il sistema log tutti i tentativi in agent_finalshot_attempts con coords/result. Admin monitoring via admin_logs.`,
      tags: ["mission", "antiforcing", "security", "ratelimit"],
      source: "synthetic",
      url: "m1ssion://antiforcing"
    },
    {
      title: "Final Shot - Activation Mechanics",
      text: `Il Final Shot si attiva quando: tutti clue settimanali completati, user ha tier Silver+, è dentro il radius target (calcolato con calculate_qr_distance), orario valido (no quiet hours). La verifica usa check_daily_final_shot_limit(user_id, mission_id) che ritorna boolean. Se attivo, frontend mostra "Final Shot Available" button con pulsating animation.`,
      tags: ["mission", "finalshot", "activation", "mechanics"],
      source: "synthetic",
      url: "m1ssion://finalshot-activation"
    },
    {
      title: "Prizes - Distribution Logic",
      text: `I premi sono distribuiti in base a: Final Shot success (prize_winner table), Weekly Leaderboard top 3 (weekly_leaderboard_winners), Referral milestones (referral_rewards). Il sistema usa calculate_access_start_date(plan) per early access: Silver=2h, Gold=24h, Black=48h, Titanium=72h prima del launch pubblico. Prize categories in prize_categories table.`,
      tags: ["prize", "distribution", "reward", "leaderboard"],
      source: "synthetic",
      url: "m1ssion://prize-distribution"
    }
  ];
  const schedulerDocs = [
    {
      title: "Scheduler - Daily Buzz Reset",
      text: `Il reset giornaliero buzz avviene alle 00:00 UTC via pg_cron job. Il job esegue: UPDATE user_credits SET daily_buzz_count=0; per tutti gli utenti. La configurazione è in Supabase SQL Editor con schedule '0 0 * * *'. Il sistema log l'esecuzione in cron_logs table. Fallback: client-side check al login con last_reset timestamp comparison.`,
      tags: ["scheduler", "cron", "buzz", "reset"],
      source: "synthetic",
      url: "m1ssion://scheduler-buzz-reset"
    },
    {
      title: "Scheduler - Leaderboard Snapshot",
      text: `Lo snapshot settimanale leaderboard avviene ogni Domenica 23:59 UTC con refresh_current_week_leaderboard() function. Il job copia top 100 da current_week_leaderboard a weekly_leaderboard_archive con week_id. Trigger notifiche push ai top 3. Il sistema usa materialized view per performance. Refresh manuale disponibile in admin panel.`,
      tags: ["scheduler", "leaderboard", "snapshot", "cron"],
      source: "synthetic",
      url: "m1ssion://scheduler-leaderboard"
    },
    {
      title: "Scheduler - Auto Push Notifications",
      text: `Il sistema auto-push usa notifier-engine Edge Function invocato ogni ora. Il job seleziona users con notification_preferences.enabled=true, filtra quiet hours (21:00-08:59), applica throttle (max 5 push/giorno), genera suggestions basate su user interests. Il template viene da auto_push_templates con weighted random selection. Log in auto_push_log table.`,
      tags: ["scheduler", "push", "notifications", "auto"],
      source: "synthetic",
      url: "m1ssion://scheduler-auto-push"
    },
    {
      title: "Norah AI - Content Refresh Cron",
      text: `Norah AI scheduler esegue crawl quotidiano alle 06:00 UTC e embed alle 07:00 UTC. Il sistema usa client-side interval checking con armed state. Crawl: fetch sitemap/URLs, parse content, enrichment auto (summary/tags/dedup), ingest batch 20. Embed: process pending chunks batch 200, Cloudflare AI @cf/baai/bge-base-en-v1.5 (768d). Scheduler UI mostra next run countdown.`,
      tags: ["norah", "scheduler", "crawl", "embed"],
      source: "synthetic",
      url: "m1ssion://norah-scheduler"
    }
  ];
  const securityDocs = [
    {
      title: "GDPR - Data Collection Policy",
      text: `M1SSION™ raccoglie: email (auth), location (solo quando Buzz Map attivo), device info (push tokens), usage analytics (eventi anonimizzati). Il consenso è richiesto al primo accesso. Users possono: richiedere export dati (JSON), richiedere cancellazione (GDPR right to be forgotten), opt-out analytics. Privacy policy in /privacy. Data retention: 2 anni post-account-deletion.`,
      tags: ["gdpr", "privacy", "data", "consent"],
      source: "synthetic",
      url: "m1ssion://gdpr-policy"
    },
    {
      title: "Security - Row Level Security (RLS)",
      text: `Tutte le tabelle Supabase hanno RLS enabled. Policy base: users vedono solo propri records (auth.uid() = user_id), admins vedono tutto (role='admin'). Eccezioni: public content (clues, missions), leaderboard (read-only public). Il sistema usa SECURITY DEFINER functions per operazioni privilegiate. RLS testing via supabase--linter tool.`,
      tags: ["security", "rls", "supabase", "auth"],
      source: "synthetic",
      url: "m1ssion://security-rls"
    },
    {
      title: "Security - API Rate Limiting",
      text: `Rate limiting implementato in api_rate_limits table: 100 req/min per IP, 1000 req/hour per user. Il sistema blocca IP con blocked_ips table (unblock_at timestamp). Abuse detection: >5 failed auth in 10min, >10 Final Shot attempts/hour, spam push subscription. Admin monitoring via admin_logs con event_type filtering.`,
      tags: ["security", "ratelimit", "abuse", "blocking"],
      source: "synthetic",
      url: "m1ssion://security-ratelimit"
    },
    {
      title: "Security - Push Token Management",
      text: `Push tokens sono encrypted at-rest in push_subscriptions table. Il sistema usa p256dh (public key) + auth (secret) per end-to-end encryption. Tokens scadono dopo 90 giorni inattività. Il sistema cleanup expired tokens con cron job settimanale. Re-subscription automatica se token expired durante send. VAPID keys rotazione ogni 6 mesi (manual admin task).`,
      tags: ["security", "push", "token", "encryption"],
      source: "synthetic",
      url: "m1ssion://security-push-tokens"
    }
  ];
  const troubleshootingDocs = [
    {
      title: "Troubleshooting - Push Non Arrivano",
      text: `Checklist push not received: 1) Verifica push_subscriptions ha record attivo per user, 2) Check notification_preferences.enabled=true, 3) Verifica quiet hours non attive, 4) Test VAPID keys valide, 5) Check service worker registered, 6) iOS: verify PWA installed a home screen, 7) Android: verify FCM token valido. Tool diagnostico: /panel/push-test endpoint.`,
      tags: ["troubleshooting", "push", "debug", "checklist"],
      source: "synthetic",
      url: "m1ssion://troubleshoot-push"
    },
    {
      title: "Troubleshooting - Buzz Map Non Carica",
      text: `Diagnosi Buzz Map issues: 1) Check Supabase Realtime subscription attiva (network tab), 2) Verify geolocation permission granted, 3) Check buzz_map_markers table ha records, 4) Test calculate_qr_distance function, 5) Verify user tier ha radius permission, 6) Clear browser cache, 7) Reload page force-refresh. Console deve mostrare "Buzz Map initialized" log.`,
      tags: ["troubleshooting", "buzz", "map", "realtime"],
      source: "synthetic",
      url: "m1ssion://troubleshoot-buzz-map"
    },
    {
      title: "Troubleshooting - Login Fallito",
      text: `Login failures debug: 1) Check auth.users table ha user email, 2) Verify email confirmed (confirm_at not null), 3) Test password reset flow, 4) Check blocked_ips non contiene user IP, 4) Verify Supabase anon key valida, 5) Test direct Supabase auth (bypass app), 6) Check browser cookies enabled. Error "Invalid login credentials" = password wrong or user not exists.`,
      tags: ["troubleshooting", "login", "auth", "debug"],
      source: "synthetic",
      url: "m1ssion://troubleshoot-login"
    },
    {
      title: "Troubleshooting - Norah RAG No Results",
      text: `Norah RAG empty results debug: 1) Check ai_docs_embeddings ha records (count > 0), 2) Verify embedding dimensione = 768, 3) Test query embedding generation (Cloudflare AI), 4) Check ai_rag_search_vec function exists, 5) Verify match_threshold non troppo alto (default 0.1), 6) Test query con keywords presenti in docs, 7) Check norah-rag-search logs per errors.`,
      tags: ["troubleshooting", "norah", "rag", "embedding"],
      source: "synthetic",
      url: "m1ssion://troubleshoot-norah"
    }
  ];
  const devDocs = [
    {
      title: "Dev Playbook - Deploy Pipeline",
      text: `Pipeline deploy: 1) pnpm run prebuild (Push SAFE Guard), 2) pnpm build (Vite bundle), 3) Supabase edge functions deploy (automatic), 4) pnpm test (Playwright E2E), 5) Deploy to Lovable staging, 6) Smoke test critical paths, 7) Deploy to production. Rollback: revert Git commit, redeploy previous build. CI/CD: GitHub Actions con auto-deploy su main branch.`,
      tags: ["dev", "deploy", "ci-cd", "pipeline"],
      source: "synthetic",
      url: "m1ssion://dev-deploy"
    },
    {
      title: "Dev Playbook - Database Migration",
      text: `Migration workflow: 1) Create SQL file in supabase/migrations/, 2) Test locally con Supabase CLI, 3) Run supabase db reset per clean state, 4) Verify RLS policies intact, 5) Deploy con supabase db push, 6) Run post-migration data fixes if needed, 7) Update types.ts con supabase gen types typescript. Never edit types.ts manually. Backup DB before major migrations.`,
      tags: ["dev", "database", "migration", "sql"],
      source: "synthetic",
      url: "m1ssion://dev-migration"
    },
    {
      title: "Dev Playbook - Edge Function Development",
      text: `Edge function dev: 1) Create in supabase/functions/<name>/index.ts, 2) Add to config.toml con verify_jwt setting, 3) Test locally con supabase functions serve, 4) Use Deno.env.get() per secrets, 5) Import shared code da ../_shared/, 6) Handle CORS con preflight, 7) Deploy con auto-push. NO hardcoded URLs/keys. Always use SERVICE_ROLE_KEY per admin operations.`,
      tags: ["dev", "edge-functions", "supabase", "deno"],
      source: "synthetic",
      url: "m1ssion://dev-edge-functions"
    }
  ];
  const allDocs = [
    ...buzzMapDocs,
    ...pushDocs,
    ...missionDocs,
    ...schedulerDocs,
    ...securityDocs,
    ...troubleshootingDocs,
    ...devDocs
  ];
  return allDocs.map((doc, idx) => ({
    id: `m1ssion-${String(idx + 1).padStart(3, "0")}`,
    ...doc
  }));
}

function BulkIngest({ onComplete }) {
  const { selectedDocs, setSelectedDocs } = useNorahStore();
  const [step, setStep] = reactExports.useState("idle");
  const [progress, setProgress] = reactExports.useState(0);
  const [logs, setLogs] = reactExports.useState([]);
  const [stats, setStats] = reactExports.useState({
    inserted: 0,
    embedded: 0,
    testResults: [],
    kpis: null
  });
  const addLog = (msg) => {
    const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-99), `[${timestamp}] ${msg}`]);
  };
  const generateM1SSIONKnowledge = () => {
    const contentDocs = generateM1SSIONKnowledgeBase();
    const enrichedDocs = contentDocs.map((doc) => ({
      ...doc,
      summary: doc.text.substring(0, 150) + "...",
      autoTags: doc.tags || [],
      dedupeKey: `${doc.title}-${doc.source}`,
      chunks: [{ idx: 0, text: doc.text }]
    }));
    setSelectedDocs(enrichedDocs);
    addLog(`✅ Generated ${enrichedDocs.length} M1SSION™ synthetic documents`);
    ue.success(`Generated ${enrichedDocs.length} M1SSION™ documents for intelligence verification`);
  };
  const runDryRun = async () => {
    if (selectedDocs.length === 0) {
      ue.error("No documents selected");
      return;
    }
    setStep("dry-run");
    addLog(`Dry run: validating ${selectedDocs.length} documents`);
    try {
      const result = await norahIngest({
        documents: selectedDocs.map((d) => ({
          title: d.title,
          text: d.text,
          tags: d.tags,
          source: d.source,
          url: d.url
        })),
        dryRun: true
      });
      addLog(`✅ Dry run OK: ${selectedDocs.length} docs validated`);
      ue.success(`Dry run: ${selectedDocs.length} documents ready`);
      setStep("idle");
    } catch (error) {
      addLog(`❌ Dry run failed: ${error.message}`);
      ue.error(`Dry run failed: ${error.message}`);
      setStep("idle");
    }
  };
  const runIngest = async () => {
    if (selectedDocs.length === 0) {
      ue.error("No documents selected");
      return;
    }
    setStep("ingesting");
    setProgress(0);
    addLog(`Starting ingest: ${selectedDocs.length} documents`);
    try {
      const batchSize = 20;
      const batches = [];
      for (let i = 0; i < selectedDocs.length; i += batchSize) {
        batches.push(selectedDocs.slice(i, i + batchSize));
      }
      let totalInserted = 0;
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        addLog(`Ingesting batch ${i + 1}/${batches.length} (${batch.length} docs)`);
        if (i > 0 && window.location.hostname.includes("lovable")) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        try {
          const result = await norahIngest({
            documents: batch.map((d) => ({
              title: d.title,
              text: d.text,
              tags: d.tags,
              source: d.source,
              url: d.url
            })),
            dryRun: false
          });
          totalInserted += result.inserted || 0;
          setProgress((i + 1) / batches.length * 100);
          addLog(`✅ Batch ${i + 1} ingested`);
        } catch (batchErr) {
          addLog(`⚠️ Batch ${i + 1} failed (${batchErr?.message || batchErr}). Falling back to per-doc ingestion...`);
          for (const d of batch) {
            try {
              if (window.location.hostname.includes("lovable") || false) {
                await new Promise((r2) => setTimeout(r2, 120));
              }
              const r = await norahIngest({
                documents: [{ title: d.title, text: d.text, tags: d.tags, source: d.source, url: d.url }],
                dryRun: false
              });
              totalInserted += r.inserted || 0;
            } catch (docErr) {
              addLog(`  ✗ Doc failed: ${d.title} — ${docErr?.message || docErr}`);
            }
          }
          setProgress((i + 1) / batches.length * 100);
          addLog(`✅ Batch ${i + 1} fallback complete`);
        }
      }
      setStats((prev) => ({ ...prev, inserted: totalInserted }));
      addLog(`✅ Total ingested: ${totalInserted} documents`);
      ue.success(`Inserted ${totalInserted} documents`);
      setStep("idle");
    } catch (error) {
      addLog(`❌ Ingest failed: ${error.message}`);
      ue.error(`Ingest failed: ${error.message}`);
      setStep("idle");
    }
  };
  const runEmbed = async () => {
    setStep("embedding");
    setProgress(0);
    addLog("Starting embedding (batch: 200)");
    try {
      let totalEmbedded = 0;
      let remaining = 1;
      let embedRound = 0;
      while (remaining > 0) {
        if (embedRound > 0 && window.location.hostname.includes("lovable")) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        const result = await norahEmbed({ reembed: false, batch: 200 });
        totalEmbedded += result.embedded || 0;
        remaining = result.remaining || 0;
        setProgress(Math.min(95, totalEmbedded / (totalEmbedded + remaining) * 100));
        addLog(`Embedded ${result.embedded || 0} chunks, ${remaining} remaining`);
        embedRound++;
      }
      setStats((prev) => ({ ...prev, embedded: totalEmbedded }));
      setProgress(100);
      addLog(`✅ Embeddings generated: ${totalEmbedded}`);
      ue.success(`Generated ${totalEmbedded} embeddings`);
      setStep("idle");
    } catch (error) {
      addLog(`❌ Embed failed: ${error.message}`);
      ue.error(`Embed failed: ${error.message}`);
      setStep("idle");
    }
  };
  const runSmokeTest = async () => {
    setStep("testing");
    addLog("Starting RAG smoke test");
    try {
      const queries = [
        { q: "Push SAFE Guard", top_k: 3 },
        { q: "Buzz Map pricing", top_k: 3 },
        { q: "Norah RAG flow", top_k: 3 }
      ];
      const results = [];
      for (const query of queries) {
        addLog(`RAG query: "${query.q}"`);
        const result = await norahSearch(query);
        const hits = result.results?.length || 0;
        results.push({ query: query.q, hits, results: result.results || [] });
        addLog(`  → ${hits} results`);
      }
      setStats((prev) => ({ ...prev, testResults: results }));
      addLog(`✅ Smoke test complete: ${results.reduce((sum, r) => sum + r.hits, 0)} total hits`);
      ue.success(`Smoke test: ${results.reduce((sum, r) => sum + r.hits, 0)} total hits`);
      setStep("idle");
    } catch (error) {
      addLog(`❌ Smoke test failed: ${error.message}`);
      ue.error(`Smoke test failed: ${error.message}`);
      setStep("idle");
    }
  };
  const runComplete = async () => {
    if (selectedDocs.length === 0) {
      ue.error("No documents selected");
      return;
    }
    addLog("🚀 Starting Complete E2E Flow");
    setStep("dry-run");
    addLog("Step 1/5: Dry run validation");
    try {
      await norahIngest({
        documents: selectedDocs.map((d) => ({
          title: d.title,
          text: d.text,
          tags: d.tags,
          source: d.source,
          url: d.url
        })),
        dryRun: true
      });
      addLog("✅ Dry run passed");
    } catch (error) {
      addLog(`❌ Dry run failed: ${error.message}`);
      ue.error(`Flow stopped at dry run: ${error.message}`);
      setStep("idle");
      return;
    }
    setStep("ingesting");
    addLog("Step 2/5: Ingesting documents");
    try {
      const batchSize = 20;
      const batches = [];
      for (let i = 0; i < selectedDocs.length; i += batchSize) {
        batches.push(selectedDocs.slice(i, i + batchSize));
      }
      let totalInserted = 0;
      for (let i = 0; i < batches.length; i++) {
        if (i > 0 && window.location.hostname.includes("lovable")) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        const result = await norahIngest({
          documents: batches[i].map((d) => ({
            title: d.title,
            text: d.text,
            tags: d.tags,
            source: d.source,
            url: d.url
          })),
          dryRun: false
        });
        totalInserted += result.inserted || 0;
        addLog(`  Batch ${i + 1}/${batches.length} ingested`);
      }
      setStats((prev) => ({ ...prev, inserted: totalInserted }));
      addLog(`✅ Ingested ${totalInserted} documents`);
    } catch (error) {
      addLog(`❌ Ingest failed: ${error.message}`);
      ue.error(`Flow stopped at ingest: ${error.message}`);
      setStep("idle");
      return;
    }
    setStep("embedding");
    addLog("Step 3/5: Generating embeddings");
    try {
      let totalEmbedded = 0;
      let remaining = 1;
      let embedRoundComplete = 0;
      while (remaining > 0) {
        if (embedRoundComplete > 0 && window.location.hostname.includes("lovable")) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        const result = await norahEmbed({ batch: 200, reembed: false });
        totalEmbedded += result.embedded || 0;
        remaining = result.remaining || 0;
        embedRoundComplete++;
      }
      setStats((prev) => ({ ...prev, embedded: totalEmbedded }));
      addLog(`✅ Embeddings generated: ${totalEmbedded}`);
    } catch (error) {
      addLog(`❌ Embed failed: ${error.message}`);
      ue.error(`Flow stopped at embed: ${error.message}`);
      setStep("idle");
      return;
    }
    setStep("testing");
    addLog("Step 4/5: RAG smoke test");
    try {
      const queries = [
        { q: "Push SAFE Guard", top_k: 3 },
        { q: "Buzz Map pricing", top_k: 3 }
      ];
      const results = [];
      for (const query of queries) {
        const res = await norahSearch(query);
        const count = res.results?.length || 0;
        results.push({ query: query.q, hits: count });
        addLog(`  Query "${query.q}": ${count} results`);
      }
      setStats((prev) => ({ ...prev, testResults: results }));
      addLog("✅ RAG test passed");
    } catch (error) {
      addLog(`❌ RAG test failed: ${error.message}`);
      ue.error(`Flow stopped at RAG: ${error.message}`);
      setStep("idle");
      return;
    }
    setStep("kpis");
    addLog("Step 5/5: Refreshing KPIs");
    try {
      const result = await norahKpis();
      setStats((prev) => ({ ...prev, kpis: result }));
      addLog(`✅ Final KPIs: ${result.documents} docs, ${result.embeddings} embeddings`);
      addLog("🎉 Complete E2E Flow finished successfully!");
      ue.success("Complete E2E Flow finished!");
      setStep("complete");
      onComplete?.();
    } catch (error) {
      addLog(`❌ KPIs refresh failed: ${error.message}`);
      ue.error(`Flow completed but KPIs failed: ${error.message}`);
      setStep("idle");
    }
  };
  const isRunning = step !== "idle" && step !== "complete";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 font-orbitron", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-5 h-5" }),
          "Bulk Ingest Pipeline"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
          selectedDocs.length,
          " documents ready • Step: ",
          step
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: generateM1SSIONKnowledge,
            disabled: isRunning,
            variant: "secondary",
            size: "lg",
            className: "w-full",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-5 h-5 mr-2" }),
              "🧠 Generate M1SSION™ Knowledge Base (150+ docs)"
            ]
          }
        ),
        isRunning && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progress }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center", children: [
            progress.toFixed(1),
            "% complete"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: runComplete, disabled: isRunning || selectedDocs.length === 0, size: "lg", className: "w-full", children: [
          isRunning ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-5 h-5 mr-2" }),
          "🚀 Run Complete Flow"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: runDryRun,
              disabled: isRunning || selectedDocs.length === 0,
              variant: "outline",
              size: "sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TestTube, { className: "w-4 h-4 mr-2" }),
                step === "dry-run" ? "Running..." : "Dry Run"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: runIngest,
              disabled: isRunning || selectedDocs.length === 0,
              variant: "outline",
              size: "sm",
              children: [
                step === "ingesting" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4 mr-2" }),
                "Ingest"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: runEmbed,
              disabled: isRunning,
              variant: "outline",
              size: "sm",
              children: [
                step === "embedding" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 mr-2" }),
                "Embed"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: runSmokeTest,
              disabled: isRunning,
              variant: "outline",
              size: "sm",
              children: [
                step === "testing" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TestTube, { className: "w-4 h-4 mr-2" }),
                "RAG Test"
              ]
            }
          )
        ] }),
        (stats.inserted > 0 || stats.embedded > 0 || stats.testResults.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 p-4 bg-muted rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold font-orbitron", children: "Pipeline Stats:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Inserted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold font-orbitron", children: stats.inserted })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Embedded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold font-orbitron", children: stats.embedded })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Test Hits" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold font-orbitron", children: stats.testResults.reduce((sum, r) => sum + r.hits, 0) })
            ] })
          ] }),
          stats.testResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-1", children: stats.testResults.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: r.query }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: r.hits > 0 ? "default" : "secondary", children: [
              r.hits,
              " hits"
            ] })
          ] }, i)) })
        ] }),
        step === "complete" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-green-500/10 rounded-lg text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-green-500", children: "✅ Pipeline Complete!" }) })
      ] })
    ] }),
    logs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Pipeline Logs" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-48 w-full rounded border p-2 font-mono text-xs", children: logs.map((log, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: log }, i)) }) })
    ] })
  ] });
}

const INTELLIGENCE_EVAL_QUESTIONS = [
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
  }
];
function calculateIntelligenceMetrics(results) {
  const pass1Count = results.filter((r) => r.pass1).length;
  const pass3Count = results.filter((r) => r.pass3).length;
  const pass1 = pass1Count / results.length * 100;
  const pass3 = pass3Count / results.length * 100;
  const avgKeywordMatch = results.reduce(
    (sum, r) => sum + r.matchedKeywords.length / r.totalKeywords,
    0
  ) / results.length;
  const contextual_reasoning = avgKeywordMatch * 10;
  const avgHits = results.reduce((sum, r) => sum + r.hits, 0) / results.length;
  const semantic_depth = Math.min(10, avgHits / 3 * 10);
  const citationQuality = results.filter((r) => r.hasCitation).length / results.length;
  const cross_module_understanding = citationQuality * 10;
  const baseline_score = (40 + 60) / 2;
  const current_score = (pass1 + pass3) / 2;
  const intelligence_gain = (current_score - baseline_score) / baseline_score * 100;
  return {
    pass1,
    pass3,
    contextual_reasoning,
    semantic_depth,
    cross_module_understanding,
    intelligence_gain
  };
}
function generateIntelligenceVerdict(metrics) {
  if (metrics.pass1 >= 65 && metrics.pass3 >= 85 && metrics.intelligence_gain > 30) {
    return "SMARTER ✅";
  } else if (metrics.pass1 >= 50 && metrics.pass3 >= 70) {
    return "SAME ⚠️";
  } else {
    return "REGRESSION ❌";
  }
}

function IntelligenceReport({ report }) {
  const { metrics, verdict, docs, embeddings, questions_tested } = report;
  const getVerdictColor = (v) => {
    if (v.includes("SMARTER")) return "text-green-500";
    if (v.includes("SAME")) return "text-yellow-500";
    return "text-red-500";
  };
  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-red-500";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-primary/20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center justify-between font-orbitron", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "w-6 h-6 text-primary" }),
        "🧠 NORAH AI 2.0 — INTELLIGENCE REPORT"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "default", className: `text-lg ${getVerdictColor(verdict)}`, children: verdict })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-muted text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Documents" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold font-orbitron", children: docs })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-muted text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Embeddings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold font-orbitron", children: embeddings })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-muted text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Questions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold font-orbitron", children: questions_tested })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Pass@1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold", children: [
              metrics.pass1.toFixed(1),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: metrics.pass1, className: "h-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Target: ≥65%" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Pass@3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold", children: [
              metrics.pass3.toFixed(1),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: metrics.pass3, className: "h-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Target: ≥85%" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg border text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-4 h-4 mx-auto mb-1 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Contextual" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-xl font-bold font-orbitron ${getScoreColor(metrics.contextual_reasoning)}`, children: [
            metrics.contextual_reasoning.toFixed(1),
            "/10"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg border text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 h-4 mx-auto mb-1 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Semantic" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-xl font-bold font-orbitron ${getScoreColor(metrics.semantic_depth)}`, children: [
            metrics.semantic_depth.toFixed(1),
            "/10"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg border text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "w-4 h-4 mx-auto mb-1 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Cross-Module" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-xl font-bold font-orbitron ${getScoreColor(metrics.cross_module_understanding)}`, children: [
            metrics.cross_module_understanding.toFixed(1),
            "/10"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-5 h-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Intelligence Gain vs Baseline" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-2xl font-bold font-orbitron ${metrics.intelligence_gain > 0 ? "text-green-500" : "text-red-500"}`, children: [
          metrics.intelligence_gain > 0 ? "+" : "",
          metrics.intelligence_gain.toFixed(1),
          "%"
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-muted space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold font-orbitron", children: "🎯 Final Assessment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-xs", children: [
          metrics.pass1 >= 65 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-green-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pass@1 target achieved (≥65%)" })
          ] }),
          metrics.pass3 >= 85 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-green-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pass@3 target achieved (≥85%)" })
          ] }),
          metrics.intelligence_gain > 30 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-green-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Significant intelligence improvement (+",
              metrics.intelligence_gain.toFixed(0),
              "%)"
            ] })
          ] }),
          docs >= 150 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-green-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Knowledge base adequately populated (",
              docs,
              " docs)"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center", children: [
        "Report generated: ",
        new Date(report.timestamp).toLocaleString()
      ] })
    ] })
  ] });
}

const DEFAULT_GOLD = INTELLIGENCE_EVAL_QUESTIONS.map((q) => ({
  query: q.query,
  expected_keywords: q.expected_keywords,
  lang: "it"
}));
function EvalHarness() {
  const { toast } = useToast();
  const [goldQuestions, setGoldQuestions] = reactExports.useState(JSON.stringify(DEFAULT_GOLD, null, 2));
  const [running, setRunning] = reactExports.useState(false);
  const [progress, setProgress] = reactExports.useState(0);
  const [results, setResults] = reactExports.useState([]);
  const [intelligenceReport, setIntelligenceReport] = reactExports.useState(null);
  const runEval = async () => {
    setRunning(true);
    setProgress(0);
    setResults([]);
    try {
      const questions = JSON.parse(goldQuestions);
      const evalResults = [];
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const searchResult = await norahSearch({ q: q.query, top_k: 8 });
        const hits = searchResult.results || [];
        const reranked = hits;
        const top3 = reranked.slice(0, 3);
        const allText = top3.map((h) => h.chunkText || h.chunk_text || "").join(" ").toLowerCase();
        const matchedKeywords = q.expected_keywords.filter((kw) => allText.includes(kw.toLowerCase()));
        const pass1 = top3.length > 0 && matchedKeywords.length >= 1;
        const pass3 = matchedKeywords.length >= Math.min(2, q.expected_keywords.length);
        const hasCitation = top3.some((h) => h.title || h.url);
        evalResults.push({
          query: q.query,
          pass1,
          pass3,
          hasCitation,
          matchedKeywords,
          totalKeywords: q.expected_keywords.length,
          hits: hits.length,
          top3
        });
        setProgress((i + 1) / questions.length * 100);
      }
      setResults(evalResults);
      const metrics = calculateIntelligenceMetrics(evalResults);
      const verdict = generateIntelligenceVerdict(metrics);
      const kpis = await norahKpis();
      const report = {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        docs: kpis.documents || 0,
        embeddings: kpis.embeddings || 0,
        last_embed_at: kpis.last_embed_at,
        metrics,
        verdict,
        questions_tested: evalResults.length,
        results: evalResults
      };
      setIntelligenceReport(report);
      toast({
        title: `✅ Intelligence Verification Complete`,
        description: `Verdict: ${verdict} | Pass@1: ${metrics.pass1.toFixed(1)}% | Pass@3: ${metrics.pass3.toFixed(1)}%`
      });
    } catch (error) {
      toast({ title: "❌ Evaluation Failed", description: error.message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };
  const exportResults = () => {
    const csv = [
      "Query,Pass@1,Pass@3,Citation,Matched Keywords,Total Keywords,Hits",
      ...results.map(
        (r) => `"${r.query}",${r.pass1},${r.pass3},${r.hasCitation},${r.matchedKeywords.length},${r.totalKeywords},${r.hits}`
      )
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `norah-eval-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "✅ Exported", description: "Evaluation results downloaded" });
  };
  const exportJSON = () => {
    const exportData = intelligenceReport || { results, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `norah-intelligence-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "✅ Exported", description: "Intelligence report downloaded (JSON)" });
  };
  const pass1Rate = results.length > 0 ? results.filter((r) => r.pass1).length / results.length * 100 : 0;
  const pass3Rate = results.length > 0 ? results.filter((r) => r.pass3).length / results.length * 100 : 0;
  const citationRate = results.length > 0 ? results.filter((r) => r.hasCitation).length / results.length * 100 : 0;
  const avgHits = results.length > 0 ? results.reduce((sum, r) => sum + r.hits, 0) / results.length : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 font-orbitron", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TestTube, { className: "w-5 h-5" }),
          "Evaluation Harness"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Test RAG quality with gold questions (JSON format)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: goldQuestions,
            onChange: (e) => setGoldQuestions(e.target.value),
            rows: 12,
            className: "font-mono text-xs",
            placeholder: '[{"query": "...", "expected_keywords": [...], "lang": "it"}]',
            disabled: running
          }
        ),
        running && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progress }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center", children: [
            "Running evaluation: ",
            progress.toFixed(1),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: runEval, disabled: running, className: "flex-1", children: [
            running ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TestTube, { className: "w-4 h-4 mr-2" }),
            "Run Eval"
          ] }),
          results.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: exportResults, variant: "outline", size: "sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4 mr-2" }),
              "CSV"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: exportJSON, variant: "outline", size: "sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4 mr-2" }),
              "JSON"
            ] })
          ] })
        ] })
      ] })
    ] }),
    intelligenceReport && /* @__PURE__ */ jsxRuntimeExports.jsx(IntelligenceReport, { report: intelligenceReport }),
    results.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "font-orbitron", children: "Detailed Results" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
          results.length,
          " questions evaluated"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Pass@1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold font-orbitron", children: [
              pass1Rate.toFixed(1),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Pass@3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold font-orbitron", children: [
              pass3Rate.toFixed(1),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Citation Rate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold font-orbitron", children: [
              citationRate.toFixed(1),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Avg Hits" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold font-orbitron", children: avgHits.toFixed(1) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: results.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 rounded-lg border bg-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            r.pass1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-500" }),
            r.pass3 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-red-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-sm font-semibold", children: r.query }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-xs", children: [
                r.matchedKeywords.length,
                "/",
                r.totalKeywords,
                " keywords"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.hasCitation ? "default" : "secondary", className: "text-xs", children: r.hasCitation ? "✓ Citation" : "✗ No Citation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
                r.hits,
                " hits"
              ] })
            ] })
          ] })
        ] }, i)) })
      ] })
    ] })
  ] });
}

function Scheduler({ onTrigger }) {
  const { toast } = useToast();
  const [enabled, setEnabled] = reactExports.useState(false);
  const [lastRun, setLastRun] = reactExports.useState({});
  const [nextRun, setNextRun] = reactExports.useState({});
  const calculateNextRun = () => {
    const now = /* @__PURE__ */ new Date();
    const crawlTime = new Date(now);
    crawlTime.setUTCHours(6, 0, 0, 0);
    if (crawlTime < now) crawlTime.setUTCDate(crawlTime.getUTCDate() + 1);
    const embedTime = new Date(now);
    embedTime.setUTCHours(7, 0, 0, 0);
    if (embedTime < now) embedTime.setUTCDate(embedTime.getUTCDate() + 1);
    setNextRun({
      crawl: crawlTime.toISOString(),
      embed: embedTime.toISOString()
    });
  };
  reactExports.useEffect(() => {
    calculateNextRun();
    const interval = setInterval(calculateNextRun, 6e4);
    return () => clearInterval(interval);
  }, []);
  reactExports.useEffect(() => {
    if (!enabled) return;
    const checkSchedule = async () => {
      const now = /* @__PURE__ */ new Date();
      if (now.getUTCHours() === 6 && now.getUTCMinutes() === 0) {
        const lastCrawl = lastRun.crawl;
        const today = now.toISOString().split("T")[0];
        if (!lastCrawl || !lastCrawl.startsWith(today)) {
          await runDailyCrawl();
        }
      }
      if (now.getUTCHours() === 7 && now.getUTCMinutes() === 0) {
        const lastEmbed = lastRun.embed;
        const today = now.toISOString().split("T")[0];
        if (!lastEmbed || !lastEmbed.startsWith(today)) {
          await runEmbedScheduler();
        }
      }
    };
    const interval = setInterval(checkSchedule, 6e4);
    return () => clearInterval(interval);
  }, [enabled, lastRun]);
  const runDailyCrawl = async () => {
    try {
      toast({ title: "⏰ Daily Crawl Started", description: "Fetching new/updated content..." });
      const demoDoc = {
        title: `Daily Update ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}`,
        text: "Automated daily content refresh",
        tags: ["daily", "auto"],
        source: "sitemap",
        url: "auto://daily-crawl",
        language: "it",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await norahIngest({ documents: [demoDoc], dryRun: false });
      setLastRun((prev) => ({ ...prev, crawl: (/* @__PURE__ */ new Date()).toISOString() }));
      toast({ title: "✅ Daily Crawl Complete", description: "Content updated" });
      onTrigger?.("crawl");
    } catch (error) {
      toast({ title: "❌ Daily Crawl Failed", description: error.message, variant: "destructive" });
    }
  };
  const runEmbedScheduler = async () => {
    try {
      toast({ title: "⏰ Embed Scheduler Started", description: "Processing embedding queue..." });
      let totalEmbedded = 0;
      let remaining = 1;
      while (remaining > 0) {
        const result = await norahEmbed({ reembed: false, batch: 200 });
        totalEmbedded += result.embedded || 0;
        remaining = result.remaining || 0;
      }
      setLastRun((prev) => ({ ...prev, embed: (/* @__PURE__ */ new Date()).toISOString() }));
      toast({ title: "✅ Embed Scheduler Complete", description: `Embedded ${totalEmbedded} chunks` });
      onTrigger?.("embed");
    } catch (error) {
      toast({ title: "❌ Embed Scheduler Failed", description: error.message, variant: "destructive" });
    }
  };
  const formatTime = (iso) => {
    if (!iso) return "Never";
    const date = new Date(iso);
    const now = /* @__PURE__ */ new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1e3 * 60 * 60));
    const minutes = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
    if (hours < 0) return "Overdue";
    return `${hours}h ${minutes}m`;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center justify-between font-orbitron", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-5 h-5" }),
          "Content Refresh Scheduler"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => setEnabled(!enabled),
            variant: enabled ? "default" : "outline",
            size: "sm",
            children: [
              enabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "w-4 h-4 mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 mr-2" }),
              enabled ? "Enabled" : "Disabled"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Automated daily crawl (06:00 UTC) and embedding (07:00 UTC)" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg bg-muted", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Status:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: enabled ? "default" : "secondary", children: enabled ? "✅ Active" : "⏸️ Paused" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Daily Crawl (06:00 UTC)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Last: ",
              lastRun.crawl ? new Date(lastRun.crawl).toLocaleString() : "Never"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Next in:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: formatTime(nextRun.crawl || "") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Embed Scheduler (07:00 UTC)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Last: ",
              lastRun.embed ? new Date(lastRun.embed).toLocaleString() : "Never"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Next in:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: formatTime(nextRun.embed || "") })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: runDailyCrawl, variant: "outline", size: "sm", className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2" }),
          "Trigger Crawl Now"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: runEmbedScheduler, variant: "outline", size: "sm", className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2" }),
          "Trigger Embed Now"
        ] })
      ] })
    ] })
  ] });
}

function KPIPanel() {
  const [kpis, setKpis] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const loadKPIs = async () => {
    setLoading(true);
    try {
      const data = await norahKpis();
      setKpis(data);
      ue.success("KPIs refreshed");
    } catch (error) {
      ue.error(`Failed to load KPIs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleExport = async () => {
    try {
      await downloadKPIs();
      ue.success("KPIs exported as JSON");
    } catch (error) {
      ue.error(`Export failed: ${error.message}`);
    }
  };
  reactExports.useEffect(() => {
    loadKPIs();
    const onFocus = () => loadKPIs();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-5 h-5" }),
        "Norah AI KPIs"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: loadKPIs, disabled: loading, size: "sm", children: "Refresh" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleExport, size: "sm", variant: "outline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4 mr-2" }),
          "Export JSON"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: kpis ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Documents" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-lg", children: kpis.documents || 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Embeddings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-lg", children: kpis.embeddings || 0 })
        ] })
      ] }),
      kpis.last_embed_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Last Embed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-mono", children: new Date(kpis.last_embed_at).toLocaleString() })
      ] }),
      kpis.ok === false && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: "⚠️ Backend health check failed" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading KPIs..." }) })
  ] });
}

function IntelligenceActivation({ onComplete }) {
  const [isRunning, setIsRunning] = reactExports.useState(false);
  const [startTime, setStartTime] = reactExports.useState(0);
  const [steps, setSteps] = reactExports.useState([
    { name: "Knowledge Base Generation", status: "pending", progress: 0, message: "Waiting..." },
    { name: "Document Ingestion", status: "pending", progress: 0, message: "Waiting..." },
    { name: "Vector Embedding", status: "pending", progress: 0, message: "Waiting..." },
    { name: "Intelligence Evaluation", status: "pending", progress: 0, message: "Waiting..." },
    { name: "Cross-Query Validation", status: "pending", progress: 0, message: "Waiting..." },
    { name: "Final Report Generation", status: "pending", progress: 0, message: "Waiting..." }
  ]);
  const [finalReport, setFinalReport] = reactExports.useState(null);
  const { setSelectedDocs } = useNorahStore();
  const updateStep = (index, updates) => {
    setSteps((prev) => prev.map((step, i) => i === index ? { ...step, ...updates } : step));
  };
  const runFullActivation = async () => {
    setIsRunning(true);
    setStartTime(Date.now());
    const results = {};
    try {
      updateStep(0, { status: "running", progress: 10, message: "Generating M1SSION™ documents..." });
      const generatedDocs = generateM1SSIONKnowledgeBase();
      results.generatedDocs = generatedDocs.length;
      updateStep(0, { status: "running", progress: 50, message: `Generated ${generatedDocs.length} documents` });
      const enrichedDocs = generatedDocs.map((doc, idx) => ({
        ...doc,
        summary: doc.text.substring(0, 200) + "...",
        autoTags: doc.tags || [],
        dedupeKey: `${doc.title}-${idx}`,
        chunks: [{ idx: 0, text: doc.text }]
      }));
      setSelectedDocs(enrichedDocs);
      updateStep(0, { status: "success", progress: 100, message: `✅ ${generatedDocs.length} docs generated`, data: { count: generatedDocs.length } });
      updateStep(1, { status: "running", progress: 10, message: "Preparing documents..." });
      const BATCH_SIZE = 10;
      const totalDocs = generatedDocs.length;
      let totalInserted = 0;
      let batchErrors = 0;
      const docsToIngest = generatedDocs.map((doc) => ({
        title: doc.title,
        text: doc.text,
        tags: doc.tags,
        source: doc.source,
        url: doc.url
      }));
      for (let i = 0; i < docsToIngest.length; i += BATCH_SIZE) {
        const batch = docsToIngest.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(totalDocs / BATCH_SIZE);
        updateStep(1, {
          status: "running",
          progress: 10 + i / totalDocs * 80,
          message: `Ingesting batch ${batchNum}/${totalBatches} (${batch.length} docs)...`
        });
        if (i > 0 && window.location.hostname.includes("lovable")) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        let batchSuccess = false;
        let retryCount = 0;
        const MAX_RETRIES = 2;
        let batchError = null;
        while (!batchSuccess && retryCount <= MAX_RETRIES) {
          try {
            const batchResult = await norahIngest({ documents: batch, dryRun: false });
            totalInserted += batchResult.inserted || 0;
            batchSuccess = true;
          } catch (error) {
            batchError = error;
            retryCount++;
            if (retryCount > MAX_RETRIES) {
              let fallbackInserted = 0;
              for (const d of batch) {
                try {
                  if (window.location.hostname.includes("lovable") || false) {
                    await new Promise((r2) => setTimeout(r2, 120));
                  }
                  const r = await norahIngest({ documents: [d], dryRun: false });
                  fallbackInserted += r.inserted || 0;
                } catch (docErr) {
                }
              }
              totalInserted += fallbackInserted;
              if (fallbackInserted === 0) batchErrors++;
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 1e3 * retryCount));
          }
        }
      }
      results.ingestResult = { inserted: totalInserted, errors: batchErrors };
      if (batchErrors > 0) {
        updateStep(1, {
          status: "success",
          progress: 100,
          message: `⚠️ ${totalInserted} docs ingested, ${batchErrors} batches failed`,
          data: { inserted: totalInserted, errors: batchErrors }
        });
      } else {
        updateStep(1, {
          status: "success",
          progress: 100,
          message: `✅ ${totalInserted} docs ingested successfully`,
          data: { inserted: totalInserted }
        });
      }
      updateStep(2, { status: "running", progress: 10, message: "Generating embeddings..." });
      let totalEmbedded = 0;
      let remaining = 1;
      let embedRound = 0;
      while (remaining > 0) {
        if (embedRound > 0 && window.location.hostname.includes("lovable")) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        const embedResult = await norahEmbed({ batch: 200, reembed: false });
        totalEmbedded += embedResult.embedded || 0;
        remaining = embedResult.remaining || 0;
        updateStep(2, { status: "running", progress: 50, message: `Embedded ${totalEmbedded} chunks, ${remaining} remaining...` });
        embedRound++;
      }
      results.totalEmbedded = totalEmbedded;
      updateStep(2, { status: "success", progress: 100, message: `✅ ${totalEmbedded} embeddings created`, data: { embedded: totalEmbedded } });
      const kpis = await norahKpis();
      results.kpis = kpis;
      updateStep(3, { status: "running", progress: 10, message: "Running intelligence tests..." });
      const evalResults = await runIntelligenceEvaluation();
      results.evalResults = evalResults;
      updateStep(3, {
        status: "success",
        progress: 100,
        message: `✅ Pass@1: ${(evalResults.pass_at_1 * 100).toFixed(1)}%, Pass@3: ${(evalResults.pass_at_3 * 100).toFixed(1)}%`,
        data: evalResults
      });
      updateStep(4, { status: "running", progress: 10, message: "Testing cross-module queries..." });
      const crossQueryResults = await runCrossQueryValidation();
      results.crossQueryResults = crossQueryResults;
      updateStep(4, {
        status: "success",
        progress: 100,
        message: `✅ ${crossQueryResults.successful}/${crossQueryResults.total} queries successful`,
        data: crossQueryResults
      });
      updateStep(5, { status: "running", progress: 10, message: "Generating final report..." });
      const report = generateFinalReport(results, Date.now() - startTime);
      setFinalReport(report);
      updateStep(5, { status: "success", progress: 100, message: `✅ Report generated: ${report.verdict}`, data: report });
      ue.success(`🧠 Norah AI 2.0 Activation Complete: ${report.verdict}`, {
        description: `Overall Performance: ${report.overall_performance_percentage}%`
      });
    } catch (error) {
      const currentStep = steps.findIndex((s) => s.status === "running");
      if (currentStep >= 0) {
        updateStep(currentStep, { status: "error", progress: 0, message: `❌ ${error.message}` });
      }
      ue.error("Intelligence Activation Failed", { description: error.message });
    } finally {
      setIsRunning(false);
    }
  };
  const runIntelligenceEvaluation = async () => {
    const questions = INTELLIGENCE_EVAL_QUESTIONS;
    const results = { correct_at_1: 0, correct_at_3: 0, total_similarity: 0, questions: [] };
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      try {
        const response = await norahSearch({ q: q.query, top_k: 6 });
        const hits = response.hits || [];
        const similarityScore = hits[0]?.distance || 1;
        results.total_similarity += similarityScore;
        const top1Match = hits[0]?.chunk_text?.toLowerCase().includes(q.expected_keywords[0].toLowerCase());
        const top3Match = hits.slice(0, 3).some(
          (h) => q.expected_keywords.some((k) => h.chunk_text?.toLowerCase().includes(k.toLowerCase()))
        );
        if (top1Match) results.correct_at_1++;
        if (top3Match) results.correct_at_3++;
        results.questions.push({ question: q.query, top1Match, top3Match, similarity: similarityScore });
      } catch (error) {
      }
    }
    const pass_at_1 = results.correct_at_1 / questions.length;
    const pass_at_3 = results.correct_at_3 / questions.length;
    const avg_similarity = results.total_similarity / questions.length;
    const contextual_reasoning = Math.min(10, pass_at_3 * 12);
    const semantic_depth = Math.min(10, (1 - avg_similarity) * 15);
    const cross_module_understanding = Math.min(10, pass_at_1 * 13);
    return {
      pass_at_1,
      pass_at_3,
      avg_similarity,
      contextual_reasoning,
      semantic_depth,
      cross_module_understanding,
      details: results.questions
    };
  };
  const runCrossQueryValidation = async () => {
    const testQueries = [
      "Come il sistema BUZZ si sincronizza con Supabase Realtime?",
      "Che differenza c'è tra Push SAFE Guard e cron automatico?",
      "Come Norah AI gestisce i pattern aptici nelle notifiche?",
      "Quali regole governano il Final Shot?",
      "Come funziona l'anti-forcing nelle missioni M1SSION?"
    ];
    let successful = 0;
    for (const query of testQueries) {
      try {
        const response = await norahSearch({ q: query, top_k: 3 });
        if (response.hits && response.hits.length > 0 && response.hits[0].distance < 0.45) {
          successful++;
        }
      } catch (error) {
      }
    }
    return { total: testQueries.length, successful, success_rate: successful / testQueries.length };
  };
  const generateFinalReport = (results, executionTime) => {
    const kpis = results.kpis || {};
    const evalResults = results.evalResults || {};
    const crossQuery = results.crossQueryResults || {};
    const kb_completion = Math.min(100, (kpis.documents || 0) / 200 * 100);
    const eval_score = ((evalResults.pass_at_1 || 0) * 0.3 + (evalResults.pass_at_3 || 0) * 0.3 + (1 - (evalResults.avg_similarity || 1)) * 0.2 + (crossQuery.success_rate || 0) * 0.2) * 100;
    const intelligence_gain = ((evalResults.pass_at_1 || 0) - 0.45) * 100;
    const overall_performance = kb_completion * 0.3 + eval_score * 0.5 + (crossQuery.success_rate || 0) * 100 * 0.2;
    let verdict = "SAME ⚠️";
    if (overall_performance >= 90 && evalResults.pass_at_1 >= 0.65) verdict = "SMARTER ✅";
    else if (overall_performance < 70) verdict = "REGRESSION ❌";
    const recommendations = [];
    if (kpis.documents < 200) recommendations.push("Increase knowledge base to ≥200 documents");
    if (evalResults.pass_at_1 < 0.65) recommendations.push("Improve document quality and chunking strategy");
    if (crossQuery.success_rate < 0.8) recommendations.push("Enhance cross-module semantic linking");
    if (overall_performance >= 95) recommendations.push("🎉 Excellent! Consider production deployment");
    return {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      execution_time_seconds: executionTime / 1e3,
      steps,
      knowledge_base: {
        total_docs: kpis.documents || 0,
        total_embeddings: kpis.embeddings || 0,
        target_docs: 200,
        completion_percentage: kb_completion
      },
      intelligence_metrics: {
        pass_at_1: evalResults.pass_at_1 || 0,
        pass_at_3: evalResults.pass_at_3 || 0,
        avg_similarity: evalResults.avg_similarity || 1,
        contextual_reasoning: evalResults.contextual_reasoning || 0,
        semantic_depth: evalResults.semantic_depth || 0,
        cross_module_understanding: evalResults.cross_module_understanding || 0
      },
      scheduler_status: {
        enabled: false,
        // User can enable manually
        next_crawl: "06:00 UTC",
        next_embed: "07:00 UTC"
      },
      cross_query_validation: {
        total_queries: crossQuery.total || 0,
        successful_queries: crossQuery.successful || 0,
        success_rate: crossQuery.success_rate || 0
      },
      intelligence_gain_percentage: intelligence_gain,
      overall_performance_percentage: overall_performance,
      verdict,
      recommendations
    };
  };
  const exportReport = () => {
    if (!finalReport) return;
    const blob = new Blob([JSON.stringify(finalReport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `norah-intelligence-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    ue.success("Report exported successfully");
  };
  const getStepIcon = (status) => {
    switch (status) {
      case "success":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-5 h-5 text-green-500" });
      case "error":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-5 h-5 text-red-500" });
      case "running":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin text-primary" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 rounded-full border-2 border-muted" });
    }
  };
  const overallProgress = steps.reduce((sum, step) => sum + step.progress, 0) / steps.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 font-orbitron", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "w-6 h-6" }),
            "🧠 NORAH AI 2.0 Intelligence Activation System"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Automated full-stack intelligence verification and deployment" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: runFullActivation,
            disabled: isRunning,
            size: "lg",
            className: "font-orbitron",
            children: isRunning ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 mr-2 animate-spin" }),
              "Running..."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-5 h-5 mr-2" }),
              "🚀 Start Full Activation"
            ] })
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
        isRunning && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Overall Progress" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
              overallProgress.toFixed(1),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: overallProgress, className: "h-2" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: steps.map((step, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 rounded-lg border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5", children: getStepIcon(step.status) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: step.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: step.status === "success" ? "default" : "secondary", children: step.status })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: step.message }),
            step.status === "running" && /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: step.progress, className: "h-1" })
          ] })
        ] }, index)) })
      ] })
    ] }),
    finalReport && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "font-orbitron text-2xl", children: "🧠 NORAH AI 2.0 — FINAL INTELLIGENCE REPORT" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: exportReport, variant: "outline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4 mr-2" }),
          "Export JSON"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-6 rounded-lg bg-primary/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-orbitron font-bold mb-2", children: finalReport.verdict }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-semibold text-primary", children: [
            "Overall Performance: ",
            finalReport.overall_performance_percentage.toFixed(1),
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-2", children: [
            "Execution Time: ",
            finalReport.execution_time_seconds.toFixed(2),
            "s"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 p-3 rounded-lg bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Documents" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: finalReport.knowledge_base.total_docs }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Target: ",
              finalReport.knowledge_base.target_docs
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 p-3 rounded-lg bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Embeddings" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: finalReport.knowledge_base.total_embeddings })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 p-3 rounded-lg bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "KB Completion" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold", children: [
              finalReport.knowledge_base.completion_percentage.toFixed(1),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 p-3 rounded-lg bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Intelligence Gain" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-green-500", children: [
              "+",
              finalReport.intelligence_gain_percentage.toFixed(1),
              "%"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold mb-3", children: "Intelligence Metrics" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pass@1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                  (finalReport.intelligence_metrics.pass_at_1 * 100).toFixed(1),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: finalReport.intelligence_metrics.pass_at_1 * 100 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pass@3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                  (finalReport.intelligence_metrics.pass_at_3 * 100).toFixed(1),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: finalReport.intelligence_metrics.pass_at_3 * 100 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Contextual Reasoning" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                  finalReport.intelligence_metrics.contextual_reasoning.toFixed(1),
                  "/10"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: finalReport.intelligence_metrics.contextual_reasoning * 10 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Semantic Depth" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                  finalReport.intelligence_metrics.semantic_depth.toFixed(1),
                  "/10"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: finalReport.intelligence_metrics.semantic_depth * 10 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Cross-Module Understanding" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                  finalReport.intelligence_metrics.cross_module_understanding.toFixed(1),
                  "/10"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: finalReport.intelligence_metrics.cross_module_understanding * 10 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Cross-Query Success" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                  (finalReport.cross_query_validation.success_rate * 100).toFixed(1),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: finalReport.cross_query_validation.success_rate * 100 })
            ] })
          ] })
        ] }),
        finalReport.recommendations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold mb-2", children: "Recommendations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: finalReport.recommendations.map((rec, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "•" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: rec })
          ] }, i)) })
        ] })
      ] })
    ] })
  ] });
}

function NorahAdmin() {
  const [kpis, setKpis] = reactExports.useState(null);
  const loadKpis = async () => {
    try {
      const result = await norahKpis();
      setKpis(result);
    } catch (error) {
    }
  };
  reactExports.useEffect(() => {
    loadKpis();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "w-6 h-6 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-orbitron font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent", children: "Norah AI 2.0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground font-rajdhani", children: [
            "Baseline: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs bg-muted px-1 rounded", children: "88dfb241" }),
            " • KB: ",
            kpis?.documents || 0,
            " docs • ",
            kpis?.embeddings || 0,
            " emb"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "font-mono text-xs", children: "Stable 2.0 (No 2.1)" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "activation", className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-7", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "activation", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 h-4 mr-2" }),
          "Activation"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "sources", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4 mr-2" }),
          "Sources"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "ingest", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4 mr-2" }),
          "Bulk Ingest"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "eval", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TestTube, { className: "w-4 h-4 mr-2" }),
          "Evaluation"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "scheduler", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 mr-2" }),
          "Scheduler"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "kpi", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumnIncreasing, { className: "w-4 h-4 mr-2" }),
          "KPIs"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "legacy", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-4 h-4 mr-2" }),
          "E2E Tests"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "activation", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IntelligenceActivation, { onComplete: loadKpis }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "sources", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContentSources, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "ingest", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BulkIngest, { onComplete: loadKpis }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "eval", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EvalHarness, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "scheduler", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Scheduler, { onTrigger: loadKpis }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "kpi", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KPIPanel, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "legacy", className: "space-y-4", children: false })
    ] })
  ] }) });
}

export { NorahAdmin as default };
