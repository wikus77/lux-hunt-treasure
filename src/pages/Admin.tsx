import { PushBackendTest } from '@/components/debug/PushBackendTest';
import { VAPIDKeyTest } from '@/components/debug/VAPIDKeyTest';
import { M1ssionFirebasePushTestPanel } from '@/components/admin/M1ssionFirebasePushTestPanel';

export default function Admin() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">🔧 M1SSION™ Admin Panel</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <PushBackendTest />
        <VAPIDKeyTest />
        <M1ssionFirebasePushTestPanel />
      </div>
    </div>
  );
}
