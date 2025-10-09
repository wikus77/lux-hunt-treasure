// © 2025 Joseph MULÉ – M1SSION™ – NORAH AI Functions Base URL


/**
 * Handles both preview (.lovable.app) and production (m1ssion.eu) environments
 */
export function getFunctionsBase(): string {
  // Primary: use client URL + /functions/v1
  if (clientUrl) {
    return `${clientUrl}/functions/v1`;
  }

  // Fallback: detect from performance entries
  try {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (entry) {
      const url = new URL(entry.name);
    }
  } catch (e) {
    console.warn('[NORAH] Could not detect Functions base from performance entries:', e);
  }

}

/**
 */
export async function invokeFunctionRaw<T = any>(
  functionName: string,
  body?: any,
  options: RequestInit = {}
): Promise<{ data: T | null; error: any }> {
  const base = getFunctionsBase();
  const url = `${base}/${functionName}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[NORAH] Function ${functionName} failed:`, response.status, text);
      return { data: null, error: { status: response.status, message: text } };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`[NORAH] Function ${functionName} error:`, error);
    return { data: null, error };
  }
}
