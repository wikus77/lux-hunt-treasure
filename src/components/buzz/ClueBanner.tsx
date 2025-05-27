
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ClueBannerProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const ClueBanner: React.FC<ClueBannerProps> = ({ open, message, onClose }) => {
  const [dynamicMessage, setDynamicMessage] = useState<string>(message);

  // Carica l'ultimo indizio dinamico quando il banner si apre
  useEffect(() => {
    const loadLatestClue = async () => {
      if (open) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Ottieni l'ultima notifica BUZZ dell'utente
            const { data: latestNotification, error } = await supabase
              .from('user_notifications')
              .select('message')
              .eq('user_id', user.id)
              .eq('type', 'buzz')
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (!error && latestNotification?.message) {
              setDynamicMessage(latestNotification.message);
            } else {
              // Fallback all'ultimo indizio dalla tabella user_clues
              const { data: latestClue, error: clueError } = await supabase
                .from('user_clues')
                .select('description_it')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

              if (!clueError && latestClue?.description_it) {
                setDynamicMessage(latestClue.description_it);
              } else {
                setDynamicMessage(message || "Hai sbloccato un nuovo indizio!");
              }
            }
          }
        } catch (error) {
          console.error("Errore caricamento indizio dinamico:", error);
          setDynamicMessage(message || "Hai sbloccato un nuovo indizio!");
        }
      }
    };

    loadLatestClue();
  }, [open, message]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[105] flex justify-center w-full pointer-events-none transition-all duration-500 ${open ? "translate-y-0 opacity-100" : "-translate-y-32 opacity-0"}`}
      style={{ transitionProperty: "transform, opacity" }}
    >
      <div className="bg-black/95 border-2 border-[#00D1FF] text-white py-4 px-8 rounded-b-2xl shadow-lg flex items-center gap-3 animate-fade-in pointer-events-auto w-full max-w-screen-lg mx-auto backdrop-blur-md">
        <div className="w-3 h-3 rounded-full bg-[#00D1FF] animate-pulse"></div>
        <span className="font-semibold text-[#00D1FF]" style={{ textShadow: "0 0 10px rgba(0, 209, 255, 0.6)" }}>
          Indizio Sbloccato:
        </span>
        <span className="text-white font-medium flex-1">
          {dynamicMessage}
        </span>
        <button
          onClick={onClose}
          className="ml-4 text-sm text-[#00D1FF] underline transition hover:text-[#FF59F8] font-medium"
          tabIndex={open ? 0 : -1}
          aria-label="Chiudi banner"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};

export default ClueBanner;
