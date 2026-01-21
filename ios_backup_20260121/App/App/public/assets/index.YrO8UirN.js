const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/web.DgUPIz70.js","assets/index.C8SyQ7Ep.js","assets/ui-vendor.sKtoNQj2.js","assets/react-vendor.FGvtrp7q.js","assets/supabase-vendor.DVELIqeo.js","assets/animation-vendor.BT4oAzOt.js","assets/stripe-vendor.C-6aXM1t.js","assets/map-vendor.DftgD3cK.js","assets/router-vendor.Bb8w37VQ.js","assets/index.r3jusNWK.css"])))=>i.map(i=>d[i]);
import { cJ as registerPlugin, _ as __vitePreload } from './index.C8SyQ7Ep.js';
import './ui-vendor.sKtoNQj2.js';
import './react-vendor.FGvtrp7q.js';
import './supabase-vendor.DVELIqeo.js';
import './animation-vendor.BT4oAzOt.js';
import './stripe-vendor.C-6aXM1t.js';
import './map-vendor.DftgD3cK.js';
import './router-vendor.Bb8w37VQ.js';

var StatusbarStyle;
(function (StatusbarStyle) {
    StatusbarStyle["Light"] = "light";
    StatusbarStyle["Dark"] = "dark";
})(StatusbarStyle || (StatusbarStyle = {}));

const SafeArea = registerPlugin('SafeArea', {
    web: () => __vitePreload(() => import('./web.DgUPIz70.js'),true?__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]):void 0).then(m => new m.SafeAreaWeb()),
});

export { SafeArea, StatusbarStyle };
