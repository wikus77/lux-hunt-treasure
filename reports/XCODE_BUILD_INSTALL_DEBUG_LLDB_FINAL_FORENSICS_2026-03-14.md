# Forensics finale — Build vs Install vs Debug/LLDB — M1SSION iOS

**Project:** M1SSION™ — iOS wrapped app (Capacitor WKWebView)  
**Repo:** /Users/josephmule/lux-hunt-treasure  
**Data:** 2026-03-14  
**Vincolo:** READ-ONLY ASSOLUTO — nessuna modifica applicata.

---

## 1. EXECUTIVE SUMMARY

**Domanda centrale:** Perché 2–3 giorni fa il build era ~5–10 minuti e ora 30–40 minuti, a parità di bundle grande e disco già pieno?

**Causa più probabile (regressione reale):**

- **Non** un solo fattore “strutturale” (bundle, disco, wireless), ma un **cambio di comportamento** che fa sì che una o più fasi pesanti vengano eseguite **sempre** o **molto più lentamente**:
  1. **DerivedData invalidata o corrotta** → Xcode non considera più le Resources “up to date” → a ogni Run esegue una copia (quasi) completa della cartella `public` (499 MB) nella fase “Copy Bundle Resources”. Letteratura Apple/forum: su device, “Copy Bundle Resources” spesso non traccia bene i file invariati e rifà copie massive; se la cache build è stata invalidata (clean, aggiornamento Xcode, disco pieno), il problema si acuisce.
  2. **Tempo misurato = “Run” (build + install + launch + attach)** mentre prima si considerava solo “Build”. La documentazione Xcode indica che il **Report Navigator** mostra solo il tempo di **build** (compile + build phases), **non** install su device. Quindi: se i 1858–2222 s compaiono come “build” nel Report Navigator, il rallentamento è **in build** (es. Resources). Se invece il numero viene da “da Run a app aperta (o errore)”, allora include install + launch + attach (e possibili ritardi/crash LLDB).
  3. **LLDB RPC crash** come moltiplicatore: se dopo l’install Xcode tenta l’attach e LLDB crasha, si aggiungono attese, timeout o ritenti (minuti). Non spiega da solo il salto da 5–10 a 30–40 min, ma può spiegare **parte** del tempo e la sensazione di “blocco” in coda.

**Top 3 cause (priorità):**

1. **Copy Bundle Resources che rifà (quasi) sempre la copia di `public` (499 MB)** — per DerivedData/cache invalidata, o per comportamento Xcode su device (documentato: copie ripetute anche a file invariati). Coerente con “blocco” in zona 733–746/751.
2. **Tempo osservato include install + launch/attach** oltre al build — install wireless di ~500 MB + avvio con debugger (e LLDB crash) può aggiungere 5–15+ minuti.
3. **Disco (volume dati) al 95%** — amplifica ogni I/O (DerivedData, copia Resources, codesign). Da solo non spiega il salto in 2–3 giorni se il disco era già molto pieno; in combinazione con (1) e (2) spiega ordini di grandezza.

**Verdetto:** **GO** per un fix mirato. Piano minimo in ordine di priorità in §10; nessun intervento applicato in questa analisi.

---

## 2. TIMELINE REALE BUILD vs INSTALL vs DEBUG

**Cosa rappresenta il numero mostrato da Xcode (1858 s / 2119 s / 2222 s):**

- **Report Navigator (Build / Build With Timing Summary):** Secondo la documentazione Apple, il tempo nel Report Navigator si riferisce a **operazioni di build** (compilazione, build phases, link) e **non** include l’installazione sull’device. Quindi:
  - Se 1858–2222 s è il valore **nel Report Navigator** per una build → è **solo build** (~31–37 min). In quel caso il collo di bottiglia è **dentro** le build phases (es. Compile asset catalogs, **Copy Bundle Resources**, Embed Pods, link, codesign).
  - Se 1858–2222 s è il tempo **da click “Run” fino a “app aperta” (o messaggio di errore)** → include **build + install + launch + attach debugger**. In quel caso una parte consistente può essere: install su device (wireless) + primo launch + attach LLDB (+ eventuale crash e attesa/retry).

**Separazione delle fasi (stime, da verificare con Build With Timing Summary):**

