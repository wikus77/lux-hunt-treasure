import { cE as WebPlugin } from './index.CUdqZWfi.js';
import './animation-vendor.BiI6PE8T.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

class SafeAreaWeb extends WebPlugin {
    async getSafeAreaInsets() {
        return {
            insets: {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }
        };
    }
    async getStatusBarHeight() {
        // throw this.unimplemented('Method not supported on Web.');
        return {
            statusBarHeight: 0
        };
    }
    setImmersiveNavigationBar() {
        throw this.unimplemented('Method not supported on Web.');
    }
    unsetImmersiveNavigationBar() {
        throw this.unimplemented('Method not supported on Web.');
    }
}

export { SafeAreaWeb };
