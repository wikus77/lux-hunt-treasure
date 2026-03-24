# HOME AUTH STATE UNIFICATION PATCH — OUTPUT

**Data:** 2026-03-09  
**Tag rollback:** `safety/home-auth-unification-pre`  
**HEAD al tag:** 7012170a1132f77a66f7359d69b9be6cd97e703b

---

## File modificati

| File | Modifica |
|------|----------|
| `src/components/command-center/CommandCenterHome.tsx` | `useAuth()` → `useAuthContext()` per `user` |
| `src/hooks/useHierarchyRank.ts` | Rimosso `useAuth()`; `user` e `authReady` da `useAuthContext()` |
| `src/hooks/useMissionStatus.ts` | `useAuth()` → `useAuthContext()` per `user` |
| `src/hooks/usePrizeData.ts` | `useAuth()` → `useAuthContext()` per `user` |
| `src/features/pulse/hooks/useAgentEnergy.ts` | Rimosso `useAuth()`; `user` e `authReady` da `useAuthContext()` |
| `src/components/command-center/home-sections/AgentDiary.tsx` | `useAuth()` → `useAuthContext()` per `user` |
| `src/components/command-center/home-sections/AgentDiaryContent.tsx` | `useAuth()` → `useAuthContext()` per `user` |
| `src/components/command-center/home-sections/PrizeVision.tsx` | `useAuth()` → `useAuthContext()` per `user` |

**Totale:** 8 file.

---

## Diff sintetico

- **Import:** `import { useAuth } from '@/hooks/use-auth'` (o `@/hooks/use-auth`) sostituito con `import { useAuthContext } from '@/contexts/auth'` (o `@/contexts/auth`).
- **Lettura user:** `const { user } = useAuth()` sostituito con `const { user } = useAuthContext()`.
- **useHierarchyRank / useAgentEnergy:** già usavano `useAuthContext()` per `authReady`; ora leggono anche `user` da `useAuthContext()` e non usano più `useAuth()`.

Logica di fetch, guard (`if (!user?.id) return`, `if (!user) return`) e dipendenze restano invariate.

---

## Type-check

```bash
npx tsc --noEmit
```

**Risultato:** ✅ Exit code 0 (nessun errore TypeScript).

---

## Build

```bash
npm run build
```

**Risultato:** ✅ Exit code 0. Build completata in ~1m 21s. Bundle generato in `dist/`. Warning presenti solo su import dinamici/statici preesistenti (nessun warning critico introdotto dalla patch).

---

## Cap sync iOS

```bash
npx cap sync ios
```

**Risultato:** ✅ Exit code 0.  
- Copying web assets: ✔  
- Updating iOS plugins: ✔  
- Sync finished in ~35s  

---

## Post-patch verification

| Componente / hook | Fonte auth per `user` | useAuth() presente? |
|-------------------|------------------------|----------------------|
| **AppHome** | useUnifiedAuth() (AuthContext) | No |
| **CommandCenterHome** | useAuthContext() | No |
| **useHierarchyRank** | useAuthContext() (user, authReady) | No |
| **useMissionStatus** | useAuthContext() | No |
| **usePrizeData** | useAuthContext() | No |
| **useAgentEnergy** | useAuthContext() (user, authReady) | No |
| **AgentDiary** | useAuthContext() | No |
| **AgentDiaryContent** | useAuthContext() | No |
| **PrizeVision** | useAuthContext() | No |

**MissionPanel:** continua a usare `useUnifiedAuth()` per `getCurrentUser` (già AuthContext). Nessuna modifica.

**Conclusione:** In Home (AppHome + CommandCenterHome + sezioni e hook dati) la fonte auth è unificata: **AuthProvider → AuthContext → useUnifiedAuth() / useAuthContext()**. Nessun consumer Home legge più `user` da useAuthSessionManager (useAuth()).

---

## Rollback (se necessario)

```bash
git reset --hard safety/home-auth-unification-pre
```

---

*Patch completata. Nessun rollback eseguito. Login, logout, IAP, BUZZ, push, AuthProvider, use-auth-session-manager, authSingleFlight non modificati.*
