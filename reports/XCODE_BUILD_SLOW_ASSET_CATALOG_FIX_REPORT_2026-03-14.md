# Verifica + fix mirato Xcode build lenta — Report

**Project:** M1SSION™ — iOS wrapped app (Capacitor WKWebView)  
**Data:** 2026-03-14  
**Scope:** Asset catalog / AppIcon / build phases — ultra safe, in scope only  

---

## 1. EXECUTIVE SUMMARY

- **Causa reale del rallentamento:** Il collo di bottiglia principale segnalato (“Compile asset catalogs 442.9 seconds”) è coerente con un asset catalog pesante e mal configurato. Verifica forense ha confermato: (1) **unassigned child** nel set AppIcon (`M1.png` presente nella cartella ma non referenziato in `Contents.json`), con warning “The app icon set \"AppIcon\" has an unassigned child”; (2) **ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = YES**, che spinge actool a considerare tutti i file nella cartella AppIcon; (3) presenza di molte icone legacy (iPhone/iPad/Mac/Watch) e immaginiet duplicati (1024, 512, 258).
- **Fix applicato:** (1) Rimozione del file orfano `AppIcon.appiconset/M1.png`. (2) Impostazione `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = NO` in Debug e Release nel `project.pbxproj`.
- **Rischio:** Basso. Nessuna modifica a logica, DB, Edge, i18n, UI app. Solo un file PNG orfano eliminato e una build setting documentata da Apple.
- **Miglioramento atteso:** Eliminazione del warning “unassigned child”; riduzione del lavoro di actool (meno file da considerare, comportamento “solo slot definiti”). Il tempo esatto “Compile asset catalogs” va misurato in locale (vedi §6).
- **Build eseguita:** Tentata da CLI in ambiente controllato; fallita per indisponibilità del simulatore/CoreSimulatorService (ambiente sandbox). **La validazione va eseguita in Xcode sul tuo Mac.**
- **Cap sync:** **Non eseguito.** Non necessario: le modifiche sono solo in `ios/App/App/Assets.xcassets` e `ios/App/App.xcodeproj/project.pbxproj`; nessun cambio a `dist/` o a asset web. `npx cap sync ios` non influenza l’asset catalog nativo.

---

## 2. ROOT CAUSE ANALYSIS

### Cosa rallentava davvero
- **Compile asset catalogs (actool):** È il passo che occupa ~443 s nei tuoi log. actool compila l’intero `Assets.xcassets`, inclusi tutti gli appiconset e imageset. Più file e più slot (anche non usati) aumentano lavoro e possibili riconpilazioni.

### Peso dell’asset catalog
- **Alto.** L’AppIcon contiene 35+ PNG (da 16px a 1024px) per iPhone, iPad, Mac, Watch e ios-marketing. In più: un file **M1.png** nella cartella AppIcon non referenziato in `Contents.json` → “unassigned child”. Con `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = YES`, Xcode include tutti i file della cartella; l’orfano viene comunque considerato e può contribuire a warning e lavoro extra.

### Peso dei warning AppIcon
- **Unassigned child:** Diretto: un file in più da gestire e warning costante. La sua rimozione è il fix più ovvio e sicuro.
- **Icone legacy (57, 50, 76, 72, ecc.):** Sono ancora definite in `Contents.json` e servono per idiom/size obsoleti (es. iPad 1x, Watch). Non sono “unassigned”; rimuoverle richiederebbe riscrivere il set per lasciare solo gli slot moderni (es. solo iPhone + ios-marketing). Utile per una riduzione ulteriore del tempo, ma più invasivo; non incluso in questo fix minimo.

### Peso dei build phases CocoaPods
- **Secondario.** `[CP] Copy XCFrameworks` e `[CP] Embed Pods Frameworks` sono normali per progetti con CocoaPods e girano a ogni build. Non sono la causa dei 442 s di “Compile asset catalogs”. **Non toccati** in questo intervento.

### Classifica cause (impatto)
1. **Principale:** Asset catalog / AppIcon (unassigned child + `INCLUDE_ALL_APPICON_ASSETS = YES`).
2. **Secondario:** Numero elevato di slot/icone legacy (candidato per un futuro slim-down).
3. **Marginale per il tempo citato:** Build phases CocoaPods; warning di plist/file type.

---

## 3. FORENSICS SU APPICON / ASSET CATALOG

### Stato trovato
- **Percorso:** `ios/App/App/Assets.xcassets`
- **AppIcon.appiconset:** `Contents.json` con 43 slot definiti (iphone, ipad, mac, watch, watch-marketing, ios-marketing). Tutti gli slot referenziano file `.png` con nome esplicito (es. `40.png`, `60.png`, …, `1024.png`).
- **File nella cartella AppIcon.appiconset:** Oltre ai PNG referenziati, era presente **M1.png**, non citato in nessuna entry di `Contents.json` → **unassigned child**.
- **Altri asset:** Cartella `_orphan_assets` (M1.png e backup); imageset separati `1024.imageset`, `512.imageset`, `258.imageset` (con slot 2x/3x non assegnati). Il progetto referenzia solo `Assets.xcassets` nel suo complesso; non risultano riferimenti diretti agli imageset 1024/512/258 nel pbxproj.

