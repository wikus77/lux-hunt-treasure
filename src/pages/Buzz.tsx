
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BuzzFeatureWrapper from "@/components/buzz/BuzzFeatureWrapper";
import BuzzMainContent from "@/components/buzz/BuzzMainContent";

const Buzz = () => {
  return (
    <div className="min-h-screen bg-black pb-20 w-full">
      <UnifiedHeader />
      <BuzzFeatureWrapper>
        <BuzzMainContent />
      </BuzzFeatureWrapper>
    </div>
  );
};

export default Buzz;