| Fase | Cosa include | Tempo stimato | Evidenza | Gravità | Probabilità |
|------|--------------|---------------|----------|---------|-------------|
| **Build (solo)** | Check Pods, Sources, Frameworks, **Resources**, Embed Pods, link, codesign, Compile asset catalogs | 10–35 min (variabile) | Report Navigator; blocco 733–746/751 | Alta | Alta |
| **Copy Bundle Resources** | Copia `public` (499 MB) + altri resource nel bundle | 5–25 min (dipende da incremental vs full) | Fase Resources nel pbxproj; letteratura su “copy every time” su device | Molto alta | Molto alta |
| **Compile asset catalogs** | actool su Assets.xcassets | 3–7 min | Report precedente ~443 s; fix AppIcon già applicato | Media | Certa |
| **Codesign** | Firma del bundle | 1–5 min | Dipende da disco I/O | Media | Alta |
| **Install su device** | Trasferimento .app (~500 MB) su iPhone (Wi‑Fi/hotspot) | 5–15 min | Non in Report Navigator; parte di “Run” | Alta | Alta |
| **Launch + attach LLDB** | Avvio app + connessione debugger | 1–3 min (normale); +2–10 min se crash/retry | Messaggio “LLDB RPC server has crashed” | Media | Media |

**Dove si blocca davvero:** Il fatto che il contatore “si fermi” in zona **733/751 – 746/751** indica che una o poche **operazioni molto lente** avvengono **verso la fine** della build (o all’inizio dell’install, se il contatore include l’install). Le build phases del target App sono, in ordine: Check Pods → Sources → Frameworks → **Resources** → **Embed Pods**. Le ultime fasi “pesanti” sono quindi **Resources** (copia `public` + asset + storyboard) e, subito dopo, **Embed Pods**. È plausibile che gli step 733–746 corrispondano a:
- molti “sotto-step” della copia della cartella `public` (450 file), oppure
- Compile asset catalogs (se eseguito in parallelo e conteggiato in modo separato), oppure
- la transizione build → install (se Xcode conta anche l’install negli step).

**Conclusione:** Per una misura definitiva è necessario: **Product → Perform Action → Build With Timing Summary**, poi aprire la build nel Report Navigator e **Editor → Open Timeline** per vedere i secondi per “Copy Bundle Resources”, “Compile asset catalogs”, “Embed Pods Frameworks”, “Code sign”, ecc. Senza quel log non si può separare con certezza; la combinazione più plausibile è **Resources (Copy Bundle Resources) molto lenta** + eventuale **install + LLDB** nel tempo totale “Run”.

---

## 3. ROOT CAUSE RANKING

| # | Causa | Gravità | Probabilità | Impatto stimato |
|---|--------|---------|-------------|------------------|
| 1 | **Copy Bundle Resources** copia (quasi) sempre i 499 MB di `public` (cache invalidata o comportamento Xcode su device) | Molto alta | Molto alta | +15–25 min su build |
| 2 | **Tempo misurato = Run totale** (build + install + launch + attach) invece che solo build | Alta | Alta | +5–15 min (install + launch/attach) |
| 3 | **Disco (volume dati) ~95%** → I/O lento su DerivedData e copia Resources | Alta | Alta | Moltiplica l’impatto di (1) e (2) |
| 4 | **Install wireless** (~500 MB) più lenta di cavo + possibile instabilità pairing | Media | Alta | +3–10 min |
| 5 | **LLDB RPC crash** → attesa/retry dopo install | Media | Media | +2–10 min |
| 6 | **Compile asset catalogs (actool)** | Media | Certa | 3–7 min (già mitigato da fix AppIcon) |
| 7 | **[CP] Embed Pods Frameworks** ogni build (no output) | Bassa | Certa | Secondi |

---

## 4. REGRESSION ANALYSIS (PRIMA vs ADESSO)

**Fatto:** 2–3 giorni fa ~5–10 min; ora ~30–40 min. Bundle allora persino più grande, disco già molto pieno.

**Esclusione / conferma per ipotesi:**

