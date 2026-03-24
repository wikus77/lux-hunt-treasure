# Verifica forense Xcode build 30–40 minuti — Report read-only

**Project:** M1SSION™ — iOS wrapped app (Capacitor WKWebView)  
**Repo:** /Users/josephmule/lux-hunt-treasure  
**Data:** 2026-03-14  
**Vincolo:** READ-ONLY ASSOLUTO — nessuna modifica applicata.

---

## 1. EXECUTIVE SUMMARY

**Causa più probabile del salto da ~5–10 min a ~30–40 min:**

1. **Fase Resources + install su device** — La cartella **`ios/App/App/public`** (~**499 MB**, 450 file) è inclusa nelle Resources del target App. Xcode la copia nel bundle a ogni build; l’app risultante (~500 MB) viene poi installata sul device. Con **disco al 95%** (106 GB liberi su 1,9 TB), le operazioni I/O (copia in DerivedData, codesign, install via Wi‑Fi/hotspot) diventano molto più lente. Questo spiega la maggior parte del tempo aggiuntivo.
2. **Disco quasi pieno** — Filesystem al **95%** di capacità. DerivedData, cache e copia di centinaia di MB risentono fortemente di I/O lento e possibile swap.
3. **LLDB RPC crash / attach** — Il messaggio “The LLDB RPC server has crashed” riguarda la fase di **lancio e attach del debugger**, non la compilazione. Se i 2119–2222 secondi sono misurati da “Run” fino a “app in esecuzione” (o fino a messaggio di errore), una parte consistente può essere: install sul device + primo launch + attach LLDB + eventuale crash e ritenti. Letteratura: avvio con debugger su device può richiedere 1–2+ minuti; un crash LLDB può aggiungere attese lunghe o ritenti.

**Top 3 cause (priorità):**

1. **Risorse “public” (499 MB) in Resources + install di un bundle ~500 MB su device**, amplificato da disco al 95%.
2. **Disco al 95%** — Rallenta ogni fase I/O (Resources, DerivedData, codesign, install).
3. **Tempo misurato include build + install + launch + attach (e possibili ritardi LLDB)** — Non è solo “build Xcode” ma l’intero ciclo Run → app avviata (o errore).

**GO / NO GO per fix mirato safe:** **GO**. È possibile intervenire in modo circoscritto (riduzione footprint `public`, liberare disco, verificare scheme/LLDB, eventuale riabilitazione input/output paths CocoaPods) senza toccare login, IAP, BUZZ, push, DB, i18n, business logic.

---

## 2. BUILD TIMELINE INTERPRETATION

**Cosa rappresentano i 2119–2222 secondi (~35–37 min):**

- Xcode non distingue in un unico numero “solo build” vs “solo install” vs “solo launch”. Il tempo che vedi è tipicamente:
  - **Build:** Sources → Frameworks → **Resources** (qui: copia di `public` 499 MB, Assets.xcassets, storyboard, config) → **[CP] Embed Pods Frameworks** → (link, codesign).
  - **Install:** Copia dell’app (.app ~500 MB) sul device (via cavo o wireless). Con Wi‑Fi o hotspot 5G, la banda non è il solo limite: anche I/O su Mac (lettura bundle da DerivedData su disco quasi pieno) e su device.
  - **Launch + attach:** Avvio dell’app sul device e attach del debugger (LLDB). Se compare “LLDB RPC server has crashed”, questa fase può fallire o ritardare molto (minuti).

**Dove si perde tempo (in ordine di impatto probabile):**

