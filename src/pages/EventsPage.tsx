
import React, { useState, useEffect } from 'react';
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/events/EventCard";
import { Event } from "@/data/eventData";

const EventsPage = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Caccia al tesoro a Milano",
      date: "15 Luglio 2024",
      location: "Milano, Italia",
      description: "Un'avventura emozionante nel cuore di Milano, alla ricerca di indizi nascosti e tesori inestimabili.",
      imageUrl: "/public/lovable-uploads/a253aeab-083c-4416-b20f-da7a0433ea3b.png",
      carModel: "",
      carBrand: "",
      gender: "man" as const,
      images: [
        {
          url: "/public/lovable-uploads/a253aeab-083c-4416-b20f-da7a0433ea3b.png",
          description: "Caccia al tesoro a Milano"
        }
      ],
      detailedDescription: "Un'avventura emozionante nel cuore di Milano, alla ricerca di indizi nascosti e tesori inestimabili."
    },
    {
      id: 2,
      title: "Raduno degli Agenti Segreti a Roma",
      date: "22 Agosto 2024",
      location: "Roma, Italia",
      description: "Incontra altri agenti, scambia informazioni e partecipa a missioni segrete nella città eterna.",
      imageUrl: "/public/lovable-uploads/a253aeab-083c-4416-b20f-da7a0433ea3b.png",
      carModel: "",
      carBrand: "",
      gender: "man" as const,
      images: [
        {
          url: "/public/lovable-uploads/a253aeab-083c-4416-b20f-da7a0433ea3b.png",
          description: "Raduno degli Agenti Segreti a Roma"
        }
      ],
      detailedDescription: "Incontra altri agenti, scambia informazioni e partecipa a missioni segrete nella città eterna."
    },
    {
      id: 3,
      title: "Sfida di Enigmi a Firenze",
      date: "10 Settembre 2024",
      location: "Firenze, Italia",
      description: "Metti alla prova le tue abilità di risoluzione degli enigmi in una delle città più belle del mondo.",
      imageUrl: "/public/lovable-uploads/a253aeab-083c-4416-b20f-da7a0433ea3b.png",
      carModel: "",
      carBrand: "",
      gender: "man" as const,
      images: [
        {
          url: "/public/lovable-uploads/a253aeab-083c-4416-b20f-da7a0433ea3b.png",
          description: "Sfida di Enigmi a Firenze"
        }
      ],
      detailedDescription: "Metti alla prova le tue abilità di risoluzione degli enigmi in una delle città più belle del mondo."
    },
  ]);

  useEffect(() => {
    setProfileImage(localStorage.getItem('profileImage'));
  }, []);

  const handleEmailClick = () => {
    window.location.href = "mailto:info@m1ssion.com";
  };

  return (
    <div className="min-h-screen bg-black">
      <UnifiedHeader 
        profileImage={profileImage} 
        onClickMail={handleEmailClick} 
      />
      <div className="container mx-auto py-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Prossimi Eventi</h1>
        <p className="text-gray-400 mb-8">
          Resta aggiornato su tutti gli eventi M1SSION in programma.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard 
              key={event.id}
              title={event.title}
              carModel={event.carModel}
              carBrand={event.carBrand}
              date={event.date}
              imageUrl={event.imageUrl}
              description={event.description}
              gender={event.gender}
              images={event.images}
              detailedDescription={event.detailedDescription}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
