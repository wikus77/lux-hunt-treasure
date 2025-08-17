import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, UserPlus, LogIn } from 'lucide-react';

interface AuthPromptProps {
  onLogin?: () => void;
  onSignup?: () => void;
}

export const AuthPrompt: React.FC<AuthPromptProps> = ({ onLogin, onSignup }) => {
  return (
    <Card className="p-6 bg-primary/5 border-primary/20">
      <div className="flex flex-col items-center text-center space-y-4">
        <Lock className="h-12 w-12 text-primary/60" />
        <h3 className="text-lg font-semibold text-foreground">
          Authentication Required
        </h3>
        <p className="text-muted-foreground max-w-md">
          To see QR codes on the map, you need to be logged in and discover them through legitimate gameplay. 
          This protects the game integrity and prevents cheating.
        </p>
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <strong>How it works:</strong> Find QR codes in the real world, scan them with the app, and they'll appear on your map permanently. 
            This ensures fair play for everyone!
          </p>
        </div>
        <div className="flex gap-3 mt-4">
          <Button onClick={onLogin} variant="default" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Login
          </Button>
          <Button onClick={onSignup} variant="outline" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Sign Up
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          New users start with an empty map. Find QR codes in the real world to unlock rewards!
        </p>
      </div>
    </Card>
  );
};