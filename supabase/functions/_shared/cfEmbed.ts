// Cloudflare Workers AI embeddings helper
// Uses @cf/baai/bge-base-en-v1.5 (768d)

const CF_ACCOUNT = Deno.env.get("CLOUDFLARE_ACCOUNT_ID") || "";
const CF_TOKEN = Deno.env.get("CLOUDFLARE_API_TOKEN") || "";
const CF_EMBED_MODEL = Deno.env.get("CF_EMBEDDING_MODEL") || "@cf/baai/bge-base-en-v1.5";

/**
 * Generate a single embedding using Cloudflare Workers AI
 * @param text Input text to embed
 * @returns 768-dimensional vector
 */
export async function cfEmbed(text: string): Promise<number[]> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/run/${CF_EMBED_MODEL}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${CF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Cloudflare embeddings failed: ${res.status} ${errorText}`);
  }

  const json = await res.json();
  let e: any = json?.data;
  
  // Flatten nested arrays if needed
  if (Array.isArray(e) && Array.isArray(e[0])) e = e[0];
  
  return Array.isArray(e) ? e.map((n: any) => Number(n)) : [];
}

/**
 * Generate embeddings for multiple texts
 * @param texts Array of input texts
 * @returns Array of 768-dimensional vectors
 */
export async function cfEmbedBatch(texts: string[]): Promise<number[][]> {
  return Promise.all(texts.map(text => cfEmbed(text)));
}
