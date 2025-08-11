export const viewports = {
  mobile:  { width: 390,  height: 844  },  // iPhone 12-ish
  tablet:  { width: 820,  height: 1180 },  // iPad Air-ish
  desktop: { width: 1280, height: 800  }   // laptop
};
export const devices = viewports;     // compat per import { devices }
export default viewports;             // compat per default import
