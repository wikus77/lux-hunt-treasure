import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Shield, Clock, Award, FileText, CreditCard, Link2, Edit, Save, User } from "lucide-react";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import NotificationsDrawer from "@/components/notifications/NotificationsDrawer";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("Appassionato di auto di lusso e collezionista. Amo la velocità e l'adrenalina!");
  const [name, setName] = useState("Mario Rossi");
  const [agentCode, setAgentCode] = useState("AG-X480");
  const [agentTitle, setAgentTitle] = useState("Decoder");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const { toast } = useToast();

  // Stats data
  const [stats, setStats] = useState({
    missionsCompleted: 12,
    cluesFound: 47,
    totalPlayTime: "123h 45m",
    pointsEarned: 9850,
    prizeProgress: 68,
    bestResult: "Top 5% in Mission X"
  });
  
  // Style analysis
  const [investigativeStyle, setInvestigativeStyle] = useState({
    style: "Ragionatore Strategico", 
    color: "bg-cyan-500"
  });

  // Operational history
  const [history, setHistory] = useState([
    { type: "access", date: "2025-05-03T14:30:00", details: "Login da dispositivo principale" },
    { type: "mission", date: "2025-05-02T10:15:00", details: "Completata Missione: Enigma della Strada" },
    { type: "clue", date: "2025-05-01T16:20:00", details: "Acquistato indizio CL-445: 'Tracce digitali'" },
    { type: "communication", date: "2025-04-30T08:45:00", details: "Nuova comunicazione da HQ: Aggiornamento missione" }
  ]);

  // Wallet
  const [credits, setCredits] = useState(2500);

  // Achievements
  const [badges, setBadges] = useState([
    { id: "b1", name: "Primo Contatto", description: "Hai completato la tua prima missione", unlocked: true, pinned: true },
    { id: "b2", name: "Segugio", description: "Hai trovato 10 indizi", unlocked: true, pinned: false },
    { id: "b3", name: "Viaggiatore", description: "Hai esplorato 5 location diverse", unlocked: true, pinned: false },
    { id: "b4", name: "Decifratore", description: "Hai risolto un enigma di livello difficile", unlocked: false, pinned: false }
  ]);

  // Subscription
  const [subscription, setSubscription] = useState({
    plan: "Gold",
    expiry: "2025-12-31",
    benefits: ["Accesso prioritario", "Indizi esclusivi", "Supporto dedicato"]
  });
  
  // Personal notes
  const [personalNotes, setPersonalNotes] = useState("Indizi sulla localizzazione del premio sembrano puntare a Nord...");

  // Load saved profile data from localStorage on component mount
  useEffect(() => {
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) setProfileImage(savedProfileImage);

    const savedName = localStorage.getItem('profileName');
    if (savedName) setName(savedName);

    const savedBio = localStorage.getItem('profileBio');
    if (savedBio) setBio(savedBio);
    
    const savedAgentCode = localStorage.getItem('agentCode');
    if (savedAgentCode) setAgentCode(savedAgentCode);
  }, []);

  // Handle saving profile data
  const handleSaveProfile = () => {
    if (profileImage) {
      localStorage.setItem('profileImage', profileImage);
    }
    localStorage.setItem('profileName', name);
    localStorage.setItem('profileBio', bio);
    localStorage.setItem('agentCode', agentCode);

    setIsEditing(false);
    toast({
      title: "Profilo aggiornato",
      description: "Le modifiche al tuo dossier agente sono state salvate."
    });
  };
  
  const handleShowNotifications = () => {
    setShowNotifications(true);
  };

  const togglePinBadge = (id: string) => {
    setBadges(badges.map(badge => 
      badge.id === id 
        ? {...badge, pinned: !badge.pinned} 
        : badge.id !== id && badge.pinned 
          ? {...badge, pinned: false} 
          : badge
    ));
  };

  const navigateToPersonalInfo = () => {
    navigate('/personal-info');
  };

  const navigateToPrivacySecurity = () => {
    navigate('/privacy-security');
  };

  const navigateToPaymentMethods = () => {
    navigate('/payment-methods');
  };

  const navigateToSubscriptions = () => {
    navigate('/subscriptions');
  };

  return (
    <ProfileLayout>
      <div className="glass-card mx-4 mt-4 mb-20">
        {/* Header with Agent Code and Edit Button */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-mono">DOSSIER AGENTE:</span>
            <span className="font-mono text-white bg-cyan-900/30 px-2 py-1 rounded">{agentCode}</span>
            {!isEditing && <Badge className="bg-cyan-600">{agentTitle}</Badge>}
          </div>
          
          <Button
            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            size="sm"
            className="bg-cyan-800 hover:bg-cyan-700"
          >
            {isEditing ? <Save className="h-4 w-4 mr-1" /> : <Edit className="h-4 w-4 mr-1" />}
            {isEditing ? "Salva" : "Modifica"}
          </Button>
        </div>
        
        {/* Profile Information */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column - Avatar and Basic Info */}
            <div className="flex-shrink-0 flex flex-col items-center md:w-1/3">
              <div className="relative">
                <Avatar className="w-32 h-32 border-2 border-cyan-500 shadow-lg shadow-cyan-500/20">
                  <AvatarImage src={profileImage || ""} />
                  <AvatarFallback className="bg-cyan-900/30">
                    <User className="w-12 h-12 text-cyan-500" />
                  </AvatarFallback>
                </Avatar>
                
                {isEditing && (
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs"
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-center w-full">
                {isEditing ? (
                  <>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mb-2 bg-black/30"
                      placeholder="Nome Agente"
                    />
                    <Input
                      value={agentCode}
                      onChange={(e) => setAgentCode(e.target.value)}
                      className="mb-2 bg-black/30 font-mono"
                      placeholder="Codice Agente"
                    />
                    <Input
                      value={agentTitle}
                      onChange={(e) => setAgentTitle(e.target.value)}
                      className="mb-2 bg-black/30"
                      placeholder="Titolo Agente"
                    />
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="bg-black/30"
                      placeholder="Bio"
                    />
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold mb-1">{name}</h2>
                    <p className="text-sm text-gray-400 mb-3">{bio}</p>
                    
                    {/* Investigative Style */}
                    <div className="mb-4 p-2 bg-black/30 rounded-md border border-gray-800">
                      <span className="text-xs text-gray-400">Stile investigativo:</span>
                      <div className="flex items-center mt-1 justify-center">
                        <span className={`w-3 h-3 rounded-full ${investigativeStyle.color} mr-2`}></span>
                        <span className="text-sm font-medium">{investigativeStyle.style}</span>
                      </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      <div className="flex flex-col items-center">
                        <span className="text-cyan-400 text-xl font-bold">{stats.missionsCompleted}</span>
                        <span className="text-xs text-gray-400">Missioni</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-cyan-400 text-xl font-bold">{stats.cluesFound}</span>
                        <span className="text-xs text-gray-400">Indizi</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-cyan-400 text-xl font-bold">{credits}</span>
                        <span className="text-xs text-gray-400">Crediti</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Right Column - Tabs for different sections */}
            <div className="flex-1">
              <Tabs defaultValue="stats" className="w-full">
                <TabsList className="w-full grid grid-cols-4 bg-black/30">
                  <TabsTrigger value="stats" className="text-xs">Statistiche</TabsTrigger>
                  <TabsTrigger value="history" className="text-xs">Cronologia</TabsTrigger>
                  <TabsTrigger value="badges" className="text-xs">Badge</TabsTrigger>
                  <TabsTrigger value="account" className="text-xs">Account</TabsTrigger>
                </TabsList>
                
                {/* Stats Tab */}
                <TabsContent value="stats" className="p-4 bg-black/20 rounded-md mt-2">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-cyan-400" />
                    Statistiche Personali
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Avanzamento verso il premio</span>
                        <span>{stats.prizeProgress}%</span>
                      </div>
                      <Progress value={stats.prizeProgress} className="h-2 bg-gray-800" indicatorClassName="bg-cyan-500" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="stat-item">
                        <span className="text-xs text-gray-400">Missioni completate</span>
                        <span className="text-lg font-bold">{stats.missionsCompleted}</span>
                      </div>
                      <div className="stat-item">
                        <span className="text-xs text-gray-400">Indizi trovati</span>
                        <span className="text-lg font-bold">{stats.cluesFound}</span>
                      </div>
                      <div className="stat-item">
                        <span className="text-xs text-gray-400">Tempo di gioco</span>
                        <span className="text-lg font-bold">{stats.totalPlayTime}</span>
                      </div>
                      <div className="stat-item">
                        <span className="text-xs text-gray-400">Punti totali</span>
                        <span className="text-lg font-bold">{stats.pointsEarned}</span>
                      </div>
                    </div>
                    
                    <div className="bg-cyan-900/20 p-3 rounded-md border border-cyan-900/40">
                      <span className="text-xs text-cyan-400">Miglior risultato</span>
                      <p className="text-sm mt-1">{stats.bestResult}</p>
                    </div>
                  </div>
                </TabsContent>
                
                {/* History Tab */}
                <TabsContent value="history" className="p-4 bg-black/20 rounded-md mt-2">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-cyan-400" />
                    Cronologia Operativa
                  </h3>
                  
                  <div className="space-y-3">
                    {history.map((item, index) => (
                      <div key={index} className="border-l-2 border-cyan-800 pl-3 py-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">
                            {item.type === "access" && "Accesso"}
                            {item.type === "mission" && "Missione"}
                            {item.type === "clue" && "Indizio"}
                            {item.type === "communication" && "Comunicazione"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.date).toLocaleDateString()} - {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{item.details}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-bold mb-2">Note personali</h4>
                    {isEditing ? (
                      <Textarea 
                        value={personalNotes}
                        onChange={(e) => setPersonalNotes(e.target.value)}
                        className="bg-black/30 h-20"
                      />
                    ) : (
                      <div className="bg-black/20 p-3 rounded-md border border-gray-800 text-sm italic">
                        {personalNotes}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* Badges Tab */}
                <TabsContent value="badges" className="p-4 bg-black/20 rounded-md mt-2">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-cyan-400" />
                    Badge e Traguardi
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {badges.map((badge) => (
                      <div 
                        key={badge.id} 
                        className={`p-3 rounded-md border ${badge.unlocked 
                          ? badge.pinned 
                            ? 'border-amber-500 bg-amber-900/20' 
                            : 'border-cyan-900/40 bg-cyan-900/10'
                          : 'border-gray-700 bg-black/30 opacity-50'}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-sm font-bold ${badge.pinned ? 'text-amber-400' : ''}`}>
                            {badge.name}
                          </span>
                          {badge.unlocked && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => togglePinBadge(badge.id)}
                            >
                              <Award className={`h-4 w-4 ${badge.pinned ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                        <div className="mt-2 text-xs">
                          {badge.unlocked 
                            ? <span className="text-green-400">Sbloccato</span> 
                            : <span className="text-gray-500">Bloccato</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                {/* Account Tab */}
                <TabsContent value="account" className="p-4 bg-black/20 rounded-md mt-2">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-cyan-400" />
                    Sicurezza e Abbonamento
                  </h3>
                  
                  {/* Subscription */}
                  <div className="mb-4 p-3 rounded-md bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-900/40">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold">Piano attivo: {subscription.plan}</h4>
                      <Badge className="bg-amber-600">{subscription.plan}</Badge>
                    </div>
                    <span className="text-xs text-gray-400 block mt-1">Scadenza: {new Date(subscription.expiry).toLocaleDateString()}</span>
                    <div className="mt-2">
                      <span className="text-xs text-gray-400">Vantaggi:</span>
                      <ul className="mt-1 text-xs space-y-1">
                        {subscription.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mr-2"></span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button
                      className="w-full mt-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                      size="sm"
                      onClick={navigateToSubscriptions}
                    >
                      Gestisci Abbonamento
                    </Button>
                  </div>
                  
                  {/* Account Security */}
                  <div className="space-y-3">
                    <div 
                      className="flex items-center justify-between p-2 bg-black/30 rounded-md cursor-pointer hover:bg-black/40 transition-colors"
                      onClick={navigateToPersonalInfo}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm">Informazioni personali</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    
                    <div 
                      className="flex items-center justify-between p-2 bg-black/30 rounded-md cursor-pointer hover:bg-black/40 transition-colors"
                      onClick={navigateToPrivacySecurity}
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm">Password e sicurezza</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    
                    <div 
                      className="flex items-center justify-between p-2 bg-black/30 rounded-md cursor-pointer hover:bg-black/40 transition-colors"
                      onClick={navigateToPaymentMethods}
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm">Metodi di pagamento</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Referral Code */}
                  <div className="mt-4 p-3 rounded-md bg-black/30 border border-gray-800">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-cyan-400" />
                      <h4 className="text-sm font-bold">Codice referral</h4>
                    </div>
                    <div className="mt-2 flex">
                      <Input 
                        value="AGENT-MR2025" 
                        readOnly 
                        className="bg-black/40 text-sm" 
                      />
                      <Button 
                        className="ml-2 bg-cyan-800 hover:bg-cyan-700"
                        onClick={() => {
                          navigator.clipboard.writeText("AGENT-MR2025");
                          toast({
                            title: "Codice copiato",
                            description: "Il codice referral è stato copiato negli appunti."
                          });
                        }}
                      >
                        Copia
                      </Button>
                    </div>
                    <span className="text-xs text-gray-400 block mt-2">
                      Recluta un altro agente e ricevi 500 crediti
                    </span>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      <NotificationsDrawer 
        open={showNotifications}
        onOpenChange={setShowNotifications}
      />
    </ProfileLayout>
  );
};

export default Profile;
