
/**
 * Email templates collection
 */

// Export all template generators
export { generateWelcomeEmailHtml } from './welcomeTemplate';
export { generateNotificationEmailHtml } from './notificationTemplate';
export { generateDefaultMarketingEmailHtml } from './marketingTemplate';
export { generateVerificationEmailHtml } from './verificationTemplate';
export { generatePasswordResetEmailHtml } from './passwordResetTemplate';
export { generatePreRegistrationEmailHtml } from './preRegistrationTemplate';
export { baseStyles } from './baseStyles';

// Legacy/alternative export method for backward compatibility
export * as emailTemplates from './emailTemplates';
