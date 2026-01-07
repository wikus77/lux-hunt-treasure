// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Admin Configuration - Centralized admin management

/**
 * ADMIN EMAILS - Centralized list of admin emails
 * In future, this can be loaded from database
 */
const ADMIN_EMAILS: string[] = [
  'wikus77@hotmail.it',
  'joseph@m1ssion.io',
];

/**
 * Special admin codes mapping
 * 🔴 MCP = Master Control Program (Admin only)
 */
const ADMIN_CODES: Record<string, string> = {
  'wikus77@hotmail.it': 'MCP',
};

/**
 * Check if an email is an admin
 * @param email - Email to check
 * @returns true if email is admin
 */
export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.some(admin => 
    admin.toLowerCase() === email.toLowerCase()
  );
};

/**
 * Check if user object is admin
 * @param user - User object with email property
 * @returns true if user is admin
 */
export const isAdminUser = (user: { email?: string | null } | null | undefined): boolean => {
  return isAdminEmail(user?.email);
};

/**
 * Get admin agent code if user is admin
 * @param email - Email to check
 * @returns Admin code or null
 */
export const getAdminCode = (email: string | null | undefined): string | null => {
  if (!email) return null;
  const normalizedEmail = email.toLowerCase();
  
  for (const [adminEmail, code] of Object.entries(ADMIN_CODES)) {
    if (adminEmail.toLowerCase() === normalizedEmail) {
      return code;
    }
  }
  return null;
};

/**
 * Primary admin email (owner)
 */
export const PRIMARY_ADMIN_EMAIL = 'wikus77@hotmail.it';

/**
 * Get all admin emails (for admin panels)
 */
export const getAdminEmails = (): readonly string[] => {
  return Object.freeze([...ADMIN_EMAILS]);
};

export default {
  isAdminEmail,
  isAdminUser,
  getAdminCode,
  getAdminEmails,
  PRIMARY_ADMIN_EMAIL,
};