- **Bundle/public come unica causa:** **Esclusa come unica.** Se fosse solo la dimensione, i tempi sarebbero stati alti anche 2–3 giorni fa. Resta che **come** Xcode usa quel bundle (copia piena vs incremental) può essere **cambiato** (es. cache invalidata).
- **Disco pieno come unica causa:** **Esclusa come unica.** Disco già molto pieno prima; un peggioramento da 90% a 95% può aggiungere lentezza ma non spiega da solo un salto 3–4×. **Confermata** come **amplificatore** insieme ad altre cause.
- **Wireless install come unica causa:** **Esclusa come unica.** Stesso problema via Wi‑Fi e via hotspot 5G; quindi la rete non è il solo fattore. **Confermata** come **causa secondaria** (install wireless più lenta e meno stabile del cavo).
- **LLDB/debugger come causa chiave:** **Non unica, ma possibile moltiplicatore.** Il crash “LLDB RPC server has crashed” riguarda launch/attach; può aggiungere minuti (timeout, retry). Non spiega da solo 20–30 min in più; può spiegare 5–15 min se il tempo include “Run fino a app avviata (o errore)”.
- **Regressione Xcode locale:** **Plausibile.** Aggiornamento Xcode o cambio stato (preferenze, cache) può alterare il comportamento di “Copy Bundle Resources” o della cache build. **Non verificabile** da repo; da controllare versione Xcode e eventuale aggiornamento negli ultimi 2–3 giorni.
- **Regressione pairing device:** **Possibile.** Re-pairing, trust, “Preparing device for debugging” possono cambiare tempi di install/attach. Coerente con “nessun cambio nel repo”; da verificare se il device è stato riaccoppiato o se è cambiato lo stato di trust.
- **Regressione scheme / Debug Executable:** **Improbabile.** Lo scheme in repo (`App.xcscheme`) ha `selectedLauncherIdentifier = Xcode.DebuggerFoundation.Launcher.LLDB`; non risulta modifica recente. Se prima si usava “Run” con debugger e ora idem, lo scheme da solo non spiega il salto.
- **Regressione DerivedData/cache:** **Molto plausibile.** Se DerivedData è stata invalidata (clean build, Xcode update, disco pieno, crash) o corrotta, Xcode può considerare “Copy Bundle Resources” non up-to-date e rifare copie massive. **Spiega** “stesso progetto, stesso disco, ma ora 3–4× più lento”.
- **Regressione introdotta dalla nuova pipeline asset (Phase Performance 1):** **Improbabile.** La pipeline riduce cosa va in `dist`/`public`; non cambia il modo in cui Xcode copia le Resources. Se dopo Phase 1 `ios/App/App/public` è ancora ~499 MB, il comportamento di Xcode su quella cartella non dipende dalla pipeline. **Esclusa** come causa della regressione temporale.
- **Falso positivo: tempo misurato male (include install + launch):** **Da confermare.** Se prima si guardava solo “build” nel Report Navigator e ora si guarda “da Run a app aperta”, la differenza è proprio install + launch + attach. **Verifica:** confrontare (a) tempo in Report Navigator per “Build” con (b) tempo da Run a “Build Succeeded” (prima che parta install) e (c) tempo da Run a “app aperta”.

**Verdetto regressione:** La spiegazione più coerente con “stesso bundle/disco, ma molto più lento in 2–3 giorni” è una **regressione di ambiente/comportamento**: (1) **DerivedData/cache invalidata o corrotta** → Copy Bundle Resources non più incrementale; (2) **misura** che ora include install + launch/attach; (3) eventuale **LLDB crash** che aggiunge attesa. **Nessuna modifica nel repo** spiega il salto; le modifiche nel repo (iOS, Podfile, scheme) sono stabili da settimane.

---

## 5. WIRELESS / DEVICE FINDINGS

**Uso:** iPhone su stessa rete Wi‑Fi o hotspot 5G (non cavo).

**Può la lentezza dipendere in modo importante dal wireless?**

- **Install:** Sì, in parte. Trasferire ~500 MB in wireless è più lento e più soggetto a instabilità che via cavo USB. Stima: **causa secondaria** (+3–10 min possibili).
- **Pairing instabile:** Può peggiorare install e “Preparing device for debugging”. Non verificabile da repo; **possibile** causa secondaria.
- **LLDB attach via wireless:** L’attach del debugger su device wireless può essere più lento e più soggetto a timeout/crash. **Causa secondaria** plausibile.
- **Xcode che tenta attach/launch in debug su rete:** Sì: con “Run” lo fa sempre. Il tempo “Run” include build + install + launch + attach. Su wireless, install e attach sono i passi più sensibili.

**Nel caso concreto:**

