import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

serve(async (req: Request) => {
  try {
    const { user_id, amount } = await req.json()
    if (!user_id) {
      return new Response(JSON.stringify({ success: false, error: "Missing user_id" }), { status: 400 })
    }

    // Placeholder: simulazione indizio
    const clue_text = `Indizio finale per pagamento di €${amount} dall'utente ${user_id}`

    return new Response(JSON.stringify({ success: true, clue_text }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 })
  }
})
