// M1SSION™ - iOS Capacitor Function Names Preservation
// Ensure all function names are explicit and not minified

// React function names preservation
export const reactFunctionNames = {
  useState: 'useState',
  useEffect: 'useEffect',
  useCallback: 'useCallback',
  useMemo: 'useMemo',
  useRef: 'useRef',
  useContext: 'useContext',
  useReducer: 'useReducer',
  useLayoutEffect: 'useLayoutEffect'
} as const;

// Router function names preservation
export const routerFunctionNames = {
  useNavigate: 'useNavigate',
  useLocation: 'useLocation',
  useParams: 'useParams',
  useSearchParams: 'useSearchParams',
  Link: 'Link',
  Navigate: 'Navigate'
} as const;

// Capacitor function names preservation
export const capacitorFunctionNames = {
  Capacitor: 'Capacitor',
  CapacitorApp: 'CapacitorApp', 
  StatusBar: 'StatusBar',
  SplashScreen: 'SplashScreen',
  Device: 'Device',
  Browser: 'Browser'
} as const;

// Supabase function names preservation
export const supabaseFunctionNames = {
  createClient: 'createClient',
  signInWithPassword: 'signInWithPassword',
  signUp: 'signUp',
  signOut: 'signOut',
  getSession: 'getSession',
  getUser: 'getUser'
} as const;

// Animation function names preservation
export const animationFunctionNames = {
  motion: 'motion',
  AnimatePresence: 'AnimatePresence',
  useAnimation: 'useAnimation',
  useMotionValue: 'useMotionValue'
} as const;

// Navigation function names preservation
export const navigationFunctionNames = {
  navigateCapacitor: 'navigateCapacitor',
  setCurrentTab: 'setCurrentTab',
  addToHistory: 'addToHistory',
  handleNavigation: 'handleNavigation'
} as const;

// Function to ensure explicit function names are used
export function preserveFunctionName<T extends (...args: any[]) => any>(
  fn: T, 
  name: string
): T {
  Object.defineProperty(fn, 'name', { value: name, configurable: true });
  return fn;
}

// iOS Capacitor compatibility check
export function isIOSCapacitor(): boolean {
  return typeof window !== 'undefined' && 
    (!!(window as any).Capacitor || window.location.protocol === 'capacitor:') &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Explicit function declaration for iOS compatibility
export const explicitNavigationHandler = preserveFunctionName(
  (path: string, navigate: (path: string) => void) => {
    console.log('🧭 EXPLICIT NAVIGATION:', path);
    navigate(path);
  },
  'explicitNavigationHandler'
);

// Explicit auth handler
export const explicitAuthHandler = preserveFunctionName(
  (action: string, handler: () => void) => {
    console.log('🔐 EXPLICIT AUTH ACTION:', action);
    handler();
  },
  'explicitAuthHandler'
);

// Explicit touch handler for iOS
export const explicitTouchHandler = preserveFunctionName(
  (event: TouchEvent, callback: (event: TouchEvent) => void) => {
    console.log('👆 EXPLICIT TOUCH HANDLER');
    callback(event);
  },
  'explicitTouchHandler'
);

console.log('✅ iOS Capacitor function names preservation loaded');