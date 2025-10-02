// © 2025 Joseph MULÉ – M1SSION™ – NORAH AI KB Seed Documents
// Base knowledge for immediate RAG responses

export const SEED_DOCUMENTS = [
  {
    slug: 'mission-buzz',
    title: 'BUZZ — definizione e regole base',
    body: `BUZZ è l'azione di scansione GPS attiva che genera un raggio di ricerca per localizzare premi.

Il sistema BUZZ:
- Calcola un raggio di ricerca centrato sulla tua posizione GPS
- Il costo e il raggio sono dinamici in base al tier dell'utente
- Può essere lanciato anche fuori dalla mappa principale
- Fornisce feedback immediato sulla distanza dal premio

Differenza BUZZ vs BUZZ Map:
- BUZZ = azione singola di localizzazione GPS
- BUZZ Map = visualizzazione interattiva del raggio sulla mappa
- Il BUZZ genera il raggio, la BUZZ Map te lo mostra visivamente

Il primo BUZZ giornaliero ha condizioni speciali documentate nel regolamento ufficiale.

Costi tipici (variano per tier):
- Free: limitato
- Silver: da 1.99€
- Gold/Black/Titanium: prezzi crescenti con vantaggi`,
    tags: ['buzz', 'regole', 'onboarding', 'gps']
  },
  {
    slug: 'mission-buzz-map',
    title: 'BUZZ Map — visualizzazione interattiva',
    body: `BUZZ Map è l'interfaccia visiva che mostra il raggio di ricerca sulla mappa interattiva.

Come funziona:
- Apri la mappa M1SSION
- Vedi overlay con la tua posizione
- Il raggio BUZZ appare visivamente sulla mappa
- Puoi lanciare BUZZ direttamente dalla mappa

Differenze chiave con BUZZ normale:
- BUZZ = azione singola di scansione GPS
- BUZZ Map = azione con feedback visivo immediato
- Dalla BUZZ Map vedi marker, zone e overlay

Primo BUZZ Map:
- Raggio iniziale: 500 km (può variare)
- Prezzo: 4.99€ (verificare policy correnti)
- Serve per orientamento iniziale

La BUZZ Map è essenziale per:
- Visualizzare zone di ricerca
- Pianificare strategie di esplorazione
- Vedere tutti i premi disponibili nella zona`,
    tags: ['buzz-map', 'mappa', 'onboarding', 'visualizzazione']
  },
  {
    slug: 'mission-final-shot',
    title: 'Final Shot — tentativo finale',
    body: `Final Shot è il tentativo finale per individuare la posizione esatta del premio e vincerlo.

Regole principali:
- Massimo 2 tentativi al giorno per missione
- Disponibile solo dopo aver raccolto abbastanza indizi
- Sistema anti-frode: verifica posizione GPS e finestra temporale
- Richiede conferma prima di essere eseguito

Quando usare il Final Shot:
- Hai raccolto almeno 5-6 indizi
- Sei sicuro della posizione del premio
- Hai verificato tutti i pattern e correlazioni

Strategia consigliata:
1. Raccogli tutti gli indizi disponibili
2. Analizza pattern e correlazioni
3. Usa BUZZ per restringere l'area
4. Quando sei sicuro: Final Shot

Limiti per tier:
- I tier superiori hanno più tentativi
- Verifica i tuoi limiti nel profilo
- Pianifica con attenzione: ogni tentativo conta

Il Final Shot è la fase decisiva: preparati bene prima di provare!`,
    tags: ['final-shot', 'regole', 'strategia']
  },
  {
    slug: 'mission-tiers',
    title: 'Tiers M1SSION — vantaggi e limiti',
    body: `M1SSION offre diversi tier di abbonamento con vantaggi progressivi.

**FREE (Gratuito)**
- Accesso base alle missioni
- BUZZ limitati al giorno
- Nessun accesso anticipato
- Supporto community

**SILVER**
- BUZZ giornalieri aumentati
- Early access 2h prima
- Supporto prioritario
- Badge esclusivo

**GOLD**
- BUZZ illimitati giornalieri
- Early access 24h prima
- Raggio BUZZ ottimizzato
- Supporto VIP
- Premi esclusivi

**BLACK**
- Tutti i vantaggi Gold
- Early access 48h prima
- BUZZ con raggio esteso
- Eventi privati
- Coaching personalizzato

**TITANIUM** (Top tier)
- Accesso anticipato 72h
- BUZZ premium con AI
- Concierge service 24/7
- Premi luxury esclusivi
- Inviti a eventi VIP

Ogni tier rispetta limiti specifici:
- Numero BUZZ giornalieri
- Costo per BUZZ
- Raggio di ricerca
- Final Shot disponibili

Verifica sempre il tuo tier corrente nel profilo per conoscere i tuoi limiti.`,
    tags: ['tiers', 'pricing', 'abbonamenti', 'limiti']
  },
  {
    slug: 'mission-differenza-buzz-vs-map',
    title: 'Differenza BUZZ vs BUZZ Map',
    body: `Molti utenti chiedono: qual è la differenza tra BUZZ e BUZZ Map?

**BUZZ (azione GPS)**
- Sistema di localizzazione tramite GPS
- Genera un raggio di ricerca centrato su di te
- Fornisce distanza approssimativa dal premio
- Funzione singola: "Quanto disto dal premio?"

**BUZZ Map (visualizzazione)**
- Interfaccia visiva su mappa interattiva
- MOSTRA il raggio BUZZ visivamente
- Permette di vedere marker, zone e overlay
- Funzione visiva: "Dove devo cercare?"

**Come lavorano insieme:**
1. Usi BUZZ per calcolare il raggio
2. Apri BUZZ Map per vedere il raggio sulla mappa
3. Pianifichi la strategia visivamente
4. Usi nuovi BUZZ per affinare la ricerca

**In sintesi:**
- BUZZ = calcola la distanza
- BUZZ Map = mostra la distanza sulla mappa
- Usali insieme per massimizzare le possibilità di vittoria

Strategia consigliata:
- Prima BUZZ per orientarti
- Poi BUZZ Map per visualizzare
- Alterna BUZZ e consultazione mappa
- Affina progressivamente l'area di ricerca`,
    tags: ['buzz', 'buzz-map', 'differenze', 'onboarding']
  }
];
