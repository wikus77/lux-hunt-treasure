/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * M1SSION™ User Synchronization Service
 * Handles email notifications, push notifications, and external integrations
 */

import { supabase } from '@/integrations/supabase/client';

export interface NotificationPayload {
  title: string;
  message: string;
  metadata?: any;
}

export interface EmailNotificationPayload extends NotificationPayload {
  template?: string;
  variables?: Record<string, any>;
}

export interface PushNotificationPayload extends NotificationPayload {
  badge?: number;
  sound?: string;
  category?: string;
}

class UserSyncService {
  /**
   * Send email notification via Mailjet
   */
  async sendEmailNotification(
    userId: string, 
    payload: EmailNotificationPayload
  ): Promise<boolean> {
    try {
      console.log('📧 M1SSION™ Sending email notification:', payload.title);

      const { data, error } = await supabase.functions.invoke('send-mailjet-email', {
        body: {
          type: 'notification',
          to: [{ email: 'user@email.com' }], // This should be fetched from user profile
          subject: payload.title,
          htmlContent: this.generateEmailTemplate(payload),
          trackOpens: true,
          trackClicks: true,
          customCampaign: 'user_sync_notification',
          variables: payload.variables || {}
        }
      });

      if (error) {
        console.error('❌ M1SSION™ Email notification error:', error);
        
        // Log the failure
        await supabase.rpc('send_user_notification', {
          p_user_id: userId,
          p_notification_type: 'email',
          p_title: payload.title,
          p_message: payload.message,
          p_metadata: { 
            ...payload.metadata, 
            delivery_status: 'failed',
            error: error.message 
          }
        });
        
        return false;
      }

      // Log successful email
      await supabase.rpc('send_user_notification', {
        p_user_id: userId,
        p_notification_type: 'email',
        p_title: payload.title,
        p_message: payload.message,
        p_metadata: { 
          ...payload.metadata, 
          delivery_status: 'sent',
          mailjet_response: data 
        }
      });

      console.log('✅ M1SSION™ Email notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ M1SSION™ Email notification failed:', error);
      return false;
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(
    userId: string, 
    payload: PushNotificationPayload
  ): Promise<boolean> {
    try {
      console.log('📱 M1SSION™ Sending push notification:', payload.title);

      // Get user device tokens
      const { data: deviceTokens, error: tokenError } = await supabase
        .from('device_tokens')
        .select('token, device_type')
        .eq('user_id', userId);

      if (tokenError || !deviceTokens?.length) {
        console.warn('⚠️ M1SSION™ No device tokens found for user:', userId);
        return false;
      }

      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          tokens: deviceTokens.map(dt => dt.token),
          title: payload.title,
          body: payload.message,
          badge: payload.badge || 1,
          sound: payload.sound || 'default',
          category: payload.category || 'general',
          data: payload.metadata || {}
        }
      });

      if (error) {
        console.error('❌ M1SSION™ Push notification error:', error);
        
        // Log the failure
        await supabase.rpc('send_user_notification', {
          p_user_id: userId,
          p_notification_type: 'push',
          p_title: payload.title,
          p_message: payload.message,
          p_metadata: { 
            ...payload.metadata, 
            delivery_status: 'failed',
            error: error.message 
          }
        });
        
        return false;
      }

      // Log successful push
      await supabase.rpc('send_user_notification', {
        p_user_id: userId,
        p_notification_type: 'push',
        p_title: payload.title,
        p_message: payload.message,
        p_metadata: { 
          ...payload.metadata, 
          delivery_status: 'sent',
          push_response: data 
        }
      });

      console.log('✅ M1SSION™ Push notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ M1SSION™ Push notification failed:', error);
      return false;
    }
  }

  /**
   * Send comprehensive notification (email + push + in-app)
   */
  async sendComprehensiveNotification(
    userId: string,
    emailPayload: EmailNotificationPayload,
    pushPayload?: PushNotificationPayload
  ): Promise<{ email: boolean; push: boolean; inApp: boolean }> {
    const results = {
      email: false,
      push: false,
      inApp: false
    };

    try {
      // Send in-app notification first (always works)
      const { error: inAppError } = await supabase.rpc('send_user_notification', {
        p_user_id: userId,
        p_notification_type: 'in_app',
        p_title: emailPayload.title,
        p_message: emailPayload.message,
        p_metadata: emailPayload.metadata || {}
      });

      results.inApp = !inAppError;

      // Send email notification
      results.email = await this.sendEmailNotification(userId, emailPayload);

      // Send push notification if payload provided
      if (pushPayload) {
        results.push = await this.sendPushNotification(userId, pushPayload);
      }

      // Log comprehensive notification
      await supabase.rpc('log_user_action', {
        p_user_id: userId,
        p_action: 'comprehensive_notification_sent',
        p_details: {
          title: emailPayload.title,
          results,
          timestamp: new Date().toISOString()
        }
      });

      console.log('✅ M1SSION™ Comprehensive notification completed:', results);
      return results;
    } catch (error) {
      console.error('❌ M1SSION™ Comprehensive notification failed:', error);
      return results;
    }
  }

  /**
   * Handle plan upgrade notifications
   */
  async handlePlanUpgradeNotifications(
    userId: string, 
    oldPlan: string, 
    newPlan: string
  ): Promise<void> {
    try {
      const planLabels = {
        base: 'Base',
        silver: 'Silver',
        gold: 'Gold',
        black: 'Black',
        titanium: 'Titanium'
      };

      const earlyAccessHours = {
        silver: 2,
        gold: 24,
        black: 48,
        titanium: 72
      };

      const oldLabel = planLabels[oldPlan as keyof typeof planLabels] || oldPlan;
      const newLabel = planLabels[newPlan as keyof typeof planLabels] || newPlan;
      const earlyHours = earlyAccessHours[newPlan as keyof typeof earlyAccessHours] || 0;

      // Email notification
      const emailPayload: EmailNotificationPayload = {
        title: `Piano aggiornato a ${newLabel}!`,
        message: `Congratulazioni! Il tuo piano M1SSION™ è stato aggiornato da ${oldLabel} a ${newLabel}. ${earlyHours > 0 ? `Ora hai ${earlyHours}h di accesso anticipato!` : ''}`,
        template: 'plan_upgrade',
        variables: {
          old_plan: oldLabel,
          new_plan: newLabel,
          early_access_hours: earlyHours,
          upgrade_date: new Date().toLocaleDateString('it-IT')
        },
        metadata: {
          old_plan: oldPlan,
          new_plan: newPlan,
          early_access_hours: earlyHours,
          notification_category: 'plan_upgrade'
        }
      };

      // Push notification
      const pushPayload: PushNotificationPayload = {
        title: 'Piano Aggiornato!',
        message: `Benvenuto nel piano ${newLabel}!`,
        badge: 1,
        category: 'plan_upgrade',
        metadata: {
          plan: newPlan,
          action: 'open_app'
        }
      };

      await this.sendComprehensiveNotification(userId, emailPayload, pushPayload);

      // If early access enabled, send additional early access notification
      if (earlyHours > 0) {
        const earlyAccessEmail: EmailNotificationPayload = {
          title: 'Accesso Anticipato Attivato!',
          message: `Il tuo piano ${newLabel} ti garantisce ${earlyHours}h di accesso anticipato alle missioni M1SSION™. Sarai tra i primi a scoprire nuovi indizi!`,
          template: 'early_access_activated',
          variables: {
            plan: newLabel,
            hours: earlyHours
          },
          metadata: {
            notification_category: 'early_access',
            early_access_hours: earlyHours
          }
        };

        setTimeout(() => {
          this.sendEmailNotification(userId, earlyAccessEmail);
        }, 5000); // Send 5 seconds after upgrade notification
      }

      console.log('✅ M1SSION™ Plan upgrade notifications sent');
    } catch (error) {
      console.error('❌ M1SSION™ Plan upgrade notifications failed:', error);
    }
  }

  /**
   * Generate email template
   */
  private generateEmailTemplate(payload: EmailNotificationPayload): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${payload.title}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #0F0F23 0%, #1A1A3E 100%);
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 16px;
              padding: 40px;
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .logo {
              text-align: center;
              margin-bottom: 30px;
            }
            .title {
              color: #00D9FF;
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 20px;
              text-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
            }
            .message {
              color: #E0E0E0;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .cta {
              text-align: center;
              margin: 30px 0;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #00D9FF, #0099CC);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              box-shadow: 0 4px 20px rgba(0, 217, 255, 0.3);
            }
            .footer {
              text-align: center;
              color: #888;
              font-size: 12px;
              margin-top: 40px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1 style="color: #00D9FF; font-size: 28px; margin: 0;">M1SSION™</h1>
            </div>
            <div class="title">${payload.title}</div>
            <div class="message">${payload.message}</div>
            <div class="cta">
              <a href="https://app.m1ssion.com" class="cta-button">Apri M1SSION™</a>
            </div>
            <div class="footer">
              © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const userSyncService = new UserSyncService();