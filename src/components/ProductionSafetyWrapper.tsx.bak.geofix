// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useEffect } from 'react';

interface ProductionSafetyWrapperProps {
  children: React.ReactNode;
}

/**
 * Production Safety Wrapper
 * Prevents any debug content from being rendered in production builds
 */
export const ProductionSafetyWrapper: React.FC<ProductionSafetyWrapperProps> = ({ children }) => {
  useEffect(() => {
    if (import.meta.env.PROD) {
      // Set global flag to prevent any debug dumps
      (window as any).__M1_NO_SHIM_DUMP__ = true;
      (window as any).__M1_PROD_MODE__ = true;
      
      // Additional safety: scan and remove any stray text nodes that might contain debug content
      const removeDebugContent = () => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              const text = node.textContent || '';
              if (text.includes('Stripe Shim Globale') || 
                  text.includes('window.getStripe') || 
                  text.includes('STRIPE_PK') ||
                  text.includes('stripeFallback')) {
                return NodeFilter.FILTER_ACCEPT;
              }
              return NodeFilter.FILTER_REJECT;
            }
          }
        );
        
        const nodesToRemove: Node[] = [];
        let node;
        while (node = walker.nextNode()) {
          nodesToRemove.push(node);
        }
        
        nodesToRemove.forEach(node => {
          const parent = node.parentNode;
          if (parent && parent.nodeType === Node.ELEMENT_NODE) {
            const element = parent as Element;
            // If the parent only contains debug text, hide the whole element
            if (element.textContent?.includes('Stripe Shim Globale')) {
              (element as HTMLElement).style.display = 'none';
            } else {
              // Otherwise, just remove the text node
              parent.removeChild(node);
            }
          }
        });
      };
      
      // Run immediately and also set up observer for dynamic content
      removeDebugContent();
      
      // Set up mutation observer to catch any dynamically added debug content
      const observer = new MutationObserver(() => {
        removeDebugContent();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
      
      // Cleanup
      return () => observer.disconnect();
    }
  }, []);

  return <>{children}</>;
};
