import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ContactFormData } from "./contactFormSchema";
import { supabase } from "@/integrations/supabase/client";

export function useContactFormSubmit() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setProgress(10); // Start progress
    
    try {
      // First step: Save to database
      setProgress(30);
      
      // Log attempt (only in development)
      if (import.meta.env.DEV) {
        console.log("Attempting to send message:", data);
      }

      // Save the message to the contacts table
      const { error: dbError } = await supabase
        .from('contacts')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject || "Contatto dal sito M1SSION",
          message: data.message
        });
      
      if (dbError) {
        console.error("Error saving contact to database:", dbError);
        throw new Error(`Error saving contact: ${dbError.message}`);
      }

      setProgress(50); // Update progress after saving

      // Prepare the data to send via email
      const contactData = {
        type: 'contact',
        to: [
          {
            email: "contact@m1ssion.com", 
            name: "M1SSION Team"
          }
        ],
        subject: data.subject || "Nuovo contatto dal sito M1SSION",
        htmlContent: generateContactEmailHtml(data),
        from: {
          email: "contact@m1ssion.com",
          name: "M1SSION Contact Form"
        },
        trackOpens: true,
        trackClicks: true,
        customCampaign: "contact_form",
        // GDPR consent tracking
        consent: {
          given: true,
          date: new Date().toISOString(),
          method: "contact_form"
        }
      };
      
      // Send email using Mailjet Edge Function
      const { data: responseData, error } = await supabase.functions.invoke('send-mailjet-email', {
        body: contactData
      });

      if (error) {
        console.error("Error from Mailjet Edge Function:", error);
        throw new Error(`Communication error: ${error.message}`);
      }
      
      setProgress(80); // Almost complete

      // Check the response
      if (!responseData || !responseData.success) {
        const errorMsg = responseData?.message || 'Error sending email';
        console.error("API Error:", errorMsg, responseData);
        throw new Error(errorMsg);
      }

      // Success notification
      toast({
        title: "Message sent successfully",
        description: "We'll get back to you as soon as possible!",
      });

      setProgress(100); // Complete

      return { success: true };
    } catch (error) {
      console.error("Detailed error in message submission:", error);
      
      // Error notification
      toast({
        variant: "destructive",
        title: "An error occurred while sending your message",
        description: "Please try again in a moment."
      });
      
      setProgress(0); // Reset progress on error
      return { success: false, error };
    } finally {
      // Keep the progress at 100% for success until the form resets
      setTimeout(() => {
        if (progress === 100) {
          setProgress(0);
        }
        setIsSubmitting(false);
      }, 1000); // Delay to show completed progress
    }
  };

  // HTML template for contact form emails
  const generateContactEmailHtml = (data: ContactFormData): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #00e5ff; color: #000; padding: 10px 20px; border-radius: 5px; }
          .content { padding: 20px 0; }
          .footer { font-size: 12px; color: #999; border-top: 1px solid #eee; margin-top: 30px; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New message from M1SSION</h2>
          </div>
          <div class="content">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${data.subject || 'Contact from M1SSION website'}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-line; background: #f9f9f9; padding: 15px; border-radius: 5px;">${data.message}</p>
          </div>
          <div class="footer">
            <p>This message was sent automatically from the M1SSION contact form.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return {
    handleSubmit,
    isSubmitting,
    progress
  };
}
