
import { FileText, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const RegulationSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const regulationContent = `
# 📜 REGOLAMENTO UFFICIALE — M1SSION™

Benvenuto in **M1SSION™**, un'esperienza di gioco reale e immersiva che fonde tecnologia, strategia e intuito per condurti alla conquista di premi straordinari.

## 🎯 CAPITOLO 1: NATURA DEL GIOCO

**M1SSION™** è un'esperienza di caccia al tesoro digitale che combina elementi di:
- Geolocalizzazione GPS
- Risoluzione di enigmi
- Strategia competitiva
- Meccaniche di gioco innovative

### 1.1 Obiettivo Primario
L'obiettivo è localizzare e conquistare **aree di interesse** attraverso l'uso strategico del sistema **BUZZ**, risolvendo indizi e completando missioni per accumulare punti e vincere premi reali.

### 1.2 Meccanica di Base
Il gioco si basa su:
- **BUZZ**: Sistema di attivazione aree
- **Mappe interattive**: Navigazione GPS del territorio
- **Indizi progressivi**: Rivelazione graduale delle informazioni
- **Competizione**: Classifiche e sfide tra giocatori

## 🗺️ CAPITOLO 2: SISTEMA BUZZ

### 2.1 Definizione BUZZ
Il **BUZZ** è l'azione fondamentale che permette di:
- Attivare nuove aree di gioco
- Rivelare indizi nascosti
- Avanzare nelle missioni
- Sbloccare contenuti premium

### 2.2 Tipologie di BUZZ
- **BUZZ Standard**: Attivazione base delle aree
- **BUZZ Mappa**: Generazione di zone di interesse specifiche
- **BUZZ Premium**: Accesso a contenuti esclusivi (solo abbonati)

### 2.3 Limitazioni BUZZ
- Limite giornaliero: 3 BUZZ Standard per utenti gratuiti
- Limite settimanale: 10 BUZZ Mappa per utenti gratuiti
- Utenti Premium: BUZZ illimitati
- Cooldown: 30 minuti tra BUZZ consecutivi

## 🏆 CAPITOLO 3: SISTEMA PREMI

### 3.1 Categorie di Premi
**M1SSION™** offre diverse tipologie di premi:

#### 3.1.1 Premi Digitali
- Crediti di gioco
- Potenziamenti account
- Accessi premium temporanei
- Contenuti esclusivi

#### 3.1.2 Premi Fisici
- Automobili di lusso
- Dispositivi tecnologici
- Viaggi esclusivi
- Prodotti di marca

#### 3.1.3 Premi Esperienza
- Eventi VIP
- Incontri esclusivi
- Corsi di formazione
- Accessi privilegiati

### 3.2 Criteri di Assegnazione
I premi vengono assegnati secondo:
- **Completamento missioni**: Risoluzione corretta degli indizi
- **Velocità di esecuzione**: Tempo impiegato per completare le sfide
- **Precisione GPS**: Accuratezza nel raggiungimento delle coordinate
- **Partecipazione eventi**: Presenza negli eventi speciali

### 3.3 Validazione Premi
Tutti i premi sono soggetti a:
- Verifica identità del vincitore
- Controllo compliance regolamentare
- Validazione GPS delle azioni di gioco
- Conferma completamento requisiti

## 📱 CAPITOLO 4: REQUISITI TECNICI

### 4.1 Dispositivi Supportati
- **Smartphone**: iOS 14+ / Android 8+
- **Connessione**: Internet stabile richiesta
- **GPS**: Localizzazione ad alta precisione obbligatoria
- **Browser**: Chrome, Safari, Firefox (versioni recenti)

### 4.2 Permessi Richiesti
Per il corretto funzionamento dell'app è necessario autorizzare:
- Accesso alla posizione GPS
- Notifiche push
- Accesso alla fotocamera (per alcune missioni)
- Archiviazione locale dei dati

### 4.3 Connettività
- Connessione Internet costante richiesta
- Velocità minima: 1 Mbps
- Latenza massima: 300ms
- Utilizzo dati stimato: 50MB/ora di gioco attivo

## 👥 CAPITOLO 5: CONDOTTA E FAIR PLAY

### 5.1 Comportamenti Vietati
È strettamente vietato:
- Utilizzo di software di localizzazione falsa (GPS spoofing)
- Automazione delle azioni di gioco (bot, script)
- Condivisione di account tra più persone
- Reverse engineering dell'applicazione
- Interferenza con i sistemi di gioco

### 5.2 Sanzioni
Le violazioni comportano:
- **Prima violazione**: Avvertimento formale
- **Seconda violazione**: Sospensione 7 giorni
- **Terza violazione**: Sospensione 30 giorni
- **Violazioni gravi**: Ban permanente immediato

### 5.3 Sistema di Segnalazione
- Report comportamenti sospetti tramite app
- Team moderazione attivo 24/7
- Investigazione entro 48 ore
- Comunicazione esito entro 5 giorni lavorativi

## 💰 CAPITOLO 6: MODELLO ECONOMICO

### 6.1 Account Gratuito
Funzionalità incluse:
- 3 BUZZ giornalieri
- 10 BUZZ Mappa settimanali
- Accesso a missioni base
- Partecipazione eventi pubblici

### 6.2 Abbonamento Premium
Vantaggi Premium:
- BUZZ illimitati
- Accesso a missioni esclusive
- Premi di valore superiore
- Supporto prioritario
- Analytics avanzate

### 6.3 Microtransazioni
Opzioni di acquisto:
- Pacchetti BUZZ aggiuntivi
- Potenziamenti temporanei
- Accessi premium singoli
- Personalizzazioni avatar

## 🔒 CAPITOLO 7: PRIVACY E SICUREZZA

### 7.1 Raccolta Dati
**M1SSION™** raccoglie:
- Dati di localizzazione GPS
- Informazioni di gioco e progresso
- Dati di utilizzo dell'applicazione
- Preferenze e impostazioni utente

### 7.2 Utilizzo Dati
I dati vengono utilizzati per:
- Funzionamento del gioco
- Miglioramento dell'esperienza utente
- Prevenzione frodi e violazioni
- Analisi statistiche anonimizzate

### 7.3 Condivisione Dati
- Nessuna condivisione con terze parti per fini commerciali
- Condivisione limitata per funzionalità di gioco
- Possibile condivisione per obblighi legali
- Controllo utente sulle preferenze privacy

## ⚖️ CAPITOLO 8: ASPETTI LEGALI

### 8.1 Giurisdizione
Il presente regolamento è soggetto alla legislazione italiana. Eventuali dispute saranno risolte presso i tribunali competenti italiani.

### 8.2 Modifiche Regolamento
- **M1SSION™** si riserva il diritto di modificare il regolamento
- Preavviso minimo: 30 giorni
- Notifica via email e notifica in-app
- Continuazione uso implica accettazione modifiche

### 8.3 Limitazioni Responsabilità
**M1SSION™** non è responsabile per:
- Danni derivanti da uso improprio dell'app
- Interruzioni del servizio per cause di forza maggiore
- Perdita di dati per problemi tecnici del dispositivo
- Conseguenze di violazioni del regolamento da parte dell'utente

## 🌍 CAPITOLO 9: DISPONIBILITÀ GEOGRAFICA

### 9.1 Aree di Servizio
Il servizio è attualmente disponibile in:
- Italia (completa)
- Europa (selezione)
- Espansione programmata in altri continenti

### 9.2 Restrizioni Territoriali
Alcune funzionalità potrebbero non essere disponibili in:
- Aree con restrizioni GPS
- Zone militari o sensibili
- Territori con limitazioni normative specifiche

## 📞 CAPITOLO 10: SUPPORTO E CONTATTI

### 10.1 Canali di Assistenza
- **Email**: support@m1ssion.com
- **Chat in-app**: Disponibile 24/7
- **FAQ**: Sezione dedicata nell'applicazione
- **Community**: Forum ufficiale e Discord

### 10.2 Tempi di Risposta
- Chat in-app: Immediata (bot) / 1 ora (operatore)
- Email: 24 ore (giorni lavorativi)
- Questioni tecniche urgenti: 2 ore
- Reclami: 5 giorni lavorativi

---

**© 2024 M1SSION™ - Tutti i diritti riservati**

*Ultimo aggiornamento: Dicembre 2024*
*Versione Regolamento: 2.1*

---

**ACCETTAZIONE REGOLAMENTO**
L'utilizzo di **M1SSION™** implica l'accettazione integrale del presente regolamento. Si consiglia di conservare una copia per riferimento futuro.
`;

  return (
    <div className="space-y-4 text-white">
      <div 
        className="border border-white/10 rounded-lg flex justify-between items-center p-3 cursor-pointer hover:bg-white/5"
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="flex items-center">
          <FileText className="h-5 w-5 mr-3 text-projectx-neon-blue" />
          <span>Regolamento Ufficiale M1SSION™</span>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[70vh] bg-black/95 backdrop-blur-md border border-white/10">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <FileText className="h-6 w-6 text-projectx-neon-blue" />
              Regolamento Ufficiale M1SSION™
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-full px-6">
            <div className="prose prose-invert max-w-none text-sm md:text-base text-white">
              <div className="whitespace-pre-line leading-relaxed">
                {regulationContent}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegulationSection;
