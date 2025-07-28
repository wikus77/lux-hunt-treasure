// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState } from "react";

export function SkipToContent() {
  const [isVisible, setIsVisible] = useState(false);

  const handleSkip = () => {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      (mainContent as HTMLElement).scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <button
      className={`fixed top-4 left-4 z-[9999] bg-cyan-600 text-white px-4 py-2 rounded-md font-medium transition-transform duration-200 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      onClick={handleSkip}
      tabIndex={0}
    >
      Salta al contenuto principale
    </button>
  );
}