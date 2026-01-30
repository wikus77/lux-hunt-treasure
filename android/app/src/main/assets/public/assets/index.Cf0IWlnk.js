const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/web.DlwzgbHR.js","assets/index.CUdqZWfi.js","assets/animation-vendor.BiI6PE8T.js","assets/supabase-vendor.CPRn8nK0.js","assets/map-vendor.uCr1tAyj.js","assets/ui-vendor.C69ET9UU.js","assets/stripe-vendor.baQ46ET6.js","assets/router-vendor.DUjmXt3z.js","assets/index.CnkXYqkZ.css"])))=>i.map(i=>d[i]);
import { cx as registerPlugin, _ as __vitePreload } from './index.CUdqZWfi.js';
import './animation-vendor.BiI6PE8T.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

var ImpactStyle;
(function (ImpactStyle) {
    /**
     * A collision between large, heavy user interface elements
     *
     * @since 1.0.0
     */
    ImpactStyle["Heavy"] = "HEAVY";
    /**
     * A collision between moderately sized user interface elements
     *
     * @since 1.0.0
     */
    ImpactStyle["Medium"] = "MEDIUM";
    /**
     * A collision between small, light user interface elements
     *
     * @since 1.0.0
     */
    ImpactStyle["Light"] = "LIGHT";
})(ImpactStyle || (ImpactStyle = {}));
var NotificationType;
(function (NotificationType) {
    /**
     * A notification feedback type indicating that a task has completed successfully
     *
     * @since 1.0.0
     */
    NotificationType["Success"] = "SUCCESS";
    /**
     * A notification feedback type indicating that a task has produced a warning
     *
     * @since 1.0.0
     */
    NotificationType["Warning"] = "WARNING";
    /**
     * A notification feedback type indicating that a task has failed
     *
     * @since 1.0.0
     */
    NotificationType["Error"] = "ERROR";
})(NotificationType || (NotificationType = {}));

const Haptics = registerPlugin('Haptics', {
    web: () => __vitePreload(() => import('./web.DlwzgbHR.js'),true?__vite__mapDeps([0,1,2,3,4,5,6,7,8]):void 0).then(m => new m.HapticsWeb()),
});

export { Haptics, ImpactStyle, NotificationType };
