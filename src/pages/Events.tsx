
import { useState } from "react";
import BottomNavigation from "@/components/layout/BottomNavigation";
import GenderFilter from "@/components/events/GenderFilter";
import CurrentEventSection from "@/components/events/CurrentEventSection";
import UpcomingEventsSection from "@/components/events/UpcomingEventsSection";
import EventRules from "@/components/events/EventRules";
import { currentEvent, upcomingEvents } from "@/data/eventData";

export { currentEvent };

const Events = () => {
  const [selectedGender, setSelectedGender] = useState<string>("all");

  const filteredEvents = upcomingEvents.filter(event => 
    selectedGender === 'all' || event.gender === selectedGender
  );

  return (
    <div className="pb-20 min-h-screen bg-black">
      <header className="px-4 py-6 flex justify-between items-center border-b border-m1ssion-deep-blue">
        <h1 className="text-2xl font-bold neon-text">Eventi</h1>
      </header>

      <GenderFilter 
        selectedGender={selectedGender} 
        onGenderChange={setSelectedGender}
      />
      
      <CurrentEventSection currentEvent={currentEvent} />
      
      <UpcomingEventsSection events={filteredEvents} />
      
      <EventRules />

      <BottomNavigation />
    </div>
  );
};

export default Events;

