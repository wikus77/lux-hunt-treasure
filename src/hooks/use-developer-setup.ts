
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDeveloperSetup = () => {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const ensureDeveloperUser = async () => {
    try {
      console.log('🔧 Checking developer user setup...');
      
      // Check if developer user exists
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error('❌ Cannot check users:', userError);
        // Fallback: assume user exists and try to sign them up if needed
        await ensureDeveloperRegistration();
        return;
      }

      const developerUser = users.users.find(user => user.email === 'wikus77@hotmail.it');
      
      if (!developerUser) {
        console.log('👤 Developer user not found, creating...');
        await ensureDeveloperRegistration();
      } else {
        console.log('✅ Developer user exists:', developerUser.email);
        // Ensure developer role is assigned
        await ensureDeveloperRole(developerUser.id);
      }
      
      setIsSetupComplete(true);
    } catch (error: any) {
      console.error('💥 Developer setup error:', error);
      // Fallback: try to register anyway
      await ensureDeveloperRegistration();
    } finally {
      setIsLoading(false);
    }
  };

  const ensureDeveloperRegistration = async () => {
    try {
      console.log('📝 Attempting developer user registration...');
      
      const { data, error } = await supabase.auth.signUp({
        email: 'wikus77@hotmail.it',
        password: 'Wikus190877',
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log('✅ Developer user already exists');
          // Try to get the user ID and ensure role
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await ensureDeveloperRole(user.id);
          }
        } else {
          console.error('❌ Registration failed:', error);
        }
      } else if (data.user) {
        console.log('✅ Developer user created:', data.user.email);
        await ensureDeveloperRole(data.user.id);
      }
    } catch (error: any) {
      console.error('💥 Registration error:', error);
    }
  };

  const ensureDeveloperRole = async (userId: string) => {
    try {
      console.log('🔑 Ensuring developer role for user:', userId);
      
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'developer' })
        .select();

      if (error && !error.message.includes('duplicate')) {
        console.error('❌ Role assignment failed:', error);
      } else {
        console.log('✅ Developer role ensured');
      }
    } catch (error: any) {
      console.error('💥 Role assignment error:', error);
    }
  };

  useEffect(() => {
    ensureDeveloperUser();
  }, []);

  return { isSetupComplete, isLoading };
};
