import { j as jsxRuntimeExports } from './ui-vendor.CkkPodTS.js';
import { a3 as cn, s as supabase, e as ue, v as Card, A as CardHeader, H as CardTitle, U as Users, a5 as Badge, B as Button, x as RefreshCw, O as CardContent, o as TriangleAlert, bj as Skeleton, bk as AlertDialog, bl as AlertDialogTrigger, z as Trash2, bm as AlertDialogContent, bn as AlertDialogHeader, bo as AlertDialogTitle, bp as AlertDialogDescription, bq as AlertDialogFooter, br as AlertDialogCancel, bs as AlertDialogAction, bt as format, bu as it, k as useUnifiedAuth, as as useProfileImage, be as Helmet, av as UnifiedHeader } from './index.BEQCqgv7.js';
import { u as usePanelAccessProtection, S as Spinner } from './usePanelAccessProtection.fYNIkpB2.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import './three-vendor.B3e0mz6d.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

const Table = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  "table",
  {
    ref,
    className: cn("w-full caption-bottom text-sm", className),
    ...props
  }
) }));
Table.displayName = "Table";
const TableHeader = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { ref, className: cn("[&_tr]:border-b", className), ...props }));
TableHeader.displayName = "TableHeader";
const TableBody = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "tbody",
  {
    ref,
    className: cn("[&_tr:last-child]:border-0", className),
    ...props
  }
));
TableBody.displayName = "TableBody";
const TableFooter = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "tfoot",
  {
    ref,
    className: cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    ),
    ...props
  }
));
TableFooter.displayName = "TableFooter";
const TableRow = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "tr",
  {
    ref,
    className: cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    ),
    ...props
  }
));
TableRow.displayName = "TableRow";
const TableHead = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "th",
  {
    ref,
    className: cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    ),
    ...props
  }
));
TableHead.displayName = "TableHead";
const TableCell = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "td",
  {
    ref,
    className: cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className),
    ...props
  }
));
TableCell.displayName = "TableCell";
const TableCaption = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "caption",
  {
    ref,
    className: cn("mt-4 text-sm text-muted-foreground", className),
    ...props
  }
));
TableCaption.displayName = "TableCaption";

