import { cE as WebPlugin } from './index.CUdqZWfi.js';
import { ImpactStyle, NotificationType } from './index.Cf0IWlnk.js';
import './animation-vendor.BiI6PE8T.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

class HapticsWeb extends WebPlugin {
    constructor() {
        super(...arguments);
        this.selectionStarted = false;
    }
    async impact(options) {
        const pattern = this.patternForImpact(options === null || options === void 0 ? void 0 : options.style);
        this.vibrateWithPattern(pattern);
    }
    async notification(options) {
        const pattern = this.patternForNotification(options === null || options === void 0 ? void 0 : options.type);
        this.vibrateWithPattern(pattern);
    }
    async vibrate(options) {
        const duration = (options === null || options === void 0 ? void 0 : options.duration) || 300;
        this.vibrateWithPattern([duration]);
    }
    async selectionStart() {
        this.selectionStarted = true;
    }
    async selectionChanged() {
        if (this.selectionStarted) {
            this.vibrateWithPattern([70]);
        }
    }
    async selectionEnd() {
        this.selectionStarted = false;
    }
    patternForImpact(style = ImpactStyle.Heavy) {
        if (style === ImpactStyle.Medium) {
            return [43];
        }
        else if (style === ImpactStyle.Light) {
            return [20];
        }
        return [61];
    }
    patternForNotification(type = NotificationType.Success) {
        if (type === NotificationType.Warning) {
            return [30, 40, 30, 50, 60];
        }
        else if (type === NotificationType.Error) {
            return [27, 45, 50];
        }
        return [35, 65, 21];
    }
    vibrateWithPattern(pattern) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
        else {
            throw this.unavailable('Browser does not support the vibrate API');
        }
    }
}

export { HapticsWeb };
