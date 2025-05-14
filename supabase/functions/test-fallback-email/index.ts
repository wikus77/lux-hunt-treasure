
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("🧪 Starting test-fallback-email function");
  
  // Get email from request or use default
  let testData = {
    email: "youremail@example.com", // Default value
    name: "Test Agent",
    referral_code: "TEST123",
  };
  
  // Try to parse request body if present
  try {
    const requestData = await req.json();
    if (requestData.email) {
      testData = {
        ...testData,
        email: requestData.email,
        name: requestData.name || testData.name,
        referral_code: requestData.referral_code || testData.referral_code
      };
    }
  } catch (e) {
    // Use default data if no valid JSON was provided
    console.log("Using default test data");
  }
  
  console.log(`📧 Test will send to: ${testData.email}`);

  try {
    // 🚨 Simulate a Mailjet error
    console.log("🚨 Simulating Mailjet error...");
    throw new Error("Simulated Mailjet error for testing purposes");

  } catch (mailjetError) {
    console.error("❌ Mailjet failed:", mailjetError.message);

    // Fallback with IONOS SMTP
    try {
      console.log("🔄 Attempting IONOS SMTP fallback...");
      
      const smtpUser = Deno.env.get("IONOS_SMTP_USER");
      const smtpPass = Deno.env.get("IONOS_SMTP_PASS");

      if (!smtpUser || !smtpPass) {
        throw new Error("Missing SMTP credentials. Please set IONOS_SMTP_USER and IONOS_SMTP_PASS in Supabase secrets");
      }

      console.log("🔑 SMTP credentials found, connecting to IONOS...");
      
      const client = new SmtpClient();
      await client.connectTLS({
        hostname: "smtp.ionos.it",
        port: 587,
        username: smtpUser,
        password: smtpPass,
      });

      console.log("📤 Connected to SMTP server, sending email...");

      // Create a more professional HTML email template
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Test Email da M1SSION</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #0a0a0a; color: #ffffff; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a; }
              .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #333; }
              .logo { font-size: 28px; font-weight: bold; }
              .blue-text { color: #00E5FF; }
              .content { padding: 30px 0; }
              .referral-code { text-align: center; padding: 15px; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #00E5FF; }
              .test-badge { background-color: #ff3e00; color: white; padding: 5px 10px; border-radius: 4px; margin-bottom: 20px; display: inline-block; }
              .footer { text-align: center; padding-top: 30px; font-size: 12px; color: #888; border-top: 1px solid #333; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo"><span class="blue-text">M1</span>SSION</div>
              </div>
              <div class="content">
                <div class="test-badge">TEST FALLBACK EMAIL</div>
                <h1>Ciao ${testData.name}!</h1>
                <p>Questo è un test del sistema di fallback email di M1SSION.</p>
                
                <p>Il tuo codice di test è:</p>
                <div class="referral-code">${testData.referral_code}</div>
                
                <p>Se stai ricevendo questa email, significa che il sistema di fallback SMTP sta funzionando correttamente.</p>
                <p>Timestamp: ${new Date().toISOString()}</p>
              </div>
              <div class="footer">
                <p>&copy; 2025 M1SSION. Tutti i diritti riservati.</p>
                <p>Questo è un messaggio di test. Non è richiesta alcuna azione.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const result = await client.send({
        from: `M1SSION Test <${smtpUser}>`,
        to: testData.email,
        subject: "🧪 Test fallback email via IONOS SMTP",
        html: htmlContent,
        headers: {
          "X-Test-Type": "SMTP-Fallback",
          "X-Fallback": "IONOS",
        },
      });

      await client.close();
      console.log("✅ Fallback email sent successfully via IONOS SMTP to:", testData.email);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "✅ Fallback email sent successfully via IONOS SMTP",
          recipient: testData.email,
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );

    } catch (fallbackError) {
      console.error("❌ Fallback SMTP failed:", fallbackError.message);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: "Fallback SMTP failed",
          details: fallbackError.message,
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
  }
});
