import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { bG as webPushManager } from './index.BEQCqgv7.js';

function useFcm(userId) {
  const [state, setState] = reactExports.useState({
    status: "idle",
    error: null,
    subscription: null,
    userId: null
  });
  const [isSupported, setIsSupported] = reactExports.useState(false);
  const [permission, setPermission] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const checkSupport = () => {
      const supported = webPushManager.isSupported();
      setIsSupported(supported);
      setPermission(Notification.permission);
    };
    checkSupport();
    webPushManager.getCurrent().then((sub) => {
      if (sub) {
        setState((prev) => ({
          ...prev,
          subscription: sub,
          status: "success"
        }));
      }
    });
  }, []);
  const generate = reactExports.useCallback(async () => {
    if (!isSupported) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: "Web Push not supported in this browser"
      }));
      return;
    }
    setState((prev) => ({
      ...prev,
      status: "loading",
      error: null
    }));
    try {
      const subscription = await webPushManager.subscribe(userId);
      setState({
        status: "success",
        error: null,
        subscription,
        userId: userId || null
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: error.message || "Failed to generate push subscription"
      }));
    }
  }, [userId, isSupported]);
  return {
    ...state,
    generate,
    isSupported,
    permission,
    token: state.subscription?.endpoint || null
    // endpoint as token
  };
}

export { useFcm as u };
