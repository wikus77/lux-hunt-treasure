export async function safeJson(req: Request): Promise<any> {
  try {
    const raw = await req.text();
    if (!raw) return {};
    try { return JSON.parse(raw); } catch { return {}; }
  } catch { return {}; }
}
