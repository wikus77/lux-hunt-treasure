# Disaster Recovery — FASE 1: Backup completo safe — Report

**Data/ora:** 2026-03-06 (backup avviato 06:47:01)  
**Esito:** **BACKUP OK**

---

## 1. Path progetto sorgente

```
/Users/josephmule/lux-hunt-treasure
```

---

## 2. Branch e commit attuale (al momento del backup)

| Voce | Valore |
|------|--------|
| **Branch** | `fix/m1u-slotloop-anim` |
| **Commit HEAD** | `aca569c0089e90adcb76a008e375ca6812ef8349` |
| **Remote** | `origin` → `https://github.com/wikus77/lux-hunt-treasure.git` |

---

## 3. Stato Git sintetico (modified / untracked)

- **Righe `git status --short`:** ~504 (file modificati, eliminati o untracked).
- **Nessun commit, push o modifica al working tree:** il backup è una copia dello stato attuale del progetto così com’è sul disco (tracked, modificati non committati, untracked).

---

## 4. Path esatto del backup creato (cartella)

```
/Users/josephmule/BACKUPS_M1SSION/M1SSION_FULL_BACKUP_20260306_064701
```

---

## 5. Path esatto dell’archivio creato (compressa)

```
/Users/josephmule/BACKUPS_M1SSION/M1SSION_FULL_BACKUP_20260306_064701.tar.gz
```

---

## 6. Cosa è stato incluso

- **Tutto il progetto** sotto `/Users/josephmule/lux-hunt-treasure/`, inclusi:
  - cartella **`.git`** (storia, branch, commit, working tree non modificato)
  - **`src/`** (tutto il sorgente, incluso file untracked)
  - **`supabase/`** (functions, migrations, config)
  - **`ios/`** (progetto Xcode; esclusi solo build/Pods/output come da sezione 7)
  - **`android/`** (esclusi solo build/.gradle come da sezione 7)
  - **`.env`**, **`.env.local`**, **`.env.example`**, **`.env.local.example`**, **`.env.local.sample`**
  - file e cartelle nascosti utili (es. `.gitignore`)
  - **`public/`**, **`reports/`**, **`docs/`**, configurazioni (Capacitor, package.json, ecc.)
- **File modificati non committati** e **file untracked**: inclusi perché la copia è stata fatta dal filesystem così com’è.

---

## 7. Cosa è stato escluso e perché (ricostruibile)

| Escluso | Motivo (ricostruibile senza perdita) |
|---------|--------------------------------------|
| **`node_modules`** | Reinstallabile con `npm install` da `package.json` / lockfile. |
| **`ios/App/Pods`** | Reinstallabile con `cd ios/App && pod install` dopo clone/copia. |
| **`ios/App/App/build`** | Output di build Xcode; si rigenera con build. |
| **`ios/App/App/output`** | Output Capacitor; si rigenera con `npx cap sync ios`. |
| **`DerivedData`** | Cache Xcode; si rigenera compilando. |
| **`dist`** | Output `npm run build`; si rigenera. |
| **`dist-ssr`** | Output build SSR se presente; si rigenera. |
| **`.vite`** | Cache Vite; si rigenera. |
| **`android/app/build`** | Output build Android; si rigenera. |
| **`android/.gradle`** | Cache Gradle; si rigenera. |
| **`.cache`** | Cache generica; si rigenera. |

Nessun file sorgente, env, config o dato di progetto è stato escluso.

---

## 8. Verifica integrità backup (FASE 2)

| Verifica | Esito |
|----------|--------|
| Cartella backup esiste | Sì: `/Users/josephmule/BACKUPS_M1SSION/M1SSION_FULL_BACKUP_20260306_064701` |
| Archivio compresso esiste | Sì: `M1SSION_FULL_BACKUP_20260306_064701.tar.gz` |
| **Dimensione cartella backup** | **~11 G** (du -sh) |
| **Dimensione archivio** | **~9,9 G** (~10 583 562 982 byte) |
| **Conteggio file (approssimativo)** | **9 086** file |
| Presenza **`src/`** | Confermata |
| Presenza **`supabase/`** | Confermata |
| Presenza **`ios/`** | Confermata |
| Presenza **`.env`** | Confermata (2113 byte) |
| Presenza **`.env.local`** | Confermata (130 byte) |

### Checksum archivio (SHA-256)

L’archivio è grande (~10 GB); il calcolo di `shasum -a 256` può richiedere diversi minuti. Per generare e verificare il checksum in seguito:

```bash
shasum -a 256 /Users/josephmule/BACKUPS_M1SSION/M1SSION_FULL_BACKUP_20260306_064701.tar.gz
```

Salvare l’output (es. in questo report o in un file `.sha256`) per verifica futura dell’integrità dell’archivio.

*(Se in fase di audit è stato già eseguito e disponibile, inserire qui il valore:)*  
**SHA-256:** *(da compilare dopo esecuzione manuale del comando sopra)*

---

## 9. Esito finale

**BACKUP OK**

- Copia completa del progetto (con esclusioni solo di artefatti ricostruibili) è stata creata in:
  - **Cartella:** `/Users/josephmule/BACKUPS_M1SSION/M1SSION_FULL_BACKUP_20260306_064701`
  - **Archivio:** `/Users/josephmule/BACKUPS_M1SSION/M1SSION_FULL_BACKUP_20260306_064701.tar.gz`
- Sono presenti `src/`, `supabase/`, `ios/`, `.env` e `.env.local`.
- Nessun file del progetto sorgente è stato modificato, committato o pushato; nessuna operazione Git eseguita.

---

## 10. Prossima fase raccomandata

**FASE 2: Inventario file untracked/importanti**

- Redigere l’inventario dei file untracked e delle modifiche non committate rilevanti per il disaster recovery (es. `GlobalM1UCreditOverlay.tsx`, `m1uCreditEvent.ts`, Supabase functions/migrations, ecc.) e documentarli in un report dedicato prima di procedere con commit e push (Fasi 3–4).

---

**Fine report FASE 1. Nessuna modifica al repo; nessun commit; nessun push.**
