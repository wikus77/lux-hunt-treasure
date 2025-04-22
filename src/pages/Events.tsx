
import { useState } from "react";
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
    <div className="pb-20 min-h-screen bg-black w-full">
      <header className="fixed top-0 left-0 right-0 z-40 w-full px-4 py-6 flex flex-col items-center justify-center border-b border-projectx-deep-blue glass-backdrop transition-colors duration-300">
        <h1 className="text-2xl font-bold neon-text">Eventi</h1>
        <p className="text-xs text-projectx-neon-blue">it is possible</p>
      </header>
      
      <div className="h-[72px] w-full" />
      
      {/* Moved current event section to the top */}
      <CurrentEventSection currentEvent={currentEvent} />
      
      {/* Filters */}
      <GenderFilter 
        selectedGender={selectedGender} 
        onGenderChange={setSelectedGender}
      />
      
      <UpcomingEventsSection events={filteredEvents} />
      
      <EventRules />
    </div>
  );
};

export default Events;
