// © 2025 Joseph MULÉ – M1SSION™ – EMERGENCY ADMIN LOGIN COMPONENT
// BYPASS TOTALE PER ACCESSO SVILUPPATORE IMMEDIATO

import React, { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

interface AdminEmergencyLoginProps {
  onClose?: () => void;
}

const AdminEmergencyLogin: React.FC<AdminEmergencyLoginProps> = ({ onClose }) => {
  const [isLogging, setIsLogging] = useState(false);
  const { login } = useUnifiedAuth();
  const { navigate } = useWouterNavigation();

  // Escape key to close
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  const handleEmergencyLogin = async () => {
    setIsLogging(true);
    console.log('🚨 EMERGENCY ADMIN LOGIN - Starting...');
    
    try {
      const result = await login('wikus77@hotmail.it', 'Wikus@190877');
      
      if (result.success) {
        console.log('🚀 EMERGENCY LOGIN SUCCESS - Setting emergency access');
        // Set emergency access flag and redirect to push-test
        localStorage.setItem('emergency_admin_access', 'true');
        window.location.href = '/push-test?emergency=admin';
      } else {
        console.error('❌ EMERGENCY LOGIN FAILED:', result.error);
        alert('Emergency login failed: ' + (result.error?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ EMERGENCY LOGIN EXCEPTION:', error);
      alert('Emergency login exception: ' + error);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-red-900 border border-red-500 rounded-lg p-6 max-w-md relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-red-300 hover:text-white text-2xl"
          >
            ×
          </button>
        )}
        <h2 className="text-white text-xl font-bold mb-4">🚨 EMERGENCY ADMIN ACCESS</h2>
        <p className="text-red-200 mb-4">
          Sistema di bypass d'emergenza per accesso sviluppatore immediato
        </p>
        <button
          onClick={handleEmergencyLogin}
          disabled={isLogging}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold py-2 px-4 rounded transition-colors mb-4"
        >
          {isLogging ? '🔄 Accesso in corso...' : '🚀 ACCESSO EMERGENCY'}
        </button>
        <p className="text-red-300 text-xs">
          wikus77@hotmail.it / Wikus@190877
        </p>
        <p className="text-red-400 text-xs mt-2">
          Premi ESC per chiudere
        </p>
      </div>
    </div>
  );
};

export default AdminEmergencyLogin;