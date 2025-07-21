/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * UNIFIED AUTHENTICATION SYSTEM - Documentazione Tecnica
 * Sistema unificato per PWA Safari iOS
 */

# Sistema di Autenticazione Unificato M1SSION™

## Architettura

### COMPONENTI PRINCIPALI
- `AuthProvider.tsx` - Provider unificato (unica fonte di verità)
- `useUnifiedAuth.ts` - Hook principale per accesso all'auth
- `AuthContext.ts` - Context React standard
- `types.ts` - Interface TypeScript

### COMPONENTI DEPRECATI
- ~~`useAuth.ts`~~ - SOSTITUITO da `useUnifiedAuth`  
- ~~`useAuthSessionManager.ts`~~ - SOSTITUITO da logica nativa Supabase

## Funzionamento

### 1. PERSISTENZA SESSIONE
- **Nativo Supabase**: `supabase.auth.getSession()` unica fonte di verità
- **NO localStorage personalizzato**: Solo Supabase gestisce persistenza
- **PWA Safari iOS**: Gestione `visibilityState` per refresh sessione

### 2. STATO UNIFICATO
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null; 
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email, password) => Promise<{success, error, session}>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}
```

### 3. UTILIZZO NELL'APP
```typescript
// In qualsiasi componente
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

const { isAuthenticated, user, login, logout } = useUnifiedAuth();
```

## Strategy di Test PWA

### Test di Persistenza:
1. Login su Safari iOS
2. Installare come PWA
3. Chiudere completamente l'app
4. Riaprire → Sessione deve persistere
5. Aprire da browser normale → Stessa sessione

### Debug Mode:
```typescript
const DEBUG_UNIFIED_AUTH = true; // per logs dettagliati
```

## Benefici

✅ **Eliminazione Race Conditions**
✅ **Persistenza stabile su Safari iOS PWA**  
✅ **Unica fonte di verità per lo stato auth**
✅ **Compatibilità completa Supabase nativa**
✅ **Rimozione logica ridondante**
✅ **Performance migliorate (meno re-render)**

## Policy localStorage

- **PRODUZIONE**: Solo Supabase gestisce storage
- **DEBUG**: Logging opzionale per troubleshooting
- **PWA**: Visibility handler per refresh automatico sessioni

## Migrazione Completata

- [x] AuthProvider unificato
- [x] useUnifiedAuth hook
- [x] WouterRoutes aggiornato  
- [x] ProtectedRoute aggiornato
- [x] Deprecazione vecchi hook
- [x] PWA Safari iOS ottimizzato