const UsersRealtimePanel = () => {
  const [profiles, setProfiles] = reactExports.useState([]);
  const [totalCount, setTotalCount] = reactExports.useState(0);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isLoadingMore, setIsLoadingMore] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [hasMore, setHasMore] = reactExports.useState(true);
  const ITEMS_PER_PAGE = 50;
  const getDisplayName = (profile) => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile.full_name) {
      return profile.full_name;
    }
    return profile.email || "Utente sconosciuto";
  };
  const fetchData = reactExports.useCallback(async (offset = 0, isLoadMore = false) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }
    try {
      if (offset === 0) {
        const { count, error: countError } = await supabase.from("profiles").select("*", { head: true, count: "exact" });
        if (countError) {
          throw new Error(`Errore nel conteggio: ${countError.message}`);
        }
        setTotalCount(count || 0);
      }
      const { data, error: profilesError } = await supabase.from("profiles").select("id, first_name, last_name, full_name, referral_code, created_at, email").order("created_at", { ascending: false }).range(offset, offset + ITEMS_PER_PAGE - 1);
      if (profilesError) {
        throw new Error(`Errore nel caricamento profili: ${profilesError.message}`);
      }
      const newProfiles = data || [];
      if (offset === 0) {
        setProfiles(newProfiles);
      } else {
        setProfiles((prev) => [...prev, ...newProfiles]);
      }
      setHasMore(newProfiles.length === ITEMS_PER_PAGE);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Errore sconosciuto";
      setError(errorMessage);
      if (!isLoadMore) {
        ue.error(`Errore nel caricamento dati: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);
  const loadMore = reactExports.useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchData(profiles.length, true);
    }
  }, [fetchData, profiles.length, isLoadingMore, hasMore]);
  const refreshData = reactExports.useCallback(() => {
    fetchData(0, false);
  }, [fetchData]);
  reactExports.useEffect(() => {
    fetchData();
    const channel = supabase.channel("realtime:profiles").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "profiles"
    }, (payload) => {
      switch (payload.eventType) {
        case "INSERT":
          if (payload.new) {
            setProfiles((prev) => [payload.new, ...prev]);
            setTotalCount((prev) => prev + 1);
            ue.success("Nuovo utente registrato!");
          }
          break;
        case "UPDATE":
          if (payload.new) {
            setProfiles(
              (prev) => prev.map(
                (profile) => profile.id === payload.new.id ? { ...profile, ...payload.new } : profile
              )
            );
            ue.info("Profilo utente aggiornato");
          }
          break;
        case "DELETE":
          if (payload.old) {
            setProfiles(
              (prev) => prev.filter((profile) => profile.id !== payload.old.id)
            );
            setTotalCount((prev) => Math.max(0, prev - 1));
            ue.warning("Utente rimosso");
          }
          break;
      }
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);
  const handleDeleteUser = reactExports.useCallback(async (userId) => {
    try {
      setIsLoading(true);
      const { data, error: error2 } = await supabase.functions.invoke("admin-delete-user", {
        body: { user_id: userId }
      });
      if (error2 || !data?.success) {
        throw new Error(data?.error || error2?.message || "Delete failed");
      }
      setProfiles((prev) => prev.filter((profile) => profile.id !== userId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      ue.success("Utente cancellato con successo");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Errore sconosciuto";
      ue.error(`Errore nella cancellazione: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const formatDate = (dateString) => {
    if (!dateString) return "Data non disponibile";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: it });
    } catch {
      return "Data non valida";
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "m1-relief border-0",
      style: {
        borderRadius: "24px"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-lg font-semibold text-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5 text-primary" }),
            "Utenti (Realtime)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-sm", children: [
              "Totale utenti: ",
              totalCount
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: refreshData,
                disabled: isLoading,
                className: "h-8 w-8 p-0",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ${isLoading ? "animate-spin" : ""}` })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-destructive" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-destructive", children: error })
          ] }),
          isLoading && profiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-foreground", children: "Nome" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-foreground", children: "Referral Code" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-foreground", children: "User ID" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-foreground", children: "Data Iscrizione" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-foreground", children: "Azioni" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: profiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "text-center py-8 text-muted-foreground", children: "Nessun utente trovato" }) }) : profiles.map((profile) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "hover:bg-muted/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium text-foreground", children: getDisplayName(profile) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-foreground", children: profile.referral_code ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "font-mono text-xs", children: profile.referral_code }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: "N/A" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs text-muted-foreground", children: profile.id }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm text-foreground", children: formatDate(profile.created_at) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      variant: "destructive",
                      size: "sm",
                      className: "h-8 px-2",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-1" }),
                        "Cancella"
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Conferma cancellazione utente" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
                        `Sei sicuro di voler cancellare l'utente "`,
                        getDisplayName(profile),
                        `"? Questa azione è irreversibile e eliminerà l'utente sia da auth.users che da public.profiles.`
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Annulla" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        AlertDialogAction,
                        {
                          onClick: () => handleDeleteUser(profile.id),
                          className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                          children: "Cancella utente"
                        }
                      )
                    ] })
                  ] })
                ] }) })
              ] }, profile.id)) })
            ] }) }),
            hasMore && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                onClick: loadMore,
                disabled: isLoadingMore,
                className: "min-w-[120px]",
                children: isLoadingMore ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-4 w-4 animate-spin" }),
                  "Caricamento..."
                ] }) : "Carica altri 50"
              }
            ) }),
            !hasMore && profiles.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
              "Tutti i ",
              totalCount,
              " utenti sono stati caricati"
            ] }) })
          ] })
        ] })
      ]
    }
  );
};

const PanelUsersPage = () => {
  const { user } = useUnifiedAuth();
  const { profileImage } = useProfileImage();
  const { isWhitelisted, isValidating, accessDeniedReason } = usePanelAccessProtection();
  if (!isWhitelisted) {
    if (isValidating) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "h-12 w-12 text-[#4361ee] mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white text-lg font-semibold", children: "Validazione Accesso M1SSION PANEL™" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400 text-sm mt-2", children: "Verifica clearance in corso..." })
      ] }) });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-16 h-16 text-red-500 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-red-500 mb-2", children: "⛔ Accesso Negato" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400 mb-4", children: "Solo gli amministratori possono accedere a questa pagina" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-black/50 p-4 rounded-lg text-left text-xs font-mono", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-red-400 mb-2", children: "Debug Info:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-300", children: [
          "Email: ",
          user?.email
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-300", children: [
          "Motivo: ",
          accessDeniedReason
        ] })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Helmet, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("title", { children: "M1SSION PANEL™ - Users (Realtime)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("meta", { name: "description", content: "Gestione utenti con aggiornamenti in tempo reale - M1SSION PANEL™" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(UnifiedHeader, { profileImage }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "px-4 py-8",
        style: {
          paddingTop: "calc(72px + 47px + env(safe-area-inset-top, 0px))",
          paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => window.history.back(),
                className: "text-gray-400 hover:text-white transition-colors",
                children: "← Torna al Panel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-white", children: "Users (Realtime)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(UsersRealtimePanel, {})
        ] })
      }
    )
  ] });
};

export { PanelUsersPage as default };
