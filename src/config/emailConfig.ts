
// This file contains email configuration settings
// Values are loaded from environment variables when available

export const emailConfig = {
  // EmailJS Configuration
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID", // Replace with actual ID when available
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID", // Replace with actual ID when available
  userId: import.meta.env.VITE_EMAILJS_USER_ID || "QifCjxAyLD3408pzU", // Public key provided by user
  toEmail: import.meta.env.VITE_CONTACT_TO_EMAIL || "contact@m1ssion.com"
};