- **Wireless non è la causa primaria** (stesso problema su Wi‑Fi e hotspot 5G; la causa primaria è probabilmente in build o in cache).
- **Wireless è una causa secondaria** per la parte install + eventuale attach (più lento e meno stabile del cavo).
- **Irrilevante** solo per la fase di compilazione pura (Sources, Frameworks); **rilevante** per install e debug.

---

## 6. LLDB FINDINGS

**Significato pratico di “The LLDB RPC server has crashed”:**

- Il processo LLDB (server RPC che fa da ponte tra Xcode e l’app sul device) è terminato in modo anomalo. Succede in fase di **lancio dell’app e attach del debugger**, non durante compilazione o Copy Bundle Resources.
- In pratica: dopo “Build Succeeded” e install sul device, Xcode avvia l’app e tenta di attaccare LLDB; se l’attach è lento (es. caricamento simboli, device support, wireless), Xcode può considerare LLDB “bloccato” e terminarlo → messaggio di crash. L’utente può restare in attesa di timeout o ritenti.

**L’errore:**

- **Rallenta solo il launch:** Sì: non rallenta compile né Copy Bundle Resources.
- **Rallenta anche il “run totale”:** Sì: se il tempo che misuri è “da Run a app aperta (o errore)”, la fase post-install (launch + attach) e un eventuale crash/retry **aumentano** il tempo totale.
- **Può spiegare minuti e minuti:** Sì: attesa di timeout (es. 2–5 min), eventuale retry, o attesa prima del messaggio di crash. **Stima:** 2–10 min aggiuntivi possibili.
- **Retry/timeout nascosti:** Possibili: Xcode può ritentare l’attach o attendere prima di mostrare il crash.

**Problema principale oggi: build, install o debugger attach?**

- Se i 1858–2222 s sono **nel Report Navigator** → il problema principale è **build** (e dentro build, molto probabilmente Copy Bundle Resources o actool).
- Se i 1858–2222 s sono **da Run a fine** → il problema è un **mix**: build + install + launch/attach; senza timeline dettagliata non si può dire se la maggior parte è build o install o attach.

**Dove trovare i log per una fase successiva:**

- **Crash LLDB:** `~/Library/Logs/DiagnosticReports/` — file con prefisso `lldb-rpc-server` (es. `lldb-rpc-server-2026-03-14-….crash`). Aprendo il crash si vedono stack trace e possibile causa (es. timeout, caricamento simboli).
- **Device support / simboli:** `~/Library/Developer/Xcode/iOS DeviceSupport/` — una cartella per versione iOS del device. Se mancante o corrotta, il primo attach può essere lentissimo e portare a crash LLDB.
- **Build log dettagliato:** Report Navigator → ultima build → **Editor → Open Timeline** per i tempi per fase.

---

## 7. XCODE BUILD PHASE FINDINGS

**Ordine nel target App:**  
1. [CP] Check Pods Manifest.lock  
2. Sources  
3. Frameworks  
4. **Resources** (LaunchScreen, **public**, Assets.xcassets, capacitor.config.json, Main.storyboard, config.xml)  
5. **[CP] Embed Pods Frameworks**

**Per ciascuna:**

- **[CP] Copy XCFrameworks:** **Falsa pista.** Nel `project.pbxproj` **non** esiste una build phase con questo nome. Esiste solo **[CP] Embed Pods Frameworks**. Eventuali warning “Copy XCFrameworks will be run during every build” possono provenire da template/messaggi CocoaPods; nel progetto attuale non c’è tale phase.
- **[CP] Embed Pods Frameworks:** **Pesa poco.** Eseguita ogni build (inputPaths/outputPaths vuoti per `disable_input_output_paths => true` nel Podfile). Pods ~3,5 MB → impatto nell’ordine di **secondi**. **Non** spiega 20–30 min. Coerente con report già raccolti.
- **Resources (Copy Bundle Resources):** **Pesa molto.** Include la cartella **`public`** (499 MB, 450 file). Su device, Xcode è noto per rifare copie anche quando i file non sono cambiati. Se la cache è invalidata, la copia può essere (quasi) totale. **Plausibile** che sia la fase che “esplode” i tempi e che corrisponda al blocco in zona 733–746/751. **Coerente** con le osservazioni.
- **Compile asset catalogs:** **Pesa in modo medio.** Report precedente ~443 s; con fix AppIcon (INCLUDE_ALL=NO, M1.png rimosso) resta nell’ordine di 3–7 min. **Non** la causa principale del salto; **coerente** con i report.
- **Codesign:** Dipende da I/O (bundle grande su disco lento). **Stima:** 1–5 min. Possibile contributo, non il driver principale.
- **Install:** Non è una “build phase” ma la fase successiva al build. Trasferimento .app su device. **Pesa** (5–15 min su wireless con bundle ~500 MB). Coerente con “Run” lento.

