// @ts-nocheck

import { supabase } from "@/integrations/supabase/client";
import { sendRegistrationEmail } from "./email/registrationEmailService";

export interface NewsletterSubscriptionData {
  name: string;
  email: string;
  campaign?: string;
  referrer?: string;
}

export const saveSubscriber = async (data: NewsletterSubscriptionData): Promise<void> => {
  try {
    // Insert without pre-check to avoid exposing data via public SELECT
    const email = data.email.trim();
    let isDuplicate = false;

    const { error } = await supabase.from('newsletter_subscribers').insert([
      {
        name: data.name,
        email,
        campaign: data.campaign || 'website',
        referrer: data.referrer || null
      }
    ]);

    if (error) {
      // Handle unique email conflict gracefully
      if ((error as any).code === '23505') {
        isDuplicate = true;
      } else {
        throw error;
      }
    }

    // Send confirmation email in both cases (new or existing)
    await sendRegistrationEmail({
      email,
      name: data.name,
      formType: "newsletter"
    });

    if (import.meta.env.DEV) {
      console.debug(isDuplicate ? "Newsletter: email already subscribed" : "Newsletter: new subscriber added", email);
    }
  } catch (error) {
    console.error("Error saving newsletter subscriber:", error);
    throw error;
  }
};
