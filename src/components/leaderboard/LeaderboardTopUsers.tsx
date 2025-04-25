
import React from 'react';
import { motion } from 'framer-motion';
import { Medal, Award, Star } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Dati di esempio per i primi 3 utenti
const topUsers = [
  { 
    id: "1", 
    name: "Marco B.", 
    avatar: "", 
    score: 780, 
    cluesFound: 35, 
    areasExplored: 12, 
    reputation: 4.9 
  },
  { 
    id: "2", 
    name: "Giulia S.", 
    avatar: "", 
    score: 750, 
    cluesFound: 32, 
    areasExplored: 14, 
    reputation: 4.8 
  },
  { 
    id: "3", 
    name: "Alessandro R.", 
    avatar: "", 
    score: 720, 
    cluesFound: 30, 
    areasExplored: 15, 
    reputation: 4.7 
  }
];

export const LeaderboardTopUsers = () => {
  // Elemento centrale (primo classificato) ha un layout diverso
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {topUsers.map((user, index) => {
        // Per determinare il posizionamento e lo stile in base alla posizione
        const isFirst = index === 0;
        const medalColor = index === 0 ? "text-projectx-gold" : 
                           index === 1 ? "text-slate-300" : 
                           "text-amber-600";
        
        const medalSize = isFirst ? 'h-10 w-10' : 'h-8 w-8';
        
        // Animation variants
        const cardVariants = {
          hidden: { opacity: 0, y: 20 },
          show: { 
            opacity: 1, 
            y: 0,
            transition: { 
              delay: index * 0.15,
              duration: 0.6 
            }
          }
        };

        return (
          <motion.div
            key={user.id}
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className={`glass-card relative overflow-hidden ${
              isFirst ? 'md:order-2 border-projectx-gold glow-yellow' : 
              index === 1 ? 'md:order-1 border-slate-300' : 'md:order-3 border-amber-600'
            } ${isFirst ? 'p-6' : 'p-4'}`}
          >
            {/* Badge posizione */}
            <div 
              className={`absolute top-4 right-4 rounded-full w-8 h-8 flex items-center justify-center ${
                index === 0 ? 'bg-projectx-gold text-black' :
                index === 1 ? 'bg-slate-300 text-black' :
                'bg-amber-600 text-white'
              }`}
            >
              {index + 1}
            </div>
            
            {/* Contenuto card */}
            <div className={`flex flex-col items-center text-center ${isFirst ? 'gap-4' : 'gap-2'}`}>
              {/* Medaglia o icona di posizione */}
              {index === 0 ? (
                <Medal className={`${medalColor} ${medalSize} mb-1`} />
              ) : index === 1 ? (
                <Award className={`${medalColor} ${medalSize} mb-1`} />
              ) : (
                <Star className={`${medalColor} ${medalSize} mb-1`} />
              )}
              
              {/* Avatar */}
              <div className={`relative ${isFirst ? 'mb-3' : 'mb-2'}`}>
                <Avatar className={`${isFirst ? 'w-24 h-24' : 'w-16 h-16'} border-2 ${
                  index === 0 ? 'border-projectx-gold' :
                  index === 1 ? 'border-slate-300' :
                  'border-amber-600'
                }`}>
                  <AvatarImage
                    src={user.avatar || `https://avatar.vercel.sh/${user.name}`}
                    alt={user.name}
                  />
                  <AvatarFallback className="bg-black/50">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Nome e punteggio */}
              <div>
                <h3 className={`font-bold ${isFirst ? 'text-xl' : 'text-lg'} ${medalColor}`}>
                  {user.name}
                </h3>
                <p className={`${isFirst ? 'text-2xl' : 'text-xl'} font-bold mt-1`}>
                  {user.score} punti
                </p>
                
                {/* Statistiche aggiuntive */}
                <div className="text-xs text-gray-400 mt-2">
                  <div className="flex justify-center items-center gap-2">
                    <div>
                      <p className="font-medium">{user.cluesFound}</p>
                      <p>indizi</p>
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <div>
                      <p className="font-medium">{user.areasExplored}</p>
                      <p>aree</p>
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <div>
                      <p className="font-medium">{user.reputation}</p>
                      <p>rep.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
