import { s as subscribeWebPushAndSave } from './webPushManager.CtKFuVbO.js';
import './index.CUdqZWfi.js';
import './animation-vendor.BiI6PE8T.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

async function enableWebPush() {
  const reg = await navigator.serviceWorker.ready;
  return subscribeWebPushAndSave(reg);
}

export { enableWebPush as default, enableWebPush };
