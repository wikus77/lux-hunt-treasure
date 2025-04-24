
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, UserCheck, Clock } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  avatar?: string;
  reputation: number;
  reputationCount: number;
  lastInteraction?: string;
}

// Sample data - In a real implementation this would come from an API
const sampleRecentUsers: User[] = [
  { id: "1", name: "Marco B.", reputation: 4.7, reputationCount: 42, lastInteraction: "2 ore fa" },
  { id: "2", name: "Giulia S.", reputation: 4.5, reputationCount: 36, lastInteraction: "ieri" },
  { id: "3", name: "Alessandro R.", reputation: 4.8, reputationCount: 28, lastInteraction: "3 giorni fa" },
  { id: "4", name: "Francesca M.", reputation: 4.2, reputationCount: 22, lastInteraction: "1 settimana fa" },
];

export function UserReputationSystem() {
  const [recentUsers, setRecentUsers] = useState<User[]>(sampleRecentUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>("");
  
  useEffect(() => {
    // In a real implementation, you'd fetch data from an API
    setRecentUsers(sampleRecentUsers);
  }, []);
  
  const handleRateUser = () => {
    if (!selectedUser) return;
    
    // In a real implementation, this would be an API call
    toast("Valutazione inviata", {
      description: `Hai valutato ${selectedUser.name} con ${ratingValue} stelle!`,
    });
    
    // Update the UI optimistically
    setRecentUsers(recentUsers.map(user => 
      user.id === selectedUser.id 
        ? {
            ...user,
            reputation: ((user.reputation * user.reputationCount) + ratingValue) / (user.reputationCount + 1),
            reputationCount: user.reputationCount + 1
          } 
        : user
    ));
    
    setSelectedUser(null);
    setRatingValue(5);
    setFeedback("");
  };
  
  return (
    <Card className="w-full bg-black/40 backdrop-blur-sm border-projectx-deep-blue/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-projectx-blue" />
          Sistema di Reputazione
        </CardTitle>
        <CardDescription>
          Valuta gli altri utenti con cui hai collaborato
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedUser ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center p-4 bg-black/30 rounded-lg">
              <Avatar className="h-16 w-16 mb-2 border-2 border-projectx-deep-blue">
                <img
                  src={selectedUser.avatar || `https://avatar.vercel.sh/${selectedUser.name}`}
                  alt={selectedUser.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${selectedUser.name}`;
                  }}
                />
              </Avatar>
              <p className="font-medium text-lg">{selectedUser.name}</p>
              <div className="flex items-center mt-1 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= selectedUser.reputation ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                    }`}
                  />
                ))}
                <span className="text-sm ml-2">({selectedUser.reputationCount})</span>
              </div>
              
              <div className="w-full mt-4 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm">La tua valutazione: {ratingValue} stelle</p>
                  <Slider
                    value={[ratingValue]}
                    min={1}
                    max={5}
                    step={0.5}
                    onValueChange={([val]) => setRatingValue(val)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Pessimo</span>
                    <span>Eccellente</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="feedback" className="text-sm">
                    Feedback (opzionale)
                  </label>
                  <Textarea
                    id="feedback"
                    placeholder="Condividi la tua esperienza..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="w-1/2"
                    onClick={() => setSelectedUser(null)}
                  >
                    Annulla
                  </Button>
                  <Button 
                    className="w-1/2 bg-gradient-to-r from-projectx-blue to-projectx-pink"
                    onClick={handleRateUser}
                  >
                    Invia Valutazione
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-medium">Utenti recenti con cui hai interagito</h3>
            
            <div className="space-y-2">
              {recentUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border border-gray-800 rounded-lg hover:bg-black/50 cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-gray-700">
                      <img
                        src={user.avatar || `https://avatar.vercel.sh/${user.name}`}
                        alt={user.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${user.name}`;
                        }}
                      />
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <div className="flex items-center text-xs text-gray-400 gap-1">
                        <Star className="h-3 w-3 text-yellow-400" />
                        {user.reputation.toFixed(1)} ({user.reputationCount})
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {user.lastInteraction}
                    </div>
                    
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {recentUsers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                  <UserCheck className="h-12 w-12 mb-2 opacity-40" />
                  <p>Non hai ancora interagito con nessun utente</p>
                  <p className="text-sm">Collabora con altri per valutarli</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
