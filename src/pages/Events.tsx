
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
      {/* Sticky, glassy header */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue backdrop-blur-lg bg-black/70 transition-colors duration-300">
        <h1 className="text-2xl font-bold text-white">Eventi</h1>
      </header>
      {/* Compensa l'altezza della header per il contenuto */}
      <div className="h-[72px] w-full" /> {/* 72px = py-6 + approx padding on header */}
      {/* IG Filter always below header */}
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
