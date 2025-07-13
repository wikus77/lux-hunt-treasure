/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Mutation Observer Hook
 */

import { useEffect } from "react";

export const useMutationObserver = () => {
  // Protezione contro errori di rendering
  useEffect(() => {
    try {
      const observer = new MutationObserver(() => {
        const allSections = document.querySelectorAll("section");
        allSections.forEach((section) => {
          const text = section.textContent?.toLowerCase() || "";
          if (
            text.includes("cosa puoi vincere") ||
            text.includes("vuoi provarci") ||
            text.includes("premio principale") ||
            text.includes("auto di lusso")
          ) {
            section.style.display = "none";
            console.log("✅ Sezione 'Cosa puoi vincere' rimossa con MutationObserver.");
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
        console.log("🛑 MutationObserver disattivato.");
      };
    } catch (err) {
      console.error("Errore nel setup MutationObserver:", err);
    }
  }, []);
};