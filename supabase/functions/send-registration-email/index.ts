
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { Mailjet } from "https://esm.sh/node-mailjet"

// Add CORS headers to ensure browser requests work properly
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const { email, name, formType } = await req.json()

    console.log(`Processing ${formType} email for ${name} (${email})`)

    // Validate required fields
    if (!email || !formType) {
      return new Response(
        JSON.stringify({ success: false, error: "Email o tipo di form mancante" }), 
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      )
    }

    // Initialize Mailjet client with API keys from environment variables
    const mailjet = Mailjet.apiConnect(
      Deno.env.get("MJ_APIKEY_PUBLIC")!,
      Deno.env.get("MJ_APIKEY_PRIVATE")!
    )

    // Configure email based on form type
    let senderEmail = "noreply@m1ssion.com"
    let senderName = "M1SSION"
    let subject = "Benvenuto in M1SSION"
    let htmlPart = `<h2>Hai appena compiuto il primo passo.</h2><p>Benvenuto su M1SSION, la caccia ha inizio.</p>`

    // Customize email content based on form type
    if (formType === "agente") {
      senderEmail = "contact@m1ssion.com"
      subject = "Conferma ricezione richiesta agente"
      htmlPart = `<h3>Abbiamo ricevuto la tua richiesta per diventare agente. Ti contatteremo presto!</h3>`
    } else if (formType === "newsletter") {
      senderEmail = "contact@m1ssion.com"
      subject = "Iscrizione Newsletter M1SSION"
      htmlPart = `<h3>Grazie per esserti iscritto alla nostra newsletter!</h3><p>Riceverai aggiornamenti esclusivi sul lancio di M1SSION.</p>`
    } else if (formType === "contatto") {
      senderEmail = "contact@m1ssion.com"
      subject = "Abbiamo ricevuto il tuo messaggio"
      htmlPart = `<h3>Grazie per averci contattato!</h3><p>Ti risponderemo al più presto.</p>`
    } else if (formType === "preregistrazione") {
      senderEmail = "contact@m1ssion.com" 
      subject = "Pre-registrazione confermata"
      htmlPart = `<h3>Grazie per la tua pre-registrazione!</h3><p>Sei tra i primi a far parte di M1SSION. Ti aggiorneremo sul lancio.</p>`
    }

    console.log(`Sending email from ${senderEmail} to ${email} with subject "${subject}"`)

    // Send email through Mailjet API
    const response = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: { Email: senderEmail, Name: senderName },
          To: [{ Email: email, Name: name || "Utente" }],
          Subject: subject,
          HTMLPart: htmlPart,
          TrackOpens: "enabled",
          TrackClicks: "enabled"
        }
      ]
    })

    console.log("Mailjet API response:", response.body)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email inviata con successo",
        response: response.body
      }), 
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    )
  } catch (error: any) {
    console.error("Error sending email:", error)
    
    // Email di errore (fallback)
    try {
      console.log("Attempting to send error notification email")
      const mailjet = Mailjet.apiConnect(
        Deno.env.get("MJ_APIKEY_PUBLIC")!,
        Deno.env.get("MJ_APIKEY_PRIVATE")!
      )

      await mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: { Email: "contact@m1ssion.com", Name: "M1SSION Support" },
            To: [{ Email: "support@m1ssion.com", Name: "Admin" }],
            Subject: "Errore nell'invio email a utente",
            HTMLPart: `<p>Errore: ${error.message}</p><p>Stack: ${error.stack || "Non disponibile"}</p>`
          }
        ]
      })
      console.log("Error notification email sent")
    } catch (fallbackError) {
      console.error("Failed to send error notification:", fallbackError)
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Errore nell'invio email: " + error.message,
        details: error.stack || "No stack trace available"
      }), 
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    )
  }
})