**Perché il build sembra “fermarsi” in alto (733/751, 746/751):**

- È coerente con **uno o pochi step molto lenti** verso la fine della build (es. copia di centinaia di file in Resources, o actool, o link/sign), oppure con la **transizione build → install** se il contatore include anche l’install. Non è possibile stabilire senza il build log con numeri di step per fase; l’interpretazione “step finale molto pesante” o “install/attach” resta plausibile.

---

## 8. ENVIRONMENT FINDINGS

**Verifica in sola lettura (nessun cleanup):**

- **Spazio disco:** Sul volume dati (`/System/Volumes/Data`) in una rilevazione precedente: **~95%** usato, ~106 GB liberi. Sul volume root (`/`) in questa sessione: ~17% usato. Il progetto e DerivedData tipicamente risiedono sul volume dati → **disco dati molto pieno** è confermato come fattore di rischio.
- **DerivedData / Xcode:** Il path `~/Library/Developer/Xcode/DerivedData` non è stato ispezionato (fuori repo; nessun cleanup). Se DerivedData è cresciuta molto o è corrotta, build incrementali possono essere invalidate → Copy Bundle Resources rieseguita in toto. **Segnale da verificare:** dimensione e data di ultima modifica di `DerivedData` e della cartella del progetto App.
- **Simulator runtimes:** Non verificati. Se ci sono molti simulator runtimes, possono occupare spazio e rallentare il sistema; non spiegano direttamente build su **device**.
- **Processi (xcodebuild, actool, CoreDevice, debugserver, llbd, swift-frontend):** Non è stato eseguito nessun listing o kill. In una fase successiva si potrebbero controllare (es. Activity Monitor) per vedere se qualcuno resta attivo a lungo durante il “blocco”.
- **Xcode/terminale aperti da giorni:** Non verificabile da repo. **Impatto plausibile:** stato interno di Xcode (cache, indici) può degradare; riavvio può aiutare. Non applicato nessun riavvio.

**Segnali concreti di ambiente degradato:**

- **Confermati:** Disco (volume dati) molto pieno.
- **Da verificare dall’utente:** Dimensione/età DerivedData, eventuale Clean Build Folder recente, aggiornamento Xcode/iOS negli ultimi 2–3 giorni, crash log LLDB in `~/Library/Logs/DiagnosticReports/`.

---

## 9. VERDETTO FINALE

**GO** per un fix mirato.

La situazione è interpretabile come: **regressione di ambiente/comportamento** (cache build invalidata o comportamento “copy every time” su device) + **misura che può includere install e launch/attach** + **amplificazione da disco pieno e da wireless**. Nessuna modifica al codice o al progetto Xcode nel repo spiega da sola il salto; interventi safe (verifica misura, riduzione footprint `public`, liberare disco, gestione LLDB/DerivedData) sono appropriati per la fase successiva.

---

## 10. PIANO FIX MINIMO (SOLO PIANO, NON APPLICATO)

**Step 1 — Chiarire dove si perde il tempo (misura)**  
- Eseguire **Product → Perform Action → Build With Timing Summary**.  
- In Report Navigator aprire la build e **Editor → Open Timeline**.  
- Annotare i secondi per: **Copy Bundle Resources**, **Compile asset catalogs**, **Embed Pods Frameworks**, **Code sign**, e (se presente) **Install** o fasi post-build.  
- Confrontare: (a) tempo “Build” nel Report Navigator vs (b) tempo da click “Run” a “Build Succeeded” vs (c) tempo da “Run” a “app aperta (o errore)”.  
- **Obiettivo:** capire se i 1858–2222 s sono solo build o build+install+launch; e quale fase domina.

