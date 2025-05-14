
import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import EventsPage from "./EventsPage";
import PublicLayout from "@/components/layout/PublicLayout";

const Events: React.FC = () => {
  useEffect(() => {
    // Assicuriamoci che la pagina inizi dalla parte superiore
    window.scrollTo(0, 0);
    
    // Log per diagnosticare eventuali problemi di rendering
    console.log("Events page mounted");
  }, []);
  
  return (
    <PublicLayout>
      <Helmet>
        <title>Eventi M1SSION - Partecipa ai nostri eventi esclusivi</title>
        <meta name="description" content="Scopri gli eventi esclusivi organizzati da M1SSION. Partecipa e vinci premi straordinari." />
      </Helmet>
      
      <EventsPage />
    </PublicLayout>
  );
};

export default Events;