1. **Resources** — Copiare 499 MB e 450 file da `ios/App/App/public` nel bundle. Su disco al 95%, questa fase può richiedere **molti minuti** (ordine 10–20+ min in casi estremi, dipende da disco e stato della cache).
2. **Installazione su device** — Trasferimento di un .app da ~500 MB. Anche con Wi‑Fi/hotspot buono, la lettura del bundle da disco lento sul Mac e la scrittura sul device contribuiscono. Stima: **5–15+ min** in condizioni sfavorevoli.
3. **Compile asset catalogs (actool)** — In un report precedente ~443 s. Nel progetto attuale: `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = NO` e M1.png rimosso; actool può essere ancora nell’ordine di **alcuni minuti** (3–7 min) per l’intero Assets.xcassets.
4. **Launch + LLDB attach** — Se il tempo è “da Run a app aperta”: 1–2+ min per avvio con debugger; se LLDB crasha, ritardi o ritenti possono aggiungere **minuti**.
5. **[CP] Embed Pods Frameworks** — Eseguito a ogni build (nessun output dichiarato). Pods ~3,5 MB → impatto in **secondi**, non minuti.

**Conclusione:** Il tempo enorme è molto probabilmente **build (in particolare Resources) + install + eventuale launch/attach**. Non è possibile separare i tre senza un log Xcode con tempi per fase (Report navigator → ultima build → tempi per ogni step). Raccomandazione: in una build di test, annotare i secondi mostrati da Xcode per “Copy Bundle Resources” e “Install” (e, se possibile, per “Compile asset catalogs”) per conferma.

---

## 3. REGRESSION ANALYSIS

**Modifiche recenti al progetto iOS / build:**

- **project.pbxproj / Podfile:** Ultimo commit che li modifica: **2026-02-22** (“chore(safety): snapshot before appinfo hide links + video modals i18n + dontshow fix”). **Nessuna modifica** a `ios/App/App.xcodeproj/project.pbxproj` o `ios/App/Podfile` nei successivi ~20 giorni (fino al 2026-03-14).
- **Commit recenti che toccano `ios/`:** Principalmente snapshot/safety (rollback, forensics, fix vari); nessun commit negli ultimi 1–2 giorni che alteri la struttura del progetto Xcode o le Resources.

**Correlazione con l’aumento del tempo:**

- **Nel codice/progetto:** Non c’è una modifica “smoking gun” nei file iOS/vite/capacitor negli ultimi 1–2 giorni che spieghi da sola il salto a 30–40 min. La dimensione di `ios/App/App/public` (499 MB, 450 file) è **strutturale** da tempo (report precedenti: 463 MB, 454 file — stesso ordine di grandezza; la differenza può essere contenuto dopo cap sync o misura).
- **Ambiente:** La causa più plausibile di un **peggioramento improvviso** a parità di progetto è **ambiente**:
  - **Disco passato da “abbastanza libero” a 95%** (106 GB liberi) → I/O molto più lento.
  - **DerivedData** cresciuto o corrotto → build meno incrementali o più lente.
  - **Xcode / macOS / iOS** aggiornati → possibili regressioni (es. Xcode 16 packaging lento segnalato in letteratura).
  - **Device / LLDB** — certificato di trust, versione iOS, o crash LLDB che prima non si manifestavano.

**Ranking impatto (modifiche / fattori):**

| Fattore | Impatto | Probabilità | Note |
|--------|---------|-------------|------|
| Disco 95% | Molto alto | Alta | Spiega peggioramento senza cambi codice |
| Dimensione `public` (499 MB) in Resources | Molto alto | Certa | Costante, ma con disco pieno diventa dominante |
| Install bundle ~500 MB su device | Alto | Alta | Parte del tempo totale “Run” |
| LLDB crash / attach lento | Medio | Media | Spiega parte del tempo se misurato fino a “app running” |
| Regressione Xcode/macOS | Medio | Possibile | Da verificare con versione Xcode |
| Modifiche i18n / daily missions / asset pipeline | Basso | Bassa | Nessun commit recente che cambi project/Resources |

---

## 4. XCODE / IOS WRAPPER FINDINGS

**Risorse incluse nel target App (Resources build phase):**

- `LaunchScreen.storyboard`
- **`public`** (riferimento a cartella `ios/App/App/public`) — **499 MB, 450 file**
- `Assets.xcassets`
- `capacitor.config.json`
- `Main.storyboard`
- `config.xml`

**Nessuna duplicazione anomala:** La cartella `public` è referenziata una sola volta come “public in Resources”. Il contenuto è quello sincronizzato da `npx cap sync ios` (webDir: `dist`). Non risultano altre copie della stessa cartella nelle Resources.

