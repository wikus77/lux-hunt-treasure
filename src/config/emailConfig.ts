
// This file contains email configuration settings
// Values are loaded from environment variables when available

export const emailConfig = {
  // EmailJS Configuration
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_m1ssion",
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_contact",
  userId: import.meta.env.VITE_EMAILJS_USER_ID || "",
  toEmail: import.meta.env.VITE_CONTACT_TO_EMAIL || "contact@m1ssion.com"
};
