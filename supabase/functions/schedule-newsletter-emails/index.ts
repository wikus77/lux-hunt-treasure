
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScheduleEmailRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { email, name = "Futuro Investigatore" }: ScheduleEmailRequest = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { 
          status: 400, 
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" } 
        }
      );
    }

    // In a production environment, you would actually schedule these emails
    // to be sent at specific times using a task queue or cron job
    console.log(`Scheduling newsletter emails for ${email}`);
    
    // Example: This would be where you'd queue up the emails
    // For now we'll just log the schedule
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 30); // 30 days from now
    
    const fifteenDaysBefore = new Date(launchDate);
    fifteenDaysBefore.setDate(launchDate.getDate() - 15);
    
    const sevenDaysBefore = new Date(launchDate);
    sevenDaysBefore.setDate(launchDate.getDate() - 7);
    
    const threeDaysBefore = new Date(launchDate);
    threeDaysBefore.setDate(launchDate.getDate() - 3);
    
    const oneDayBefore = new Date(launchDate);
    oneDayBefore.setDate(launchDate.getDate() - 1);
    
    console.log(`
      Email for ${email}:
      - 15 days before (${fifteenDaysBefore.toISOString()})
      - 7 days before (${sevenDaysBefore.toISOString()})
      - 3 days before (${threeDaysBefore.toISOString()})
      - 24 hours before (${oneDayBefore.toISOString()})
    `);

    // For testing purposes, let's send an immediate confirmation email
    await sendConfirmationEmail(email, name);

    return new Response(
      JSON.stringify({ success: true, message: "Emails scheduled successfully" }),
      { 
        status: 200, 
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("Error scheduling emails:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message || "An unexpected error occurred" }),
      { 
        status: 500, 
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" } 
      }
    );
  }
};

async function sendConfirmationEmail(email: string, name: string): Promise<void> {
  try {
    await resend.emails.send({
      from: "M1SSION <noreply@m1ssion.com>",
      to: [email],
      subject: "Benvenuto in M1SSION!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: linear-gradient(135deg, #00e5ff 0%, #b400ff 100%); padding: 2px;">
            <div style="background-color: #000; padding: 20px; text-align: center;">
              <h1 style="color: #00e5ff; margin: 0;">M1SSION</h1>
            </div>
          </div>
          
          <div style="background-color: #111; color: #fff; padding: 30px; border: 1px solid #333;">
            <h2 style="color: #00e5ff;">Ciao ${name},</h2>
            
            <p>Grazie per esserti iscritto alla newsletter di M1SSION! Sei ufficialmente parte di un'avventura investigativa unica nel suo genere.</p>
            
            <p>Preparati a ricevere aggiornamenti esclusivi sul lancio del gioco e indizi speciali che ti daranno un vantaggio quando inizierà la missione.</p>
            
            <div style="background-color: #000; border: 1px solid #00e5ff; padding: 15px; margin: 20px 0; text-align: center;">
              <p>Ti invieremo email importanti:</p>
              <ul style="list-style: none; padding: 0; text-align: left; display: inline-block;">
                <li style="margin-bottom: 10px;">✓ 15 giorni prima del lancio</li>
                <li style="margin-bottom: 10px;">✓ 7 giorni prima del lancio</li>
                <li style="margin-bottom: 10px;">✓ 3 giorni prima del lancio</li>
                <li>✓ 24 ore prima del lancio</li>
              </ul>
            </div>
            
            <p>Nel frattempo, sei invitato a condividere questa esperienza con amici e familiari. Più siete, più divertente sarà la competizione!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://m1ssion.com" style="background-color: #00e5ff; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Visita il Sito</a>
            </div>
            
            <p>Inizia a prepararti, investigatore. La M1SSION sta per cominciare.</p>
            
            <p>Cordiali saluti,<br>Il Team di M1SSION</p>
          </div>
          
          <div style="text-align: center; padding: 15px; font-size: 12px; color: #666;">
            <p>Se non desideri più ricevere queste email, puoi <a href="https://m1ssion.com/unsubscribe?email=${encodeURIComponent(email)}" style="color: #00e5ff;">cancellarti qui</a>.</p>
            <p>&copy; 2025 M1SSION. Tutti i diritti riservati.</p>
          </div>
        </div>
      `,
    });
    
    console.log(`Confirmation email sent to ${email}`);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw error;
  }
}

serve(handler);
