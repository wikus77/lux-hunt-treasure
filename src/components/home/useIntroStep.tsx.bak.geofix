
import { useState, useEffect } from "react";

export const useIntroStep = () => {
  const [step, setStep] = useState<number>(() => {
    try {
      const introAlready = typeof window !== "undefined" && localStorage.getItem("homeIntroShown") === "true";
      console.log("[useIntroStep] INIT step – homeIntroShown", introAlready);
      return introAlready ? 1 : 0;
    } catch (err) {
      console.warn("[useIntroStep] init error", err);
      return 0;
    }
  });

  useEffect(() => {
    console.log("[useIntroStep] useEffect: step value", step);
    if (step === 1 && typeof window !== "undefined") {
      localStorage.setItem("homeIntroShown", "true");
      console.log("[useIntroStep] Set homeIntroShown=true in localStorage");
    }
  }, [step]);

  const handleIntroEnd = () => {
    console.log("[useIntroStep] handleIntroEnd fired");
    setStep(1);
  };

  return {
    step,
    handleIntroEnd
  };
};

export default useIntroStep;
