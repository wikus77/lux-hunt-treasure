
import CurrentEventSection from "@/components/home/CurrentEventSection";
import MysteryPrizesSection from "@/components/home/MysteryPrizesSection";
import CluesSection from "@/components/home/CluesSection";

const HomeContent = () => {
  return (
    <>
      <CurrentEventSection />
      
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-2/3">
          <CluesSection />
        </div>
        <div className="w-full sm:w-1/3">
          <MysteryPrizesSection />
        </div>
      </div>
    </>
  );
};

export default HomeContent;
