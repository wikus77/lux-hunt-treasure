import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req: Request) => {
  try {
    // 🔑 Controllo autorizzazione con Service Role Key
    const authHeader = req.headers.get("authorization") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!authHeader.includes(serviceKey)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    // 📩 Lettura payload JSON
    const { user_id, title, body } = await req.json();

    console.log(`📲 Sending push notification to ${user_id}: ${title} - ${body}`);

    // 🟢 Risposta OK
    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" }
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
});