**Step 2 — Se il collo di bottiglia è Copy Bundle Resources / cache**  
- Verificare dimensione e stato di `~/Library/Developer/Xcode/DerivedData` (e della cartella del target App).  
- Valutare (solo dopo backup/copia) una **pulizia mirata** della DerivedData del progetto (rimozione cartella del target App in DerivedData) e una build successiva “da zero” per quella target, **senza** Clean Build Folder globale se non strettamente necessario.  
- **Obiettivo:** ripristinare cache incrementale e vedere se “Copy Bundle Resources” torna a essere veloce quando i file non cambiano.

**Step 3 — Riduzione footprint `public` (già avviata in Phase Performance 1)**  
- Assicurarsi che la pipeline safe (copia selettiva da `public`) sia attiva e che dopo `npx cap sync ios` la dimensione di `ios/App/App/public` sia ridotta il più possibile **senza** toccare runtime.  
- **Obiettivo:** meno dati da copiare in Resources e da installare su device.

**Step 4 — Liberare disco (volume dati)**  
- Portare l’uso del volume dati sotto ~85% (almeno 150–200 GB liberi se possibile).  
- **Obiettivo:** ridurre I/O lento e stress su DerivedData/cache.

**Step 5 — LLDB / launch (se il tempo include “Run” fino a app avviata)**  
- Eseguire una prova **senza** debugger: nello scheme, **Run → Options** (o Edit Scheme → Run) e **disabilitare “Debug executable”** (o equivalente). Poi **Run** e misurare: tempo da Run a “app aperta”.  
- Se il tempo crolla, una parte consistente è **install + launch + attach** (e LLDB).  
- Controllare `~/Library/Logs/DiagnosticReports/` per crash `lldb-rpc-server` e, se necessario, `~/Library/Developer/Xcode/iOS DeviceSupport/` (ricreare supporto device se corrotto).  
- **Obiettivo:** quantificare il contributo di install/LLDB e, se utile, usare run senza debugger per sviluppo veloce.

**Step 6 — Install su device: cavo vs wireless**  
- Una prova di **Run** con iPhone collegato **via cavo USB** (stesso progetto, stesso scheme).  
- Confrontare tempo da Run a app aperta con la stessa operazione via Wi‑Fi/hotspot.  
- **Obiettivo:** quantificare il contributo del wireless (install + eventuale attach).

**Ordine consigliato:** 1 → 2 (se la timeline mostra Resources lenta) → 4 → 3 (in parallelo o dopo) → 5 e 6 secondo necessità.

---

## SINTESI LEGGIBILE E PROSSIME MOSSE

**Sintesi:** Il salto da 5–10 min a 30–40 min non è spiegabile solo da “bundle grande” e “disco pieno”, perché 2–3 giorni fa quelle condizioni c’erano già. La spiegazione più plausibile è un **cambio di comportamento** (cache build/DerivedData invalidata → Copy Bundle Resources che rifà copie massive) e/o il fatto che **il tempo che misuri ora include install + launch + attach** (e possibili ritardi/crash LLDB). Wireless e disco pieno **amplificano** ma non sono la sola causa. Nel repo **non** c’è nessuna modifica recente a Xcode/Podfile/scheme; la regressione è lato **ambiente o misura**.

**Causa più probabile:** Copy Bundle Resources che non è più “incrementale” (per DerivedData/cache invalidata o per comportamento Xcode su device) + tempo “Run” che include install e launch/attach (e LLDB).

**Cosa NON è la causa (da solo):** bundle grande come unica causa; disco pieno come unica causa; wireless come unica causa; modifiche al codice o alla pipeline asset; scheme o Podfile modificati di recente.

**Problema risolvibile in modo safe?** Sì: con misura (timeline), eventuale pulizia mirata DerivedData, liberare disco, riduzione footprint `public`, e gestione LLDB/scheme (es. run senza debugger per test).

**Ordine esatto delle prossime mosse:**  
1) Eseguire Build With Timing Summary e aprire la Timeline; annotare secondi per Copy Bundle Resources, actool, Embed Pods, Code sign. 2) Se Resources domina: verificare DerivedData e considerare pulizia mirata della cartella del target. 3) Liberare disco (volume dati sotto ~85%). 4) Mantenere/estendere riduzione safe di `public`. 5) Se il tempo include launch: una prova Run con “Debug executable” disabilitato e controllo crash log LLDB; una prova Run con device via cavo per confronto con wireless.

---

**Fine del report. Nessuna modifica è stata applicata.**
