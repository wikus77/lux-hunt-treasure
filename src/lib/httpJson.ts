/**
 * Robust HTTP JSON helper with explicit error details
 * Prevents "Failed to fetch" by showing HTTP status + body
 */

export interface HttpJsonError extends Error {
  status?: number;
  statusText?: string;
  details?: any;
}

export async function httpJson<T = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  const text = await res.text();
  
  let json: any;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = { raw: text };
  }
  
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText}`) as HttpJsonError;
    err.status = res.status;
    err.statusText = res.statusText;
    err.details = json;
    throw err;
  }
  
  return json as T;
}

export function formatHttpError(error: any): string {
  if (error?.status) {
    const details = error.details?.error || error.details?.message || '';
    return `HTTP ${error.status} ${error.statusText}${details ? `: ${details}` : ''}`;
  }
  return error?.message || 'Network error';
}
