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
 * Auto-tag documents using simple keyword extraction
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
  
  // Extract top 3-6 words by frequency (simple TF)
  const words = text.toLowerCase()
    .replace(/[^\\w\\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4 && !['the', 'and', 'for', 'with', 'that', 'this', 'from'].includes(w));
  
  const freq = new Map<string, number>();
  words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
  
  const topWords = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([w]) => w);
  
  topWords.forEach(w => keywords.add(w));
  
  return Array.from(keywords).slice(0, 6);
}

/**
 * Generate summary (3-5 bullet points)
 */
export function generateSummary(text: string): string {
  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  if (sentences.length === 0) return '';
  
  // Take first 3 sentences as summary
  const bullets = sentences
    .slice(0, 3)
    .map(s => `- ${s.trim()}`)
    .join('\n');
  
  return `## TL;DR\n${bullets}\n\n`;
}

/**
 * Calculate SHA-256 hash for deduplication
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
 * Chunk text into 700-900 token chunks with overlap
 */
export function chunkText(text: string, maxTokens = 800, overlap = 150): string[] {
  // Rough estimate: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;
  const overlapChars = overlap * 4;
  
  // Split by sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Overlap: keep last N chars
      currentChunk = currentChunk.slice(-overlapChars) + sentence;
    } else {
      currentChunk += sentence + '. ';
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Enrich a single document
 */
export async function enrichDocument(doc: NorahDocument): Promise<NorahDocument> {
  const tags = autoTag(doc.text, doc.tags);
  const summary = generateSummary(doc.text);
  const language = doc.language || detectLanguage(doc.text);
  const hash = await sha256(doc.text);
  
  return {
    ...doc,
    text: summary + doc.text,
    tags,
    language,
    sha256: hash,
  };
}

/**
 * Deduplicate documents by SHA-256
 */
export function deduplicateDocuments(docs: NorahDocument[]): NorahDocument[] {
  const seen = new Set<string>();
  const unique: NorahDocument[] = [];
  
  for (const doc of docs) {
    if (doc.sha256 && seen.has(doc.sha256)) continue;
    if (doc.sha256) seen.add(doc.sha256);
    unique.push(doc);
  }
  
  return unique;
}
