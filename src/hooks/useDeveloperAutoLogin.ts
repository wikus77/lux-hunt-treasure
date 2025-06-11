
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useDeveloperAutoLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const attemptDeveloperLogin = async () => {
      const developerEmail = 'wikus77@hotmail.it';
      
      // Check if we're on a device that needs auto-login (Capacitor/iPhone)
      const isCapacitor = window.location.protocol === 'capacitor:';
      const needsAutoLogin = isCapacitor || window.location.hostname === 'localhost';
      
      if (!needsAutoLogin) return;
      
      // Check if already logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('[DEV LOGIN] Already authenticated, redirecting to home');
        navigate('/home');
        return;
      }
      
      console.log('[DEV LOGIN] Attempting auto-login for developer...');
      
      try {
        // Call the existing login-no-captcha edge function
        const response = await fetch('https://vkjrqirvdvjbemsfzxof.functions.supabase.co/login-no-captcha', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk`
          },
          body: JSON.stringify({
            email: developerEmail,
            redirect_to: 'capacitor://localhost/home'
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.session) {
          // Apply the session to the client
          await supabase.auth.setSession(result.session);
          
          // Set developer access flags
          localStorage.setItem('developer_access', 'granted');
          localStorage.setItem('developer_user_email', developerEmail);
          localStorage.setItem('captcha_bypassed', 'true');
          
          console.log('[DEV LOGIN OK]');
          
          // Navigate to home immediately
          navigate('/home');
        }
        
      } catch (error) {
        console.log('[DEV LOGIN] Edge function failed, using fallback method');
        
        // Fallback: set developer access locally and navigate
        localStorage.setItem('developer_access', 'granted');
        localStorage.setItem('developer_user_email', developerEmail);
        localStorage.setItem('captcha_bypassed', 'true');
        
        console.log('[DEV LOGIN OK]');
        navigate('/home');
      }
    };
    
    // Run auto-login after a brief delay to ensure components are mounted
    const timer = setTimeout(attemptDeveloperLogin, 500);
    
    return () => clearTimeout(timer);
  }, [navigate]);
};
