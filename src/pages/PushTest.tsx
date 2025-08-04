// © 2025 Joseph MULÉ – M1SSION™
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DeviceTokenDebug from '@/components/DeviceTokenDebug';

export default function PushTest() {
  const [title, setTitle] = useState('M1SSION™ Test');
  const [body, setBody] = useState('Test push notification per iOS e Android');
  const [loading, setLoading] = useState(false);

  const handleSendPush = async () => {
    if (!title || !body) {
      toast.error('Titolo e messaggio sono obbligatori');
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 Sending push notification:', { title, body });
      
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: title.trim(),
          body: body.trim()
        }
      });

      if (error) {
        console.error('❌ Push notification error:', error);
        toast.error(`Errore: ${error.message}`);
      } else {
        console.log('✅ Push notification sent:', data);
        toast.success(`Notifica inviata a ${data.sent}/${data.total} dispositivi`);
      }
    } catch (err) {
      console.error('❌ Push notification exception:', err);
      toast.error('Errore durante l\'invio della notifica');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8 text-[#00D1FF]">
          🚨 Push Test M1SSION™
        </h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Titolo</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              placeholder="Titolo notifica"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Messaggio</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white h-24"
              placeholder="Testo della notifica"
            />
          </div>
          
          <button
            onClick={handleSendPush}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-bold ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-[#00D1FF] hover:bg-[#00A8CC] text-black'
            }`}
          >
            {loading ? '⏳ Invio...' : '🚀 INVIA PUSH OS-NATIVE'}
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-gray-900 rounded-lg">
          <h3 className="font-bold mb-2">🔍 Test Checklist:</h3>
          <ul className="text-sm space-y-1">
            <li>📱 Lock screen iOS con suono e badge</li>
            <li>🤖 Lock screen Android con suono</li>
            <li>📩 Notifica in /notifications in-app</li>
            <li>🔔 Real-time sync immediato</li>
          </ul>
        </div>
        
        <DeviceTokenDebug />
      </div>
    </div>
  );
}