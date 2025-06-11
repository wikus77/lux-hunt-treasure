
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import TestSuite from './TestSuite';

export const TestDebugButton = () => {
  const { user } = useAuth();

  // Only show for developer email
  if (user?.email !== 'wikus77@hotmail.it') {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-50" data-testid="test-debug-button">
      <TestSuite />
    </div>
  );
};

export default TestDebugButton;