**Build phases (ordine):**

1. [CP] Check Pods Manifest.lock — ha `outputPaths` → può essere saltata se lock invariato.
2. Sources (AppDelegate.swift, FaceIDManager.swift)
3. Frameworks
4. **Resources** (include `public`, Assets.xcassets, storyboard, config)
5. **[CP] Embed Pods Frameworks** — **inputPaths e outputPaths vuoti** → eseguita **a ogni build**.

**Motivo script “sempre eseguito”:** In `Podfile` è presente:

```ruby
install! 'cocoapods', :disable_input_output_paths => true
```

(Commento: workaround per cache Pods con Cordova plugins.) CocoaPods quindi non inserisce input/output per le script phase → Xcode non può considerare la phase “up to date” e la riesegue sempre. **Impatto:** basso (Pods 3,5 MB, script veloce).

**Copy XCFrameworks:** Nel `project.pbxproj` **non** è presente alcuna build phase “[CP] Copy XCFrameworks”. È presente solo “[CP] Embed Pods Frameworks”. Se nei log compare “Copy XCFrameworks will be run during every build”, può provenire da un altro target o da messaggi generati da CocoaPods/Xcode in versione diversa; nel progetto attuale non c’è tale phase.

**Build settings rilevanti:**

- `ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon`
- `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = NO` (Debug e Release)
- `SWIFT_VERSION = 5.0`
- Deployment target 14.0, CODE_SIGN_STYLE Automatic

**AppIcon:** M1.png non è presente in `AppIcon.appiconset`; il fix precedente (rimozione orfano + INCLUDE_ALL = NO) risulta applicato. Restano molte dimensioni in `Contents.json` (icone legacy); actool può ancora impiegare alcuni minuti.

**Rebuild completo:** Con `emptyOutDir` / clean o dopo cambi di Podfile, Xcode rifà tutto. Con disco al 95% e Resources da 499 MB, ogni “full” rebuild è molto costosa. Non è stato possibile verificare se Xcode sta facendo incremental corretto sulle Resources senza log di build con tempi per fase.

---

## 5. PODS / PLUGINS FINDINGS

**Podfile e Pods attuali:**

- Capacitor, CapacitorCordova, CapacitorApp, CapacitorHaptics, CapacitorPushNotifications, CapacitorStatusBar, CapacitorGeolocation, **CapgoNativePurchases**, CapacitorPluginSafeArea.
- Dimensione **Pods: 3,5 MB**, 126 file.

**Warning “[CP] Embed Pods Frameworks will be run during every build because it does not specify any outputs”:**

- **Causa:** `Podfile` ha `install! 'cocoapods', :disable_input_output_paths => true` → la phase Embed Pods Frameworks ha `outputPaths` (e `inputPaths`) vuoti nel pbxproj.
- **Impatto sul tempo:** Trascurabile. Lo script copia/embed framework piccoli; nell’ordine di secondi.

**Warning Swift 6 (NativePurchasesPlugin.swift):**

- “reference to captured var 'self' in concurrently-executing code” — warning di lingua Swift 6. Non blocca la build; può aggiungere tempo di compilazione Swift in misura limitata (secondi), **non** 20–30 min.

**CapacitorPushNotifications / CapacitorSafeArea deprecations:**

- Deprecation warning non causano di per sé build da 30 min. Impatto trascurabile.

**Conclusione:** Pods e plugin **non** sono la causa principale del tempo di build. La phase Embed Pods senza output è un fattore secondario (sempre eseguita ma veloce).

---

## 6. DEVICE / LLDB / INSTALL FINDINGS

**Messaggio “Failed to launch: The LLDB RPC server has crashed”:**

- **Significato:** Il processo LLDB (bridge tra Xcode e l’app sul device per il debug) è terminato in modo anomalo. Succede in fase di **lancio dell’app e attach del debugger**, non durante compilazione o “Copy Bundle Resources”.
- **Impatto sui tempi:** Può far sembrare “build” molto lunga se il tempo misurato è “da Run a app avviata (o a messaggio di errore)”. Possibili effetti:
  - Attesa lunga prima del crash (timeout di connessione/attach).
  - Ritenti automatici o manuali → minuti aggiuntivi.
  - Avvio con debugger su device spesso 1–2+ minuti anche quando funziona; con LLDB instabile può essere molto di più.
