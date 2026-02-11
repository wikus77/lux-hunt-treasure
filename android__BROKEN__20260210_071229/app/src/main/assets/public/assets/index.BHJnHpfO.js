const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/web.BWFAqsJj.js","assets/index.CUdqZWfi.js","assets/animation-vendor.BiI6PE8T.js","assets/supabase-vendor.CPRn8nK0.js","assets/map-vendor.uCr1tAyj.js","assets/ui-vendor.C69ET9UU.js","assets/stripe-vendor.baQ46ET6.js","assets/router-vendor.DUjmXt3z.js","assets/index.CnkXYqkZ.css"])))=>i.map(i=>d[i]);
import { cx as registerPlugin, _ as __vitePreload } from './index.CUdqZWfi.js';
import './animation-vendor.BiI6PE8T.js';
import './supabase-vendor.CPRn8nK0.js';
import './map-vendor.uCr1tAyj.js';
import './ui-vendor.C69ET9UU.js';
import './stripe-vendor.baQ46ET6.js';
import './router-vendor.DUjmXt3z.js';

var StatusbarStyle;
(function (StatusbarStyle) {
    StatusbarStyle["Light"] = "light";
    StatusbarStyle["Dark"] = "dark";
})(StatusbarStyle || (StatusbarStyle = {}));

const SafeArea = registerPlugin('SafeArea', {
    web: () => __vitePreload(() => import('./web.BWFAqsJj.js'),true?__vite__mapDeps([0,1,2,3,4,5,6,7,8]):void 0).then(m => new m.SafeAreaWeb()),
});

export { SafeArea, StatusbarStyle };
