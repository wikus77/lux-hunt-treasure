
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Clock, Shield, BadgeAlert, Bell } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

interface ProfileTabsProps {
  stats: {
    missionsCompleted: number;
    cluesFound: number;
    totalPlayTime: string;
    pointsEarned: number;
    prizeProgress: number;
    bestResult: string;
  };
  history: {
    type: string;
    date: string;
    details: string;
  }[];
  badges: {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    pinned: boolean;
  }[];
  subscription: {
    plan: string;
    expiry: string;
    benefits: string[];
  };
  personalNotes: string;
  isEditing: boolean;
  setPersonalNotes: (notes: string) => void;
  togglePinBadge: (id: string) => void;
  navigateToPersonalInfo: () => void;
  navigateToPrivacySecurity: () => void;
  navigateToPaymentMethods: () => void;
  navigateToSubscriptions: () => void;
}

const ProfileTabs = ({
  stats,
  history,
  badges,
  subscription,
  personalNotes,
  isEditing,
  setPersonalNotes,
  togglePinBadge,
  navigateToPersonalInfo,
  navigateToPrivacySecurity,
  navigateToPaymentMethods,
  navigateToSubscriptions,
}: ProfileTabsProps) => {
  return (
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
            <Progress value={stats.prizeProgress} className="h-2 bg-gray-800" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-item">
              <span className="text-xs text-gray-400">Missioni completate: </span>
              <span className="text-base font-medium">{stats.missionsCompleted}</span>
            </div>
            <div className="stat-item">
              <span className="text-xs text-gray-400">Indizi trovati: </span>
              <span className="text-base font-medium">{stats.cluesFound}</span>
            </div>
            <div className="stat-item">
              <span className="text-xs text-gray-400">Tempo di gioco: </span>
              <span className="text-base font-medium">{stats.totalPlayTime}</span>
            </div>
            <div className="stat-item">
              <span className="text-xs text-gray-400">Punti totali: </span>
              <span className="text-base font-medium">{stats.pointsEarned.toLocaleString('it-IT')}</span>
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
        
        <AccountTabContent 
          subscription={subscription} 
          navigateToPersonalInfo={navigateToPersonalInfo}
          navigateToPrivacySecurity={navigateToPrivacySecurity}
          navigateToPaymentMethods={navigateToPaymentMethods}
          navigateToSubscriptions={navigateToSubscriptions}
        />
      </TabsContent>
    </Tabs>
  );
};

interface AccountTabContentProps {
  subscription: {
    plan: string;
    expiry: string;
    benefits: string[];
  };
  navigateToPersonalInfo: () => void;
  navigateToPrivacySecurity: () => void;
  navigateToPaymentMethods: () => void;
  navigateToSubscriptions: () => void;
}

const AccountTabContent = ({ 
  subscription, 
  navigateToPersonalInfo,
  navigateToPrivacySecurity,
  navigateToPaymentMethods,
  navigateToSubscriptions
}: AccountTabContentProps) => {
  return (
    <>
      {/* Subscription */}
      <div className="mb-4 p-3 rounded-md bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-900/40">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold">Piano attivo: {subscription.plan}</h4>
          <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">{subscription.plan}</span>
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
      
      <AccountSecuritySettings
        navigateToPersonalInfo={navigateToPersonalInfo}
        navigateToPrivacySecurity={navigateToPrivacySecurity}
        navigateToPaymentMethods={navigateToPaymentMethods}
      />
    </>
  );
};

interface AccountSecuritySettingsProps {
  navigateToPersonalInfo: () => void;
  navigateToPrivacySecurity: () => void;
  navigateToPaymentMethods: () => void;
}

const AccountSecuritySettings = ({
  navigateToPersonalInfo,
  navigateToPrivacySecurity,
  navigateToPaymentMethods
}: AccountSecuritySettingsProps) => {
  return (
    <div className="space-y-3">
      <div 
        className="flex items-center justify-between p-2 bg-black/30 rounded-md cursor-pointer hover:bg-black/40 transition-colors"
        onClick={navigateToPersonalInfo}
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-cyan-400" />
          <span className="text-sm">Informazioni personali</span>
        </div>
        <Button variant="ghost" size="sm" className="h-8">
          <Shield className="h-3.5 w-3.5" />
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
          <Shield className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      <div 
        className="flex items-center justify-between p-2 bg-black/30 rounded-md cursor-pointer hover:bg-black/40 transition-colors"
        onClick={navigateToPaymentMethods}
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-cyan-400" />
          <span className="text-sm">Metodi di pagamento</span>
        </div>
        <Button variant="ghost" size="sm" className="h-8">
          <Shield className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default ProfileTabs;
