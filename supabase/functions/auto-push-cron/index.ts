// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * Edge Function: auto-push-cron
 * - Invio automatico notifiche push (3–5 al giorno)
 * - Usa SOLO la function esistente /functions/v1/webpush-send
 * - Protetta da x-cron-secret, NO JWT
 * - Nessuna modifica a catena push, Buzz, Buzz Map, Stripe
 */
const SB_URL = Deno.env.get("SUPABASE_URL")!;
const ADMIN_PUSH_TOKEN = Deno.env.get("PUSH_ADMIN_TOKEN")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// 🔥 Messaggi d’effetto e mistero M1SSION™
const LOCAL_TEMPLATES = [
  { title: "🕶️ AGENTE, IL GIOCO È INIZIATO", body: "Ogni dettaglio conta. Il tuo prossimo indizio ti sta aspettando." },
  { title: "💥 IL MONDO TI OSSERVA", body: "Agisci come se fossi l’unico a conoscere la verità. Premi il BUZZ e scopri cosa accade." },
  { title: "🗺️ TRACCIA ATTIVA", body: "La Buzz Map ha rilevato un’anomalia vicino a te. Potrebbe essere un segnale." },
  { title: "⚡ OGGI È IL GIORNO GIUSTO", body: "Non aspettare il momento perfetto. Crealo. M1SSION™ è in corso." },
  { title: "🧩 SEGNALE CRITTOGRAFATO", body: "Una nuova coordinata è apparsa. Solo chi osa scoprirà il segreto." },
  { title: "🚨 BUZZ MANCANTE", body: "Ogni silenzio è un’occasione persa. Riattiva la tua M1SSION." },
  { title: "💎 POTERE NELLE TUE MANI", body: "Un solo gesto può cambiare tutto. Premi il BUZZ e scrivi la tua storia." },
  { title: "🌌 IL FUTURO È UN CODICE", body: "Ogni azione genera una traccia. Oggi potresti decifrarne una." },
  { title: "🔥 NON TUTTI SOPRAVVIVONO ALL’ATTESA", body: "Il tempo scorre. Agisci prima che la finestra si chiuda." },
  { title: "🔔 È IL MOMENTO", body: "Chi è pronto non aspetta un segnale. Lo crea." }
];

function pickOne() {
  return LOCAL_TEMPLATES[Math.floor(Math.random() * LOCAL_TEMPLATES.length)];
}

Deno.serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const hour = now.getHours();
  if (hour >= 21 || hour < 9) {
    return new Response("⏸️ Quiet hours", { status: 200 });
  }

  const t = pickOne();
  const payload = {
    title: t.title,
    body: t.body,
    url: "/notifications"
  };

  const r = await fetch(`${SB_URL}/functions/v1/webpush-send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": ADMIN_PUSH_TOKEN,
      "apikey": ANON_KEY
    },
    body: JSON.stringify({ audience: "all", payload })
  });

  const data = await r.text();
  return new Response(
    JSON.stringify({ ok: true, template: t, result: data }),
    { headers: { "Content-Type": "application/json" } }
  );
});
