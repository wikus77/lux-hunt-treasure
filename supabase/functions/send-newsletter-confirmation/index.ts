
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface EmailRequest {
  name: string;
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const { name, email } = await req.json() as EmailRequest;
    
    if (!name || !email) {
      return new Response(
        JSON.stringify({
          error: "Nome ed email sono obbligatori",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Send confirmation email
    const { data, error } = await resend.emails.send({
      from: "M1SSION <noreply@m1ssion.com>",
      to: [email],
      subject: "Benvenuto in M1SSION! Preparati al lancio",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(90deg, #4361ee, #7209b7); padding: 20px; color: white; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background: linear-gradient(90deg, #4361ee, #7209b7); color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Benvenuto in M1SSION!</h1>
            </div>
            <div class="content">
              <p>Ciao ${name},</p>
              <p>Grazie per esserti iscritto alla newsletter di M1SSION! Siamo entusiasti di averti con noi in questa avventura.</p>
              <p>Riceverai presto aggiornamenti esclusivi sul nostro lancio e informazioni su come ottenere indizi e vantaggi speciali.</p>
              <p>Ecco cosa puoi aspettarti:</p>
              <ul>
                <li>Aggiornamenti 15 giorni prima del lancio</li>
                <li>Indizi esclusivi 7 giorni prima del lancio</li>
                <li>Guida strategica 3 giorni prima del lancio</li>
                <li>Crediti gratuiti 24 ore prima del lancio</li>
              </ul>
              <p>Resta sintonizzato e preparati per l'avventura!</p>
              <a href="https://m1ssion.com" class="button">Visita il nostro sito</a>
              <p>A presto,<br>Il team M1SSION</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    
    if (error) {
      console.error("Failed to send email:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to send email",
          details: error,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred",
        details: err.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