### Problemi trovati
1. **M1.png in AppIcon.appiconset:** File orfano → warning “The app icon set \"AppIcon\" has an unassigned child”.
2. **ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = YES** (Debug e Release): Comportamento “include all” per gli app icon; può far considerare anche file non mappati nello slot.
3. **Molte dimensioni legacy** in `Contents.json` (57, 50, 76, 72, ecc.) e idiom mac/watch: aumentano il numero di asset che actool deve processare.

### File/slot coinvolti
- **Rimossi/toccati:** `ios/App/App/Assets.xcassets/AppIcon.appiconset/M1.png` (eliminato); `ios/App/App.xcodeproj/project.pbxproj` (2 occorrenze di `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS` impostate a `NO`).

### Warning spiegati
- **“The app icon set \"AppIcon\" has an unassigned child”:** Xcode rileva un file nella cartella dell’app icon set che non è referenziato in `Contents.json`. In questo caso era **M1.png**. Rimuovendo il file, il warning sparisce.
- **Icone legacy:** Le size 57x57, 50x50, 76x76, 72x72, ecc. sono ancora valide in `Contents.json` per idiom/size storici; Xcode può mostrare warning di deprecation/legacy. Non sono “unassigned”; non sono state modificate in questo fix.

---

## 4. FIX PLAN

### Fix scelto
1. **Eliminare** `ios/App/App/Assets.xcassets/AppIcon.appiconset/M1.png`.
2. **Impostare** `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = NO` per le configurazioni Debug e Release in `project.pbxproj`.

### Perché è il più sicuro
- **M1.png:** Non è referenziato in `Contents.json`, quindi non è usato per nessuno slot. La sua rimozione non cambia l’icona dell’app e elimina il warning.
- **INCLUDE_ALL_APPICON_ASSETS = NO:** È una build setting ufficiale; con NO, il compilatore usa solo le immagini definite nel catalog per gli slot dell’app icon, allineato al contenuto di `Contents.json`. Riduce ambiguità e lavoro su file “extra”.

### Cosa non è stato toccato
- Build phases CocoaPods (`[CP] Copy XCFrameworks`, `[CP] Embed Pods Frameworks`).
- Slot e dimensioni in `Contents.json` (incluse le legacy).
- Imageset 1024 / 512 / 258 e cartella `_orphan_assets`.
- Qualsiasi codice, DB, Edge, i18n, UI, routing.

---

## 5. FIX APPLICATO

### File toccati
| File | Modifica |
|------|----------|
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/M1.png` | Eliminato (unassigned child). |
| `ios/App/App.xcodeproj/project.pbxproj` | `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = YES` → `NO` (2 occorrenze: Debug e Release). |

### Modifiche esatte
- **M1.png:** File rimosso dalla filesystem.
- **project.pbxproj:** Sostituzione globale di `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = YES` con `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = NO`.

### Rollback
- **Semplice.** Per rollback: (1) ripristinare `M1.png` nella cartella AppIcon.appiconset (se ne hai una copia, es. da git o da `_orphan_assets`); (2) nel `project.pbxproj` rimettere `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = YES` per Debug e Release.

---

## 6. VALIDAZIONE

### Build di verifica
- **Eseguita in ambiente automatizzato:** Sì, tramite `xcodebuild` (clean build, scheme App, iphonesimulator).
- **Esito:** **Fallita** per indisponibilità del simulatore e di CoreSimulatorService nell’ambiente di esecuzione (sandbox), non per errori del progetto o del fix. Messaggio: “Unable to find a device matching the provided destination specifier” / “no available devices matched the request”.

### Tempi / differenze osservate
- **Nessun confronto prima/dopo possibile** in questo ambiente. Per avere un confronto reale:
  1. Apri il progetto in Xcode sul tuo Mac.
  2. Esegui una build (Product → Build) e annota il tempo di “Compile asset catalogs” (Report navigator → ultima build → espandi i step).
  3. Dopo il fix (già applicato), ripeti la build e confronta di nuovo “Compile asset catalogs”.

### Cap sync ios
- **Non eseguito.** Non necessario: le modifiche riguardano solo asset catalog e build setting nativi iOS; non ci sono cambi a `dist/` o al contenuto web. `npx cap sync ios` non influenza questi aspetti. Puoi eseguirlo se fai anche modifiche al progetto web e vuoi riallineare `ios/App/App/public`.

---

## 7. FINAL VERDICT

**PARTIAL IMPROVEMENT (validazione da completare in locale)**

- **Motivazione:** La causa principale (unassigned child + `INCLUDE_ALL_APPICON_ASSETS = YES`) è stata affrontata con un fix minimo e reversibile. Il warning “unassigned child” dovrebbe scomparire e il comportamento di actool essere più prevedibile e potenzialmente più veloce. La validazione quantitativa (tempo “Compile asset catalogs”) non è stata possibile nell’ambiente di test; va completata con una build in Xcode sul tuo Mac. Nessuna modifica fuori scope; nessun tocco a flussi frozen, CocoaPods build phases o immaginiet aggiuntivi.

**Raccomandazione:** Esegui una build in Xcode (Product → Build), verifica l’assenza del warning “AppIcon has an unassigned child” e, se possibile, confronta il tempo di “Compile asset catalogs” con una build precedente. Se i tempi restassero alti, il passo successivo sarebbe un ridimensionamento mirato del set AppIcon (solo slot necessari per iPhone + eventuale iPad, rimozione di mac/watch/legacy) in un secondo intervento.
