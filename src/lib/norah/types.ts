// © 2025 Joseph MULÉ – M1SSION™ – Norah AI 2.0 Types

export type ContentSourceType = 'file' | 'url' | 'sitemap';

export interface ContentDoc {
  id: string;
  title: string;
  text: string;
  url?: string;
  tags?: string[];
  source: ContentSourceType;
}

export interface EnrichedDoc extends ContentDoc {
  summary: string;
  autoTags: string[];
  dedupeKey: string;
  chunks: { idx: number; text: string }[];
}

export interface IngestPayload {
  documents: {
    title: string;
    text: string;
    tags?: string[];
    source?: string;
    url?: string;
  }[];
  dryRun?: boolean;
}

export interface EmbedPayload {
  batch?: number;
  reembed?: boolean;
}

export interface RagQuery {
  q: string;
  top_k?: number;
}

export interface NorahKPIs {
  ok: boolean;
  documents: number;
  embeddings: number;
  last_embed_at?: string;
  [k: string]: any;
}
