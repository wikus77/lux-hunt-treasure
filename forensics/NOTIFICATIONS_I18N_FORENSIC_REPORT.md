# NOTIFICATIONS I18N FORENSIC REPORT

**Date:** 2026-02-14  
**Context:** Pagina Notifiche + modali — localizzazione UI senza toccare BUZZ flow  
**Tag rollback:** `SNAPSHOT_PRE_NOTIFICATIONS_I18N_20260214_035000`

---

## TASK 1 — DENY LIST (BUZZ FLOW FROZEN)

**NON TOCCARE:**

| Path | Note |
|------|------|
| `src/pages/BuzzPage.tsx` | Entry BUZZ |
| `src/components/buzz/**` | BuzzActionButton, BuzzButton, ecc. |
| `src/hooks/**buzz**` | useBuzzHandler, useBuzzGrants, useBuzzApi, useBuzzFeature, useBuzzClues, ecc. |
| `supabase/functions/**buzz**` | handle-buzz-press, buzz-map-resolve, ecc. |
| `src/gameplay/events/**` | emitGameEvent, getEventCopy |
| `src/components/feedback/**` | CelebrationModal, CelebrationToast — read only |
| Migrations che toccano `prize_clues`, `user_clues` | — |

**Regola:** Se una patch richiede modificare un file sopra → STOP, report senza patch.

---

## TASK 2 — MAPPA ROUTE E COMPONENT TREE

### Route
- **Path:** `/notifications`
- **File route:** `src/routes/WouterRoutes.tsx` line 553-555
- **Componente:** `Notifications` da `@/pages/Notifications`

### Component tree

```
Notifications (pages/Notifications.tsx)
├── Tabs [Notifiche | Messaggi]
├── NotificationsHeader
│   ├── "Le tue notifiche"
│   ├── [Aggiorna] [Segna tutto]
│   └── Filtri: [Generali] [Buzz] [Classifica]
├── NotificationsList
│   ├── NotificationCategory (per ogni categoria)
│   │   ├── Card con categoryInfo.title
│   │   └── NotificationCategoryFlipOverlay
│   │       └── NotificationCategoryContent
│   │           ├── Header: title, "X notifiche • Y non lette"
│   │           ├── Stats: Totali | Non lette
│   │           ├── NotificationItem (lista)
│   │           └── Empty: "Nessuna notifica", "Le nuove notifiche appariranno qui"
│   └── NotificationsEmptyState
│       ├── "Nessuna notifica da visualizzare"
│       ├── "Le tue notifiche appariranno qui"
│       └── [Ricarica notifiche]
```

### Origine titoli categoria
- `src/utils/notificationCategories.ts` → `getCategoryInfo(category)` restituisce `title` hardcoded:
  - `'Buzz Notifications'`, `'Generali'`, `'Aggiornamento Classifica'`, ecc.

---

## STRINGHE HARDCODED (file + linea)

| File | Linea | Stringa | i18n? |
|------|-------|---------|-------|
| NotificationsHeader.tsx | 24 | "Le tue notifiche" | ❌ |
| NotificationsHeader.tsx | 29 | "Aggiorna" | ❌ |
| NotificationsHeader.tsx | 33 | "Segna tutto" | ❌ |
| NotificationsHeader.tsx | 45 | "Generali" | ❌ |
| NotificationsHeader.tsx | 51 | "Buzz" | ❌ |
| NotificationsHeader.tsx | 58 | "Classifica" | ❌ |
| Notifications.tsx | 139 | "Notifiche" | ❌ |
| Notifications.tsx | 151 | "Messaggi" | ❌ |
| notificationCategories.ts | 15-46 | Tutti i title | ❌ |
| NotificationCategory.tsx | 74 | "{n} notifiche" | ❌ |
| NotificationCategory.tsx | 79 | "{n} nuove" | ❌ |
| NotificationCategoryContent.tsx | 54-55 | "notifica/notifiche", "non lette" | ❌ |
| NotificationCategoryContent.tsx | 80 | "Totali" | ❌ |
| NotificationCategoryContent.tsx | 84 | "Non lette" | ❌ |
| NotificationCategoryContent.tsx | 120-121 | "Nessuna notifica", "Le nuove notifiche..." | ❌ |
| NotificationItem.tsx | 151 | "Contenuto completo" | ❌ |
| NotificationItem.tsx | 163 | "Copiato!" / "Copia" | ❌ |
| NotificationItem.tsx | 177 | "Tieni premuto per copiare" | ❌ |
| NotificationItem.tsx | 184 | "Data completa" | ❌ |
| NotificationItem.tsx | 191 | "Stato" | ❌ |
| NotificationItem.tsx | 200 | "Letta" / "Non letta" | ❌ |
| NotificationItem.tsx | 218 | "Segna come letta" | ❌ |
| NotificationItem.tsx | 225 | "Elimina notifica" | ❌ |
| NotificationItem.tsx | 55-57 | Toast "Contenuto copiato!", "Impossibile copiare" | ❌ |
| NotificationsEmptyState.tsx | 14 | "Nessuna notifica da visualizzare" | ❌ |
| NotificationsEmptyState.tsx | 15 | "Le tue notifiche appariranno qui" | ❌ |
| NotificationsEmptyState.tsx | 22 | "Ricarica notifiche" | ❌ |

### Time ago
- `NotificationItem.tsx` usa `formatDistanceToNow` da date-fns con `locale: it` — la data è localizzata dalla libreria. Per multilingua bisogna passare `i18n.language` → `it`/`en`/`fr` a date-fns locale. **Consentito:** cambio locale in base a i18n.

### Payload notifiche
- `notification.title` e `notification.description` arrivano da DB (`user_notifications`, `app_messages`). **NON modificare** — sono dati, non UI.

---

## PIANO PATCH (SOLO UI)

1. Aggiungere chiavi in it/en/fr `common.json`
2. `NotificationsHeader` → useTranslation, t(...)
3. `Notifications` (tabs) → useTranslation, t(...)
4. `notificationCategories` → restituire `titleKey` invece di `title`; componenti usano t(titleKey)
5. `NotificationCategory` → useTranslation, t(...)
6. `NotificationCategoryContent` → useTranslation, t(...)
7. `NotificationItem` → useTranslation, t(...) + passare locale a date-fns
8. `NotificationsEmptyState` → useTranslation, t(...)

**Nessun file nella deny list verrà modificato.**
