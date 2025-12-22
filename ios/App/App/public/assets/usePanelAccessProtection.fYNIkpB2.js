import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { a3 as cn, k as useUnifiedAuth, bb as useWouterNavigation, s as supabase } from './index.BEQCqgv7.js';

const Spinner = reactExports.forwardRef(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8"
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref,
        className: cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-2 border-t-gray-900 dark:border-gray-600 dark:border-t-gray-300",
          sizeClasses[size],
          className
        ),
        ...props
      }
    );
  }
);
Spinner.displayName = "Spinner";

const AUTHORIZED_EMAIL_HASH = "9e0aefd8ff5e2879549f1bfddb3975372f9f4281ea9f9120ef90278763653c52";
const AUTHORIZED_EMAIL = "wikus77@hotmail.it";
async function calculateSHA256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
const usePanelAccessProtection = () => {
  const { user, isAuthenticated, isLoading } = useUnifiedAuth();
  const { navigate } = useWouterNavigation();
  const [isWhitelisted, setIsWhitelisted] = reactExports.useState(false);
  const [isValidating, setIsValidating] = reactExports.useState(true);
  const [accessDeniedReason, setAccessDeniedReason] = reactExports.useState("");
  const logAccessAttempt = async (attempt) => {
    try {
      await supabase.from("admin_logs").insert({
        event_type: "panel_access_attempt",
        user_id: user?.id || null,
        context: JSON.stringify({
          email: attempt.email,
          ip: attempt.ip,
          userAgent: attempt.userAgent,
          success: attempt.success,
          reason: accessDeniedReason
        }),
        note: attempt.success ? "Accesso autorizzato al M1SSION PANEL™" : "Tentativo di accesso non autorizzato"
      });
    } catch (error) {
    }
  };
  const getClientInfo = () => {
    return {
      ip: "client-side",
      // In produzione si può usare un servizio per l'IP reale
      userAgent: navigator.userAgent
    };
  };
  const validateAccess = async () => {
    setIsValidating(true);
    try {
      const clientInfo = getClientInfo();
      if (!isAuthenticated || !user?.email) {
        setAccessDeniedReason("Utente non autenticato");
        setIsWhitelisted(false);
        await logAccessAttempt({
          email: user?.email || "anonymous",
          ip: clientInfo.ip,
          userAgent: clientInfo.userAgent,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          success: false
        });
        return;
      }
      if (user.email !== AUTHORIZED_EMAIL) {
        setAccessDeniedReason("Email non autorizzata");
        setIsWhitelisted(false);
        await logAccessAttempt({
          email: user.email,
          ip: clientInfo.ip,
          userAgent: clientInfo.userAgent,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          success: false
        });
        return;
      }
      const emailHash = await calculateSHA256(user.email);
      if (emailHash !== AUTHORIZED_EMAIL_HASH) {
        setAccessDeniedReason("Hash email non valido");
        setIsWhitelisted(false);
        await logAccessAttempt({
          email: user.email,
          ip: clientInfo.ip,
          userAgent: clientInfo.userAgent,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          success: false
        });
        navigate("/access-denied");
        return;
      }
      setIsWhitelisted(true);
      setAccessDeniedReason("");
      await logAccessAttempt({
        email: user.email,
        ip: clientInfo.ip,
        userAgent: clientInfo.userAgent,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        success: true
      });
    } catch (error) {
      setAccessDeniedReason("Errore di validazione");
      setIsWhitelisted(false);
      navigate("/access-denied");
    } finally {
      setIsValidating(false);
    }
  };
  reactExports.useEffect(() => {
    validateAccess();
  }, [isAuthenticated, user?.email]);
  reactExports.useEffect(() => {
    if (!isValidating && !isWhitelisted) {
      navigate("/access-denied");
    }
  }, [isValidating, isWhitelisted]);
  return {
    isWhitelisted,
    isValidating,
    accessDeniedReason,
    revalidate: validateAccess
  };
};

export { Spinner as S, usePanelAccessProtection as u };
