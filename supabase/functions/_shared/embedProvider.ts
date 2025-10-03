// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Embedding Provider Abstraction Layer
// Auto-fallback: Lovable AI → Cloudflare Workers AI → deterministic fallback

export type EmbeddingProvider = 'lovable' | 'cloudflare' | 'none';

export interface EmbeddingConfig {
  provider: EmbeddingProvider;
  model: string;
}

/**
 * Auto-detect available embedding provider based on environment secrets
 */
export async function getEmbeddingModel(): Promise<EmbeddingConfig> {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
  const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');

  if (lovableKey) {
    const model = Deno.env.get('EMBEDDING_MODEL') || 'text-embedding-3-small';
    return { provider: 'lovable', model };
  }

  if (cfAccountId && cfApiToken) {
    const model = Deno.env.get('CF_EMBEDDING_MODEL') || '@cf/baai/bge-base-en-v1.5';
    return { provider: 'cloudflare', model };
  }

  console.warn('[embedProvider] No API keys found, using deterministic fallback (dev-only)');
  return { provider: 'none', model: 'deterministic-hash' };
}

/**
 * Generate embeddings for array of texts using auto-detected provider
 * @returns Array of 1536-dim vectors (normalized to pgvector format)
 */
export async function embed(texts: string[]): Promise<number[][]> {
  const config = await getEmbeddingModel();
  
  console.log(`[embedProvider] Using provider: ${config.provider}, model: ${config.model}`);

  switch (config.provider) {
    case 'lovable':
      return embedLovable(texts, config.model);
    case 'cloudflare':
      return embedCloudflare(texts, config.model);
    case 'none':
      return embedDeterministic(texts);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

/**
 * Lovable AI Gateway embeddings (OpenAI-compatible)
 */
async function embedLovable(texts: string[], model: string): Promise<number[][]> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY')!;
  const embeddings: number[][] = [];

  for (const text of texts) {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, input: text })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Lovable embeddings failed: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const embedding = data?.data?.[0]?.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Invalid Lovable embedding response');
    }

    embeddings.push(normalizeEmbedding(embedding));
  }

  return embeddings;
}

/**
 * Cloudflare Workers AI embeddings
 */
async function embedCloudflare(texts: string[], model: string): Promise<number[][]> {
  const accountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')!;
  const apiToken = Deno.env.get('CLOUDFLARE_API_TOKEN')!;
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
  
  const embeddings: number[][] = [];

  for (const text of texts) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Cloudflare embeddings failed: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const embedding = data?.result?.data || data?.data;

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Invalid Cloudflare embedding response');
    }

    embeddings.push(normalizeEmbedding(embedding));
  }

  return embeddings;
}

/**
 * Deterministic fallback for dev/testing (DO NOT USE IN PRODUCTION)
 * Generates reproducible hash-based vectors
 */
async function embedDeterministic(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (const text of texts) {
    const hash = await hashString(text);
    const vec = new Array(1536).fill(0).map((_, i) => {
      const seed = (hash + i) * 2654435761; // Knuth multiplicative hash
      return (Math.sin(seed) + 1) / 2; // Normalize to [0,1]
    });
    embeddings.push(vec);
  }

  return embeddings;
}

/**
 * Normalize embedding to 1536 dimensions (pad or truncate)
 */
function normalizeEmbedding(embedding: number[]): number[] {
  const TARGET_DIM = 1536;

  if (embedding.length === TARGET_DIM) {
    return embedding;
  }

  if (embedding.length > TARGET_DIM) {
    console.warn(`[embedProvider] Truncating embedding from ${embedding.length} to ${TARGET_DIM}`);
    return embedding.slice(0, TARGET_DIM);
  }

  console.warn(`[embedProvider] Padding embedding from ${embedding.length} to ${TARGET_DIM}`);
  return [...embedding, ...new Array(TARGET_DIM - embedding.length).fill(0)];
}

/**
 * Simple string hash for deterministic fallback
 */
async function hashString(str: string): Promise<number> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  // Convert first 4 bytes to integer
  return (hashArray[0] << 24) | (hashArray[1] << 16) | (hashArray[2] << 8) | hashArray[3];
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
