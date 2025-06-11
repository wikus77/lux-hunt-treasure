
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useProfilePersonalInfo } from '@/hooks/profile/useProfilePersonalInfo';

const AccountSection = () => {
  const navigate = useNavigate();
  const { personalInfo } = useProfilePersonalInfo();

  return (
    <div className="mb-6">
      <div className="glass-card p-4">
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-0">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <User className="h-5 w-5 mr-3 text-projectx-neon-blue" />
              Informazioni Personali
            </h2>
            <ChevronRight className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="space-y-4 text-white">
              <div className="flex items-center justify-between py-2">
                <span>Nome completo</span>
                <span className="text-gray-400">
                  {personalInfo.firstName && personalInfo.lastName 
                    ? `${personalInfo.firstName} ${personalInfo.lastName}` 
                    : 'Non impostato'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Email</span>
                <span className="text-gray-400">{personalInfo.email || 'Non impostata'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Paese</span>
                <span className="text-gray-400">{personalInfo.country || 'Non impostato'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Lingua preferita</span>
                <span className="text-gray-400">{personalInfo.preferredLanguage || 'Italiano'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Stile investigativo</span>
                <span className="text-gray-400">{personalInfo.investigativeStyle || 'Non impostato'}</span>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => navigate('/personal-info')}
                  className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center justify-between"
                >
                  Modifica informazioni personali
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default AccountSection;
