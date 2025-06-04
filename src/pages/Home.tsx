
import React from 'react';
import { CommandCenter } from '@/components/command-center/CommandCenter';
import { CluesSection } from '@/components/home/CluesSection';
import { AIAssistant } from '@/components/ai/AIAssistant';

const Home = () => {
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="safe-padding-x pt-16">
        <CommandCenter />
        <div className="mt-8">
          <CluesSection />
        </div>
      </div>
      <AIAssistant />
    </div>
  );
};

export default Home;
