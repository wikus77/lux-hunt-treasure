// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// HTML Sanitization for AI-generated content

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content with strict security profile
 * Used for AI-generated responses to prevent XSS attacks
 */
export function sanitizeHTML(dirty: string): string {
  const config = {
    ALLOWED_TAGS: [
      'b', 'i', 'strong', 'em', 'u', 'br', 'p', 
      'ul', 'ol', 'li', 'code', 'pre', 'a', 'span',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'hr'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    FORBID_TAGS: ['style', 'img', 'svg', 'math', 'iframe', 'script', 'object', 'embed'],
    FORBID_ATTR: ['style', 'src', 'srcset', 'onerror', 'onclick'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target', 'rel'],
    RETURN_TRUSTED_TYPE: false,
  };

  // Sanitize with DOMPurify
  let clean = DOMPurify.sanitize(dirty, config);

  // Force all links to open in new tab with security attributes
  clean = clean.replace(
    /<a\s+([^>]*href=["'][^"']*["'][^>]*)>/gi,
    '<a $1 target="_blank" rel="noopener noreferrer nofollow">'
  );

  return clean;
}

/**
 * Sanitize text-only content (strips all HTML)
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize markdown-to-HTML conversion output
 */
export function sanitizeMarkdown(html: string): string {
  // Same as sanitizeHTML but allows more formatting tags
  const config = {
    ALLOWED_TAGS: [
      'b', 'i', 'strong', 'em', 'u', 'br', 'p', 
      'ul', 'ol', 'li', 'code', 'pre', 'a', 'span',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'colspan', 'rowspan'],
    FORBID_TAGS: ['style', 'img', 'svg', 'math', 'iframe', 'script'],
    FORBID_ATTR: ['style', 'src', 'onerror', 'onclick'],
  };

  let clean = DOMPurify.sanitize(html, config);

  // Force link security
  clean = clean.replace(
    /<a\s+([^>]*href=["'][^"']*["'][^>]*)>/gi,
    '<a $1 target="_blank" rel="noopener noreferrer nofollow">'
  );

  return clean;
}
