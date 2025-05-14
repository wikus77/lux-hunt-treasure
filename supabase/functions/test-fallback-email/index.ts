
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

interface TestEmailRequest {
  email?: string;
  name?: string;
  referral_code?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let testData: TestEmailRequest = {
    email: "test@example.com",  // Default value
    name: "Test Agent",
    referral_code: "TEST123",
  };

  // If this is a POST request, get the data from the request body
  if (req.method === "POST") {
    try {
      const requestData = await req.json();
      testData = {
        ...testData,
        ...requestData
      };
    } catch (error) {
      console.error("Failed to parse request body:", error);
      // Continue with default values
    }
  }

  console.log("Test data:", testData);
  
  try {
    // 🚨 Simulate a Mailjet error
    console.log("❌ Simulating Mailjet error");
    throw new Error("Simulated Mailjet error");

  } catch (mailjetError) {
    console.error("❌ Mailjet failed:", mailjetError.message);

    // Fallback with SMTP IONOS
    try {
      const smtpUser = Deno.env.get("IONOS_SMTP_USER");
      const smtpPass = Deno.env.get("IONOS_SMTP_PASS");

      if (!smtpUser || !smtpPass) {
        throw new Error("Missing SMTP credentials");
      }

      console.log("Attempting to send via IONOS SMTP using sender: contact@m1ssion.com");

      const client = new SmtpClient();
      await client.connectTLS({
        hostname: "smtp.ionos.it",
        port: 587,
        username: smtpUser,
        password: smtpPass,
      });

      await client.send({
        from: "contact@m1ssion.com", // Changed from noreply@m1ssion.com to contact@m1ssion.com
        to: testData.email,
        subject: "🧪 Test fallback email via IONOS SMTP",
        html: `
          <h2>Ciao ${testData.name}</h2>
          <p>Il tuo codice è: <strong>${testData.referral_code}</strong></p>
          <p>Email inviata tramite indirizzo: contact@m1ssion.com</p>
        `,
        headers: {
          "X-Fallback-Test": "true",
          "X-Sender": "contact@m1ssion.com"
        }
      });

      await client.close();
      return new Response(JSON.stringify({
        success: true,
        message: "✅ Fallback email inviata via IONOS",
        details: {
          recipient: testData.email,
          sender: "contact@m1ssion.com",
          time: new Date().toISOString()
        }
      }), { 
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });

    } catch (fallbackError) {
      console.error("❌ Fallback SMTP failed:", fallbackError.message);
      return new Response(JSON.stringify({
        success: false,
        message: "🚫 Fallito su entrambi i canali",
        error: fallbackError.message
      }), { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
  }
});
