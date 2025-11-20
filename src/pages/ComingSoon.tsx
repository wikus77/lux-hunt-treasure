/**
 * Coming Soon Page - Feature under development
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { Rocket, Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import BottomNavigation from '@/components/layout/BottomNavigation';

const ComingSoon: React.FC = () => {
  return (
    <SafeAreaWrapper>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-primary/20">
            <CardContent className="pt-10 pb-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <Rocket className="w-24 h-24 text-primary animate-pulse" />
                  <Sparkles className="w-8 h-8 text-accent absolute -top-2 -right-2" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold mb-4 text-foreground">
                Coming Soon
              </h1>
              
              <p className="text-muted-foreground mb-6 text-lg">
                This feature is currently under development and will be available soon.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-primary">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Launch: December 2025</span>
              </div>
              
              <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-foreground/80">
                  Stay tuned for updates on this exciting new feature!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </div>
    </SafeAreaWrapper>
  );
};

export default ComingSoon;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
