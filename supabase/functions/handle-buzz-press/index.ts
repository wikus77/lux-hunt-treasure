import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

serve(async (req: Request) => {
  try {
    const { user_id, buzz_type } = await req.json()
    if (!user_id) {
      return new Response(JSON.stringify({ success: false, error: "Missing user_id" }), { status: 400 })
    }

    // Placeholder: simulazione indizio
    const clue_text = `Indizio BUZZ per utente ${user_id}, tipo=${buzz_type || "standard"}`

    return new Response(JSON.stringify({ success: true, clue_text }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 })
  }
})
