// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

/**
 * Replace Lovable image paths with local asset paths
 */
export function cleanImagePath(path: string): string {
  if (path.includes('/lovable-uploads/')) {
    return path.replace('/lovable-uploads/', '/assets/');
  }
  return path;
}

/**
 * Clean all Lovable references from text
 */
export function cleanLovableReferences(text: string): string {
  return text
    .replace(/lovable/gi, 'M1SSION')
    .replace(/\/lovable-uploads\//g, '/assets/');
}