- **Compatibilità con Wi‑Fi e hotspot 5G:** Sì. Il crash LLDB è legato a debugger/device/Xcode/iOS, non alla banda di rete. Rete lenta influisce su **install** (trasferimento .app), non su “LLDB RPC server crashed”.
- **Letteratura:** Crash LLDB e avvio lento sono associati a: Xcode/iOS version mismatch, derived data/cache corrotti, trust developer certificate, wireless debugging. Soluzioni tipiche: aggiornare Xcode, riavviare Xcode e device, ri‑trust certificato, pulire DerivedData, ri-pairing device; workaround: disabilitare “Debug Executable” nello scheme per eseguire senza debugger.

**Interpretazione per i 2119–2222 secondi:**

- Se il numero viene da “Report navigator” di Xcode come “build duration”, allora è **build + (eventualmente) install**.
- Se il numero è “da click Run a quando l’app parte o esce l’errore”, allora include anche **install + launch + attach (e ritardi/crash LLDB)**.
- In entrambi i casi, **Resources (499 MB) e install di un bundle ~500 MB** restano i principali candidati per la maggior parte del tempo; LLDB può spiegare una **parte aggiuntiva** significativa se il tempo include la fase di launch.

---

## 7. ENVIRONMENT FINDINGS

**Disco:**

- **Filesystem:** `/dev/disk2s2` (System/Volumes/Data)
- **Size:** 1,9 TiB
- **Used:** 1,8 TiB
- **Available:** 106 GiB
- **Capacity:** **95%**

**Impatto:** Con disco al 95%, macOS e Xcode sono noti per degradare: I/O lento, swap più frequente, cache e DerivedData su disco pieno. Copiare 499 MB in fase Resources e poi leggere un bundle da ~500 MB per l’install su device sono operazioni molto sensibili a I/O lento. **Stima:** può facilmente **raddoppiare o più** i tempi di queste fasi rispetto a un disco con 30–40% di uso. È un candidato forte per spiegare un salto da 5–10 min a 30–40 min senza cambiare codice.

**DerivedData / Xcode aperto da giorni / terminale:**

- Non verificabili in read-only (path DerivedData, uptime Xcode/term). Se DerivedData è corrotto o enorme, build incrementali possono essere invalidate o lente. Xcode aperto a lungo può accumulare stato; terminale in cwd con node_modules (62k file) può rendere operazioni nella shell lente. **Impatto plausibile:** da basso a medio su “percezione” e su operazioni che toccano il progetto; non il driver principale dei 30–40 min, che resta I/O (Resources + install) e disco.

**Peso bundle e cartelle:**

- `ios/App/App/public`: **499 MB**, 450 file
- `ios/App/App`: **502 MB**
- `dist`: 469 MB (locale)
- `public`: 431 MB

L’app bundle finale è dominata da `public`. Installare ~500 MB su device (via Wi‑Fi o cavo) richiede tempo; con disco Mac lento, anche la **preparazione** del bundle (Resources, codesign) è lenta.

**Conclusione:** **Disco al 95%** è il fattore ambiente con **impatto più alto e probabile**; peso di `public` e bundle è la **struttura** che, combinata con disco pieno, produce i tempi osservati.

---

## 8. ROOT CAUSE RANKING

