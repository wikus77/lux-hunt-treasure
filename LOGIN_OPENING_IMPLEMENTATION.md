# LOGIN OPENING IMPLEMENTATION

## Overview
Nuova pagina login "Runway-Style" con video background e 2 CTA (Sign Up / Log In).

**Data**: 2026-01-30
**Branch**: `fix/login-runway-layout-video`
**Tag Rollback**: `rollback-pre-login-runway-layout-video-20260130-0830`

### Version History
- v8: Video bg + 3 CTA (broken - UI required tap/video load)
- v9: "Runway-Style" - UI appears immediately, 2 CTA buttons (video still not visible)
- **v10**: Video FIXED (case-sensitive path), headline LEFT-aligned (Runway style)

---

## Rollback

```bash
# Tornare al tag di rollback
git checkout rollback-pre-login-runway-layout-video-20260130-0830

# Oppure tornare al branch precedente
git checkout fix/login-video-visible-copy

# Per cancellare il branch corrente
git branch -D fix/login-runway-layout-video
```

---

## Root Cause (Video non visibile su iOS)

**CAUSA**: Case-sensitivity nel path del video
- Codice usava: `/assets/VIDEO/M1SSION_INTRO.mp4` (uppercase)
- Folder nel bundle iOS: `/assets/video/` (lowercase)
- WKWebView è case-sensitive per il caricamento risorse!

**FIX**: Cambiato `VIDEO_SRC` in `/assets/video/M1SSION_INTRO.mp4`

---

## Verifica su iPhone

1. Build e sync:
```bash
npm run build
npx cap sync ios
npx cap open ios
```

2. Run su device/simulatore iOS

3. Checklist:
- [ ] Video visibile SUBITO (non nero)
- [ ] Headline "Tools for Real-World Treasure Hunting" LEFT-aligned
- [ ] Small "M1SSION" label top-left
- [ ] CTA "Sign Up" / "Log In" funzionanti
- [ ] Transizioni IDENTICHE a prima

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
