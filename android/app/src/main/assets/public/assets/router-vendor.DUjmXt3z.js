import { r as reactExports } from './animation-vendor.BiI6PE8T.js';
import './map-vendor.uCr1tAyj.js';

/**
 * React Router v6.30.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
const RouteContext = /* @__PURE__ */ reactExports.createContext({
  outlet: null,
  matches: [],
  isDataRoute: false
});
function useParams() {
  let {
    matches
  } = reactExports.useContext(RouteContext);
  let routeMatch = matches[matches.length - 1];
  return routeMatch ? routeMatch.params : {};
}
new Promise(() => {
});

export { useParams as u };