| # | Causa | Gravità | Probabilità | Impatto stimato |
|---|--------|---------|-------------|------------------|
| 1 | **Resources: copia “public” (499 MB) nel bundle** con disco al 95% | Molto alta | Molto alta | 10–25+ min (dipende da disco/cache) |
| 2 | **Disco 95%** → I/O lento per DerivedData, Resources, codesign | Molto alta | Molto alta | Amplifica tutte le fasi I/O; +5–15 min plausibili |
| 3 | **Install su device** di app ~500 MB (lettura bundle da disco lento + trasferimento) | Alta | Alta | 5–15 min |
| 4 | **Tempo misurato include launch + LLDB attach** (e eventuale crash/ritardi) | Media | Media | +2–10 min se LLDB crasha o è lento |
| 5 | **Compile asset catalogs (actool)** | Media | Certa | 3–7 min (già mitigato da INCLUDE_ALL=NO) |
| 6 | **[CP] Embed Pods Frameworks** eseguita ogni build (no output) | Bassa | Certa | Secondi |
| 7 | Regressione Xcode/macOS (es. Xcode 16) | Media | Possibile | Da verificare con versione |
| 8 | Modifiche recenti codice (i18n, daily missions, asset pipeline) | Bassa | Bassa | Nessun commit recente su project/Resources |

---

## 9. SAFE FIXABILITY

**Si può risolvere con interventi safe?** **Sì.**

**Aree che si possono toccare (senza violare i paletti):**

1. **Riduzione footprint `public`** — Già avviata in Phase Performance 1 (copia selettiva da `public` in `dist`). Riducendo il contenuto di `dist` e quindi di `ios/App/App/public` dopo `cap sync`, si riducono direttamente Resources e dimensione app → meno I/O e install più veloce. **Nessun cambio** a logica, URL, login, IAP, BUZZ, push, DB, i18n.
2. **Ambiente:** Liberare disco (obiettivo almeno 20–25% libero), pulire DerivedData (da fare dall’utente), riavviare Xcode/device. Nessuna modifica al repo.
3. **CocoaPods:** Valutare la rimozione di `disable_input_output_paths` nel Podfile (o sostituirla con un workaround che dichiari output) per rendere “[CP] Embed Pods Frameworks” incrementale. Rischio: il commento indica problemi di cache con Cordova plugins; andrebbe testato. Impatto atteso: secondi, non minuti.
4. **LLDB / scheme:** Disabilitare “Debug Executable” nello scheme per run senza debugger (workaround); oppure aggiornare Xcode, ri-pairing device, ri-trust certificato. Nessun cambio al codice app.

**Cosa non andrebbe toccato (come da paletti):**

- Login, logout, delete account, IAP, BUZZ, BUZZ MAP, push, DB, Supabase, Edge, routing, business logic, i18n, daily missions, UI, componenti React, asset runtime, configurazioni sicurezza. Nessun refactor non necessario.

---

## 10. FINAL VERDICT

**GO** per un prompt di fix chirurgico successivo.

**Riepilogo:**

- **Progetto:** La causa strutturale è l’inclusione in Resources della cartella **`public`** (~499 MB) e quindi un app bundle ~500 MB. Non è emersa una **regressione recente** nel codice o nel progetto Xcode (ultima modifica project.pbxproj/Podfile: 2026-02-22). Modifiche i18n / daily missions / asset pipeline non mostrano correlazione temporale con il salto a 30–40 min.
- **Ambiente locale:** **Disco al 95%** è il fattore ambiente più plausibile per un peggioramento improvviso. Rallenta tutte le fasi I/O (Resources, DerivedData, install).
- **Device / debug / LLDB:** Il messaggio “LLDB RPC server has crashed” riguarda **launch e attach**, non la compilazione. Se il tempo che misuri è “da Run a app avviata (o errore)”, una parte consistente può essere install + launch + LLDB (anche 2–10+ min). Il problema si presenta sia in Wi‑Fi che in hotspot 5G perché non è la rete il driver principale, ma I/O e stato di Xcode/device/LLDB.
- **Mix di fattori:** La situazione è spiegata da un **mix**: (1) dimensione strutturale di `public` e bundle, (2) disco quasi pieno che amplifica I/O, (3) tempo totale che include install e possibilmente launch/LLDB. Non c’è una singola “smoking gun” nel codice; la combinazione progetto (bundle grande) + ambiente (disco 95%) + eventuale LLDB spiega i 30–40 min.

**Nessuna modifica è stata applicata in questa analisi. Solo verità tecnica.**

---

**Fine del report.**
