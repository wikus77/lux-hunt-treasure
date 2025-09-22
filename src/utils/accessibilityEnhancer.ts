// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Accessibility Enhancement Utilities

/**
 * Enhance keyboard navigation
 */
export const enhanceKeyboardNavigation = () => {
  // Add visible focus indicators
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('using-keyboard');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('using-keyboard');
  });

  // Skip to main content functionality
  const skipLink = document.querySelector('#skip-to-content') as HTMLAnchorElement;
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const main = document.querySelector('main') || document.querySelector('[role="main"]');
      if (main) {
        (main as HTMLElement).focus();
        (main as HTMLElement).scrollIntoView();
      }
    });
  }
};

/**
 * Ensure minimum touch target sizes (44px x 44px)
 */
export const validateTouchTargets = () => {
  if (import.meta.env.DEV || import.meta.env.VITE_QA_MODE) {
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"]');
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        console.warn('🎯 Touch target too small:', element, `${rect.width}x${rect.height}px`);
        (element as HTMLElement).style.outline = '2px solid orange';
      }
    });
  }
};

/**
 * Check color contrast ratios
 */
export const validateColorContrast = () => {
  if (import.meta.env.DEV || import.meta.env.VITE_QA_MODE) {
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, button, a, label, input, textarea');
    
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;
      
      // Only warn if both colors are set and not transparent
      if (bgColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = getContrastRatio(textColor, bgColor);
        if (contrast < 4.5) {
          console.warn('🎨 Low contrast detected:', element, `Ratio: ${contrast.toFixed(2)}`);
        }
      }
    });
  }
};

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  try {
    const rgb1 = parseRGB(color1);
    const rgb2 = parseRGB(color2);
    
    const l1 = getRelativeLuminance(rgb1);
    const l2 = getRelativeLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 21; // Return max ratio if parsing fails
  }
}

function parseRGB(color: string): [number, number, number] {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return [0, 0, 0];
}

function getRelativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Add ARIA labels to interactive elements missing them
 */
export const enhanceARIALabels = () => {
  // Buttons without labels
  const unlabeledButtons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
  unlabeledButtons.forEach((button, index) => {
    if (!button.textContent?.trim()) {
      (button as HTMLElement).setAttribute('aria-label', `Button ${index + 1}`);
      if (import.meta.env.DEV) {
        console.warn('🏷️ Button missing aria-label:', button);
      }
    }
  });

  // Links without labels
  const unlabeledLinks = document.querySelectorAll('a:not([aria-label]):not([aria-labelledby])');
  unlabeledLinks.forEach((link, index) => {
    if (!link.textContent?.trim()) {
      (link as HTMLElement).setAttribute('aria-label', `Link ${index + 1}`);
      if (import.meta.env.DEV) {
        console.warn('🏷️ Link missing aria-label:', link);
      }
    }
  });

  // Images without alt text
  const unaltedImages = document.querySelectorAll('img:not([alt])');
  unaltedImages.forEach(img => {
    (img as HTMLImageElement).setAttribute('alt', '');
    if (import.meta.env.DEV) {
      console.warn('🖼️ Image missing alt attribute:', img);
    }
  });
};

/**
 * Enhance form accessibility
 */
export const enhanceFormAccessibility = () => {
  // Associate labels with inputs
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const id = input.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (!label && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        if (import.meta.env.DEV) {
          console.warn('🏷️ Form element missing label:', input);
        }
      }
    }
  });

  // Add required indicators
  const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
  requiredInputs.forEach(input => {
    if (!input.getAttribute('aria-required')) {
      (input as HTMLElement).setAttribute('aria-required', 'true');
    }
  });
};

/**
 * Initialize all accessibility enhancements
 */
export const initAccessibilityEnhancements = () => {
  // Add CSS for keyboard navigation
  const style = document.createElement('style');
  style.textContent = `
    .using-keyboard *:focus {
      outline: 2px solid #4361ee !important;
      outline-offset: 2px !important;
    }
    
    .using-keyboard button:focus,
    .using-keyboard a:focus,
    .using-keyboard input:focus,
    .using-keyboard select:focus,
    .using-keyboard textarea:focus {
      box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.3) !important;
    }
  `;
  document.head.appendChild(style);

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      enhanceKeyboardNavigation();
      enhanceARIALabels();
      enhanceFormAccessibility();
      
      if (import.meta.env.DEV || import.meta.env.VITE_QA_MODE) {
        validateTouchTargets();
        validateColorContrast();
      }
    });
  } else {
    enhanceKeyboardNavigation();
    enhanceARIALabels();
    enhanceFormAccessibility();
    
    if (import.meta.env.DEV || import.meta.env.VITE_QA_MODE) {
      validateTouchTargets();
      validateColorContrast();
    }
  }
};

export default {
  enhanceKeyboardNavigation,
  validateTouchTargets,
  validateColorContrast,
  enhanceARIALabels,
  enhanceFormAccessibility,
  initAccessibilityEnhancements,
};