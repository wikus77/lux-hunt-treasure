// © 2025 Joseph MULÉ – M1SSION™ – Document Enrichment Utilities

export interface NorahDocument {
  title: string;
  text: string;
  tags: string[];
  source: 'kb' | 'repo' | 'site' | 'sitemap' | 'playbook' | 'faq' | 'adr' | 'howto' | 'policy' | 'e2e-test' | 'content-ai';
  url: string;
  language?: string;
  updatedAt: string;
  sha256?: string;
}

/**
 * Auto-tag documents using simple keyword extraction (max 5 tags)
 */
export function autoTag(text: string, existingTags: string[] = []): string[] {
  const keywords = new Set(existingTags);
  
  // Common M1SSION keywords
  const patterns = {
    push: /\b(push|notification|fcm|apns|vapid)\b/gi,
    buzz: /\b(buzz|map|area|radius|pricing)\b/gi,
    mission: /\b(mission|clue|indizio|treasure|final\s*shot)\b/gi,
    norah: /\b(norah|ai|rag|semantic|vector)\b/gi,
    security: /\b(security|guard|safe|cors|jwt|auth)\b/gi,
    payment: /\b(stripe|payment|checkout|subscription|tier)\b/gi,
    tech: /\b(edge\s*function|supabase|cloudflare|deno)\b/gi,
  };
  
  for (const [tag, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      keywords.add(tag);
    }
  }
  
  // Extract top words by frequency (simple TF)
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4 && !['the', 'and', 'for', 'with', 'that', 'this', 'from'].includes(w));
  
  const freq = new Map<string, number>();
  words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
  
  const topWords = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([w]) => w);
  
  topWords.forEach(w => keywords.add(w));
  
  return Array.from(keywords).slice(0, 5);
}

/**
 * Generate summary (3-5 sentences, max 600 chars)
 */
export function generateSummary(text: string): string {
  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  if (sentences.length === 0) return '';
  
  // Take first 3-5 sentences, cap at 600 chars
  let summary = '';
  let count = 0;
  for (const s of sentences) {
    if (count >= 5 || summary.length + s.length > 600) break;
    summary += `- ${s.trim()}\n`;
    count++;
  }
  
  return summary ? `## TL;DR\n${summary}\n` : '';
}

/**
 * Calculate deduplication key (hash of title + first 200 chars)
 */
export async function dedupeKey(title: string, text: string): Promise<string> {
  const content = (title + text.slice(0, 200)).trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Calculate SHA-256 hash for full text deduplication
 */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Detect language (simple heuristic)
 */
export function detectLanguage(text: string): 'it' | 'en' {
  const itWords = ['il', 'la', 'di', 'che', 'e', 'per', 'con', 'non', 'una', 'sono'];
  const enWords = ['the', 'is', 'and', 'to', 'of', 'in', 'for', 'on', 'with', 'that'];
  
  const words = text.toLowerCase().split(/\s+/).slice(0, 100);
  const itCount = words.filter(w => itWords.includes(w)).length;
  const enCount = words.filter(w => enWords.includes(w)).length;
  
  return itCount > enCount ? 'it' : 'en';
}

/**
 * Chunk text into ~800 token chunks (2500-3500 chars) with overlap
 */
export function chunkText(text: string, maxChars = 3000, overlapChars = 500): string[] {
  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const para of paragraphs) {
    if ((currentChunk + para).length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Overlap: keep last N chars
      currentChunk = currentChunk.slice(-overlapChars) + '\n\n' + para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.length > 0 ? chunks : [text];
}

/**
 * Enrich a single document with auto-tags, summary, chunks, dedupeKey
 */
export async function enrichDocument(doc: any): Promise<any> {
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
    chunks,
  };
}

/**
 * Enrich many documents
 */
export async function enrichMany(docs: any[]): Promise<any[]> {
  return Promise.all(docs.map(enrichDocument));
}

/**
 * Deduplicate documents by dedupeKey
 */
export function deduplicateDocuments(docs: any[]): any[] {
  const seen = new Set<string>();
  const unique: any[] = [];
  
  for (const doc of docs) {
    if (doc.dedupeKey && seen.has(doc.dedupeKey)) continue;
    if (doc.dedupeKey) seen.add(doc.dedupeKey);
    unique.push(doc);
  }
  
  return unique;
}
