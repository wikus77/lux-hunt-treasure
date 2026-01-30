# LOGIN OPENING IMPLEMENTATION

## Overview
Nuova pagina login con video background e OAuth (Apple, Google, Email).

**Data**: 2026-01-30
**Branch**: `fix/login-opening-video-bg`
**Tag Rollback**: `rollback-pre-login-opening-video-bg-20260130-0607`

---

## Rollback

```bash
# Tornare al tag di rollback
git checkout rollback-pre-login-opening-video-bg-20260130-0607

# Oppure tornare al branch precedente
git checkout fix/native-iap-option2-ui-catalog

# Se vuoi cancellare il branch
git branch -D fix/login-opening-video-bg
```

---

## File Modificati

| File | Modifica |
|------|----------|
| `src/pages/Login.tsx` | Riscritto con video bg + 3 CTA OAuth |
| `public/assets/VIDEO/M1SSION_INTRO.mp4` | Video background (aggiunto) |
| `LOGIN_OPENING_IMPLEMENTATION.md` | Questa documentazione |

---

## Funzionalità

### Video Background
- Path: `/assets/VIDEO/M1SSION_INTRO.mp4`
- Proprietà: `autoPlay`, `muted`, `loop`, `playsInline`, `preload="auto"`
- Stile: `object-fit: cover`, full viewport
- Poster fallback: `/assets/m1-logo-dark.png`

### Flow "C" Animation
1. **0-2s**: Solo video visibile
2. **2-4s**: Brand logo emerge
3. **4-6s**: CTA buttons appaiono
4. **On tap**: Accelerazione video + feedback pulsante

### CTA Buttons
1. 🍎 **Continua con Apple** - `useAppleAuth` hook
2. 🔐 **Continua con Google** - `useGoogleAuth` hook
3. 📧 **Accedi con email** - Form email/password

### OAuth Configuration
Gli hook OAuth (`useAppleAuth.ts`, `useGoogleAuth.ts`) usano:
```javascript
supabase.auth.signInWithOAuth({
  provider: 'apple' | 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})
```

---

## Test su iPhone (Capacitor)

1. Build:
```bash
npm run build
npx cap sync ios
```

2. Apri Xcode:
```bash
npx cap open ios
```

3. Run su device/simulatore

4. Verifica:
   - [ ] Video parte automaticamente
   - [ ] Animation phases funzionano (2s → 4s → 6s)
   - [ ] Tap su "Continua con Apple" apre OAuth
   - [ ] Tap su "Continua con Google" apre OAuth
   - [ ] Tap su "Accedi con email" mostra form
   - [ ] Post-login redirect funziona

---

## Supabase Auth Configuration

### Apple (Dashboard → Auth → Providers → Apple)
- **Client ID**: `com.m1ssion.web` (Services ID)
- **Secret**: JWT generato con .p8 key
- **Redirect URL**: `https://vkjrqirvdvjbemsfzxof.supabase.co/auth/v1/callback`

### Google (Dashboard → Auth → Providers → Google)
- **Client ID**: Da Google Cloud Console
- **Client Secret**: Da Google Cloud Console
- **Redirect URL**: `https://vkjrqirvdvjbemsfzxof.supabase.co/auth/v1/callback`

---

## Note Tecniche

- Gli hook OAuth esistevano già (`useAppleAuth.ts`, `useGoogleAuth.ts`)
- `StandardLoginForm` riutilizzato per email login
- `createPortal` usato per rendering fullscreen
- `framer-motion` per animazioni
- Safe area insets gestiti per notch/home indicator

---

© 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
