import { cM as WebPlugin } from './index.C8SyQ7Ep.js';
import './ui-vendor.sKtoNQj2.js';
import './react-vendor.FGvtrp7q.js';
import './supabase-vendor.DVELIqeo.js';
import './animation-vendor.BT4oAzOt.js';
import './stripe-vendor.C-6aXM1t.js';
import './map-vendor.DftgD3cK.js';
import './router-vendor.Bb8w37VQ.js';

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
