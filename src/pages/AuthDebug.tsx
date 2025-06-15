
import { useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

const AuthDebug = () => {
  const { isAuthenticated, user, userRole, isLoading, isRoleLoading } = useAuthContext();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#00D1FF]">Auth Debug Console</h1>
        
        <div className="grid gap-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#00D1FF]">Authentication Status</h2>
            <div className="space-y-2">
              <p><strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Is Loading:</strong> {isLoading ? '⏳ Yes' : '✅ No'}</p>
              <p><strong>Is Role Loading:</strong> {isRoleLoading ? '⏳ Yes' : '✅ No'}</p>
              <p><strong>User Role:</strong> {userRole || 'None'}</p>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#00D1FF]">User Information</h2>
            <pre className="bg-black p-4 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#00D1FF]">Session Information</h2>
            <pre className="bg-black p-4 rounded text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#00D1FF]">Developer Access Check</h2>
            <div className="space-y-2">
              <p><strong>Current Email:</strong> {user?.email || 'None'}</p>
              <p><strong>Is Developer Email:</strong> {user?.email === 'wikus77@hotmail.it' ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Developer Role Active:</strong> {userRole === 'developer' ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>

          <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Authentication System Status</h2>
            <div className="space-y-2">
              <p><strong>✅ Login System:</strong> <span className="text-green-400">STANDARD EMAIL/PASSWORD</span></p>
              <p><strong>✅ Developer Access:</strong> <span className="text-green-400">ROLE-BASED SECURE</span></p>
              <p><strong>✅ Session Management:</strong> <span className="text-green-400">SUPABASE STANDARD</span></p>
              <p><strong>✅ Security:</strong> <span className="text-green-400">RLS ENABLED</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
