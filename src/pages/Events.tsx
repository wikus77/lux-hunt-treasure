
import { useState, useEffect } from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import GenderFilter from "@/components/events/GenderFilter";
import UpcomingEventsSection from "@/components/events/UpcomingEventsSection";
import EventRules from "@/components/events/EventRules";
import { upcomingEvents } from "@/data/eventData";
import CurrentEventSection from "@/components/events/CurrentEventSection"; // Reintrodotto

const Events = () => {
  const [selectedGender, setSelectedGender] = useState<string>("all");

  const filteredEvents = upcomingEvents.filter(event =>
    selectedGender === 'all' || event.gender === selectedGender
  );

  // Individuiamo l'evento corrente per visualizzarlo nella sezione dedicata
  const currentEvent = upcomingEvents.find(event => event.isCurrent) || upcomingEvents[0];

  // Per aggiornare profileImage
  const [profileImage, setProfileImage] = useState<string | null>(null);
  useEffect(() => {
    setProfileImage(localStorage.getItem('profileImage'));
  }, []);

  return (
    <div className="pb-20 min-h-screen bg-black w-full">
      <UnifiedHeader profileImage={profileImage} />

      <div className="h-[72px] w-full" />

      {/* Filters */}
      <GenderFilter
        selectedGender={selectedGender}
        onGenderChange={setSelectedGender}
      />

      {/* Riaggiunta la sezione CurrentEventSection per prima */}
      <CurrentEventSection currentEvent={currentEvent} />

      {/* UpcomingEventsSection torna ad essere la seconda */}
      <UpcomingEventsSection events={filteredEvents.filter(event => !event.isCurrent)} />

      <EventRules />
    </div>
  );
};

export default Events;
