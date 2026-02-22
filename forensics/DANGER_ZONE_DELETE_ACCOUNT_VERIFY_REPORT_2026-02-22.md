# Danger Zone / Delete Account Permanently — Verify-only report (NO PATCH)

**Data:** 2026-02-22  
**Scope:** SOLO lettura codice. Nessuna modifica al flusso delete.

---

## 1) Dove si trova la Danger Zone

| Luogo | File | Righe bottone / handler |
|-------|------|--------------------------|
| **Modale Settings** | `src/components/settings/SettingsContent.tsx` | Danger Zone card 280–328; bottone “Delete Account Permanently” ~297–307; conferma ~308–326; handler `handleDeleteAccount` 61–80, chiamato a 325 |
| **Modale Legal** | `src/components/settings/sections/LegalSectionContent.tsx` | Card Delete Account 196–251; bottone 207–221; conferma 222–249; handler `handleDeleteAccount` 70–88, chiamato a 240 |

Entrambi i flussi sono **identici** a livello di delete (stesse tabelle, stessi ordini, nessuna Edge Function).

---

## 2) Meccanismo usato

- **Edge Function / RPC / Admin endpoint:** NO. Tutto avviene da **client** con il Supabase client autenticato (JWT utente).
- **Chiamate:** solo `supabase.from(...).delete().eq(...)` e `supabase.auth.signOut()`.
- **Hard-delete:** sì, sono `DELETE` reali (non soft-delete né anonymize).

---

## 3) Cosa viene cancellato (evidenze da codice)

### 3.1) Auth user (Supabase Auth)

| Domanda | Risposta | Evidenza |
|--------|----------|----------|
| **Does it delete Auth user?** | **NO** | Nessuna chiamata a `supabase.auth.admin.deleteUser()` o a Edge Function che usi service role. Solo `supabase.auth.signOut()` (SettingsContent.tsx:70, LegalSectionContent.tsx:79). L’utente in `auth.users` **resta**. |

### 3.2) Tabelle DB applicative

Ordine di delete (SettingsContent.tsx 65–69, LegalSectionContent.tsx 74–78):

| Tabella | Cancellata? | Evidence |
|---------|-------------|----------|
| `user_clues` | **YES** | `supabase.from('user_clues').delete().eq('user_id', user.id)` |
| `user_buzz_counter` | **YES** | `supabase.from('user_buzz_counter').delete().eq('user_id', user.id)` |
| `user_notifications` | **YES** | `supabase.from('user_notifications').delete().eq('user_id', user.id)` |
| `subscriptions` | **YES** | `supabase.from('subscriptions').delete().eq('user_id', user.id)` |
| `profiles` | **YES** | `supabase.from('profiles').delete().eq('id', user.id)` |

**Tabelle con dati utente presenti in repo NON cancellate dal flusso:**

| Tabella (o risorsa) | Cancellata? | Note |
|---------------------|-------------|------|
| `user_payment_methods` | **NO** | Usata in PaymentMethodsSectionContent, PaymentMethodsPage |
| `user_cashback_wallet` | **NO** | useCashbackWallet |
| `marker_claims` / `marker_rewards` / `marker_reward_claims` | **NO** | MapTiler3D, ProfilePage, MarkerRewardManager |
| `user_mission_status` | **NO** | useBuzzGrants |
| `buzz_grants` | **NO** | useBuzzGrants |
| `user_roles` | **NO** | AuthProvider |
| `user_map_areas` | **NO** | AgentDiary |
| `payment_transactions` | **NO** | AgentDiary |
| `vera_mission_runs` | **NO** | useBombMissionRun |
| `panel_logs` | **NO** | SubscriptionPlans |
| `iap_transactions` / `subscription_entitlements` / `m1u_ledger` / `user_entitlements` / `user_wallet` | **NO** | Migrations IAP; non chiamate dal delete client |

(RLS applicata: le delete avvengono solo sulle tabelle sopra elencate e solo per le righe dove `auth.uid()` coincide.)

### 3.3) Storage (file)

| Domanda | Risposta | Evidenza |
|--------|----------|----------|
| **Does it delete Storage files?** | **NO** | Nessuna chiamata a `storage.from('avatars').remove()` o simile. Bucket `avatars` (useProfileImage, ProfileInfo, PersonalInfoPage, ProfilePage) **non è toccato**; i file restano (o restano orfani se il path include user id). |

---

## 4) Dati residui (cosa rimane)

- **Auth:** l’utente in `auth.users` resta; può tentare di fare login di nuovo (creerà nuovo profilo se esiste insert on signup, oppure errori se le app assumono profilo esistente).
- **DB:** restano tutte le tabelle elencate sopra come “NON cancellate” (payment methods, cashback, marker claims/rewards, mission status, buzz_grants, user_roles, map areas, transactions, IAP/entitlements/m1u, panel_logs, vera_mission_runs, ecc.).
- **Storage:** file in `avatars` (e eventuali altri bucket utente) restano.
- **Locale:** `localStorage.clear()` eseguito (SettingsContent 71, Legal 80) prima di reload/redirect.

---

## 5) Gap principali per un “hard delete” completo (tecnico)

1. **Auth user:** serve chiamata server-side (Edge Function o backend con service role) a `auth.admin.deleteUser(uid)`; il client non può farlo.
2. **Altre tabelle:** aggiungere delete (o cascade da `profiles`/`auth.users` se possibile) per: `user_payment_methods`, `user_cashback_wallet`, `marker_claims`, `marker_reward_claims`, `user_mission_status`, `buzz_grants`, `user_roles`, `user_map_areas`, `payment_transactions`, `vera_mission_runs`, e tabelle IAP/entitlements/m1u se si vogliono rimuovere anche quelli.
3. **Storage:** rimozione esplicita degli oggetti utente nel bucket `avatars` (e altri bucket per utente) da server/Edge Function.
4. **Idempotenza / sicurezza:** nessun rate limit o audit log nel flusso attuale; le delete sono “one-shot” dal client con JWT; per compliance/audit andrebbero log e possibilmente un solo punto di delete (es. una Edge Function) con controlli e limiti.

---

## 6) Rischio (nota tecnica)

- Il CTA promette “Delete Account **Permanently**” e “**irreversible**”.
- In realtà: **non** viene eliminato l’account Auth; **non** vengono eliminati diversi dati applicativi (pagamenti, rewards, missioni, ruoli, storage).
- Rischio: aspettativa utente (“tutto cancellato”) non allineata al comportamento reale; possibili richieste GDPR (diritto alla cancellazione) non pienamente soddisfatte per dati residui e account Auth riutilizzabile.

---

## 7) Conferma: nessuna patch applicata

- Nessuna modifica al flusso Danger Zone / Delete Account.
- Report basato solo su lettura di SettingsContent.tsx e LegalSectionContent.tsx e su grep delle tabelle/storage nel repo.
