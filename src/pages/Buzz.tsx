
import React from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BuzzFeatureWrapper from "@/components/buzz/BuzzFeatureWrapper";
import BuzzMainContent from "@/components/buzz/BuzzMainContent";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ErrorFallback from "@/components/error/ErrorFallback";
import BottomNavigation from "@/components/layout/BottomNavigation";

const Buzz = () => {
  return (
    <div className="min-h-screen bg-black pb-20 w-full">
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      <ErrorBoundary fallback={<ErrorFallback message="Si è verificato un errore nel caricamento della funzione Buzz" />}>
        <BuzzFeatureWrapper>
          <BuzzMainContent />
        </BuzzFeatureWrapper>
      </ErrorBoundary>
      <BottomNavigation />
    </div>
  );
};

export default Buzz;
