
import { useState, useEffect } from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import GenderFilter from "@/components/events/GenderFilter";
import CurrentEventSection from "@/components/events/CurrentEventSection";
import UpcomingEventsSection from "@/components/events/UpcomingEventsSection";
import EventRules from "@/components/events/EventRules";
import { currentEvent, upcomingEvents } from "@/data/eventData";

// Sposta in primo piano la CurrentEventSection (section "Auto Supercar Showdown")
// e mostra UpcomingEventsSection subito dopo

const Events = () => {
  const [selectedGender, setSelectedGender] = useState<string>("all");

  const filteredEvents = upcomingEvents.filter(event =>
    selectedGender === 'all' || event.gender === selectedGender
  );

  // Per aggiornare profileImage anche qui direttamente
  const [profileImage, setProfileImage] = useState<string | null>(null);
  useEffect(() => {
    setProfileImage(localStorage.getItem('profileImage'));
  }, []);

  return (
    <div className="pb-20 min-h-screen bg-black w-full">
      <UnifiedHeader profileImage={profileImage} />

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
