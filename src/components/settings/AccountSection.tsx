
import { useState } from "react";
import { User, Shield, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useProfileData } from "@/hooks/useProfileData";

const AccountSection = () => {
  const navigate = useNavigate();
  const [isAccountSectionOpen, setIsAccountSectionOpen] = useState(false);
  const { profileData } = useProfileData();

  const formatDate = (dateString: string) => {
    if (!dateString) return "Non disponibile";
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSubscriptionTier = () => {
    return profileData.subscription?.tier || "Free";
  };

  return (
    <div className="mb-6">
      <div className="glass-card p-4">
        <Collapsible open={isAccountSectionOpen} onOpenChange={setIsAccountSectionOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-0">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <User className="h-5 w-5 mr-3 text-projectx-neon-blue" />
              Informazioni Personali
            </h2>
            <ChevronRight 
              className={`h-4 w-4 transition-transform ${isAccountSectionOpen ? 'rotate-90' : ''}`} 
            />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="space-y-4 text-white">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Nome completo</span>
                  <span className="text-sm">{profileData.personalInfo?.firstName && profileData.personalInfo?.lastName 
                    ? `${profileData.personalInfo.firstName} ${profileData.personalInfo.lastName}` 
                    : profileData.name || "Non specificato"}</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Email</span>
                  <span className="text-sm">{profileData.personalInfo?.email || "Non disponibile"}</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Codice Agente</span>
                  <span className="text-sm font-mono bg-projectx-neon-blue/20 px-2 py-1 rounded">
                    {profileData.agentCode || "AG-GUEST"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Data registrazione</span>
                  <span className="text-sm">
                    {profileData.personalInfo ? formatDate(new Date().toISOString()) : "Non disponibile"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Piano attivo</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    getSubscriptionTier() === 'Free' ? 'bg-gray-600' :
                    getSubscriptionTier() === 'Silver' ? 'bg-gray-400 text-black' :
                    getSubscriptionTier() === 'Gold' ? 'bg-yellow-500 text-black' :
                    getSubscriptionTier() === 'Black' ? 'bg-black text-white border border-white' :
                    'bg-gray-600'
                  }`}>
                    {getSubscriptionTier()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Missioni completate</span>
                  <span className="text-sm">{profileData.stats?.missionsCompleted || 0}</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-sm font-medium text-muted-foreground">XP totali</span>
                  <span className="text-sm">{profileData.stats?.totalXP || 0}</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Paese</span>
                  <span className="text-sm">{profileData.personalInfo?.country || "Non specificato"}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Stile investigativo</span>
                  <span className="text-sm">{profileData.investigativeStyle || "Non definito"}</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <div 
                  className="border border-white/10 rounded-lg flex justify-between items-center p-3 cursor-pointer hover:bg-white/5"
                  onClick={() => navigate('/personal-info')}
                >
                  <span className="text-sm">Modifica informazioni personali</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div 
                  className="border border-white/10 rounded-lg flex justify-between items-center p-3 cursor-pointer hover:bg-white/5"
                  onClick={() => navigate('/subscriptions')}
                >
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-projectx-neon-blue" />
                    <span className="text-sm">Gestisci abbonamento</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default AccountSection;
