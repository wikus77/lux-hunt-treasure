
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
      {/* Moved filter under the main header */}
      <GenderFilter 
        selectedGender={selectedGender} 
        onGenderChange={setSelectedGender}
      />
      
      <CurrentEventSection currentEvent={currentEvent} />
      
      <UpcomingEventsSection events={filteredEvents} />
      
      <EventRules />
    </div>
  );
};

export default Events;
