// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// GENERATE MISSION CLUES V3 - 1200 indizi intelligenti (250 sbloccabili/utente)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface MissionData {
  prize_id: string;
  city: string;
  country: string;
  region?: string;
  street?: string;
  prize_name?: string;
  prize_brand?: string;
  prize_model?: string;
  prize_type: string;
  prize_color?: string;
  prize_material?: string;
  prize_category?: string;
  prize_size?: string;
  prize_weight?: string;
  prize_description?: string;
  prize_value_estimate?: string;
  lat?: number;
  lng?: number;
}

// ============================================
// MAPPE INTELLIGENTI COLORI (espanse)
// ============================================

const COLOR_DESCRIPTIONS: Record<string, string[]> = {
  'oro': ['dorato', 'color del sole', 'brillante come l\'alba', 'riflessi aurei', 'luminoso come l\'oro', 'caldo come il tramonto', 'prezioso giallo', 'sfolgorante', 'regale', 'imperiale'],
  'argento': ['argentato', 'color della luna', 'riflessi lunari', 'metallico chiaro', 'brillante come mercurio', 'freddo elegante', 'luminescente', 'stellare', 'ghiacciato', 'cristallino'],
  'platino': ['platinato', 'grigio nobile', 'metallico prezioso', 'argento intenso', 'riflessi platino', 'raffinato', 'esclusivo', 'raro', 'distintivo', 'sofisticato'],
  'nero': ['scuro come la notte', 'color dell\'ombra', 'profondo come l\'abisso', 'elegante nero', 'oscuro e misterioso', 'nero intenso', 'corvino', 'ebano', 'notturno', 'mezzanotte'],
  'bianco': ['candido', 'puro come la neve', 'luminoso', 'chiaro come la luce', 'immacolato', 'niveo', 'latteo', 'perla', 'avorio', 'alabastro'],
  'rosso': ['rosso fuoco', 'color della passione', 'intenso come il corallo', 'vermiglio', 'rubino', 'scarlatto', 'cremisi', 'bordeaux', 'amaranto', 'porpora'],
  'blu': ['blu profondo', 'color del mare', 'azzurro intenso', 'zaffiro', 'blu notte', 'cobalto', 'indaco', 'marino', 'navy', 'ceruleo'],
  'verde': ['verde smeraldo', 'color della natura', 'tonalità bosco', 'giada', 'verde intenso', 'foresta', 'muschio', 'oliva', 'menta', 'pistacchio'],
  'grigio': ['grigio metallico', 'antracite', 'color titanio', 'fumo', 'grafite', 'ardesia', 'piombo', 'cenere', 'acciaio', 'tungsteno'],
  'marrone': ['color cioccolato', 'terra bruciata', 'cognac', 'noce', 'tabacco', 'caffè', 'cuoio', 'terracotta', 'ruggine', 'cannella'],
  'rosa': ['rosa tenue', 'color pesca', 'rosa antico', 'cipria', 'rosa champagne', 'salmone', 'corallo chiaro', 'magenta tenue', 'fucsia pallido', 'malva'],
  'bronze': ['bronzeo', 'rame antico', 'color tramonto', 'ambra', 'terracotta', 'ottone', 'rame', 'dorato scuro', 'caramello', 'miele'],
  'titanio': ['grigio titanio', 'metallico opaco', 'futuristico', 'tecnico', 'spaziale', 'industriale', 'moderno', 'hi-tech', 'aerospace', 'racing'],
  'multicolore': ['cangiante', 'iridescente', 'policromo', 'arcobaleno', 'sfumato', 'prismatico', 'opalescente', 'madreperlato', 'aurora', 'camaleonte'],
};

// ============================================
// MAPPE INTELLIGENTI MATERIALI (espanse)
// ============================================

const MATERIAL_DESCRIPTIONS: Record<string, string[]> = {
  'oro 18k': ['metallo prezioso giallo', 'lega nobile 750', 'oro massiccio', 'metallo solare', 'oro certificato', 'lega pregiata', 'metallo eterno', 'oro italiano'],
  'oro 24k': ['oro purissimo', 'metallo prezioso al 100%', 'oro fino', 'metallo regale', 'oro 999', 'purezza assoluta', 'oro investment grade'],
  'oro rosa': ['oro rosato', 'lega romantica', 'metallo delicato', 'oro champagne', 'oro rosa italiano', 'lega moderna', 'oro blush'],
  'oro bianco': ['oro pallido', 'lega preziosa chiara', 'oro rodato', 'metallo luminoso', 'oro glaciale', 'lega sofisticata'],
  'argento 925': ['argento sterling', 'metallo lunare', 'lega pregiata', 'argento massiccio', 'argento certificato', 'metallo puro', 'sterling silver'],
  'platino': ['metallo dei re', 'più prezioso dell\'oro', 'metallo eterno', 'lega rara', 'platino 950', 'metallo nobile', 'il re dei metalli'],
  'acciaio inossidabile': ['acciaio lucido', 'metallo resistente', 'lega moderna', 'acciaio chirurgico', 'steel inox', 'metallo durevole', 'acciaio 316L'],
  'titanio': ['metallo aerospaziale', 'lega ultraleggera', 'metallo futuristico', 'titanio grado 5', 'Ti-6Al-4V', 'metallo high-tech', 'aerospace grade'],
  'carbonio': ['fibra di carbonio', 'materiale racing', 'composito tecnico', 'carbonio intrecciato', 'forged carbon', 'CFRP', 'carbonio aeronautico'],
  'pelle': ['pellame pregiato', 'cuoio italiano', 'pelle conciata', 'pellame naturale', 'vera pelle', 'full grain leather', 'cuoio toscano'],
  'pelle di coccodrillo': ['pelle esotica squamata', 'pellame rarissimo', 'coccodrillo del Nilo', 'pelle preziosa', 'alligatore', 'croc leather', 'pelle lusso'],
  'pelle di pitone': ['pelle serpente', 'pellame esotico', 'pitone birmano', 'pelle maculata', 'snake skin', 'python leather'],
  'pelle di struzzo': ['pelle a puntini', 'pellame africano', 'struzzo premium', 'ostrich leather', 'pelle esclusiva'],
  'ceramica': ['ceramica high-tech', 'materiale antigraffio', 'ceramica tecnica', 'superficie setosa', 'zirconia', 'ceramic composite'],
  'cristallo': ['vetro zaffiro', 'cristallo antigraffio', 'superficie indistruttibile', 'trasparenza perfetta', 'sapphire crystal', 'vetro minerale'],
  'diamanti': ['pietre preziose', 'brillanti incastonati', 'diamanti certificati', 'gemme scintillanti', 'diamond set', 'pavé di diamanti', 'full diamond'],
  'rubini': ['pietre rosse', 'gemme di fuoco', 'rubini birmani', 'corindone rosso', 'pigeon blood ruby'],
  'smeraldi': ['pietre verdi', 'gemme colombiane', 'smeraldi naturali', 'verde intenso', 'emerald cut'],
  'zaffiri': ['pietre blu', 'zaffiri ceylon', 'corindone blu', 'gemme regali', 'royal blue sapphire'],
  'vetro': ['cristallo soffiato', 'vetro veneziano', 'cristallo di Murano', 'vetro artistico'],
  'legno': ['legno pregiato', 'radica naturale', 'essenza rara', 'legno esotico', 'ebano', 'palissandro', 'noce canaletto'],
};

// ============================================
// TEMPLATE PER CATEGORIA (espansi per 1200 indizi)
// ============================================

const CATEGORY_PRIZE_TEMPLATES: Record<string, Record<string, string[]>> = {
  'Orologeria': {
    week1: [
      "Un guardiano del tempo che segna le ore con precisione svizzera...",
      "Qualcosa che si indossa al polso e racconta storie di successo...",
      "Un compagno fedele che batte al ritmo del tuo cuore...",
      "L'arte dell'orologeria al suo apice...",
      "Meccanismi perfetti che danzano in sincronia...",
      "Il tempo si ferma davanti a tanta bellezza...",
      "Un oggetto che misura i secondi con perfezione assoluta...",
      "Il polso dei vincitori porta sempre qualcosa di speciale...",
      "Tic-tac, tic-tac... il lusso scandisce il tempo...",
      "Un segnatempo che vale più di mille parole...",
      "La precisione svizzera incontra il design italiano...",
      "Ogni secondo conta quando hai questo al polso...",
      "Un orologio che fa girare la testa a tutti...",
      "Il tempo è denaro, ma questo vale molto di più...",
      "Qualcosa che i collezionisti sognano di possedere...",
    ],
    week2: [
      "Il quadrante rivela {color_desc}...",
      "La cassa è forgiata in {material_desc}...",
      "Un segnatempo dalla categoria {category}...",
      "Movimento automatico di alta manifattura...",
      "Dimensioni che si adattano al polso più esigente...",
      "Il vetro zaffiro protegge un quadrante magnifico...",
      "La corona presenta il logo del marchio...",
      "Un calibro manifattura batte al suo interno...",
      "Le lancette brillano nel buio...",
      "Il fondello trasparente rivela la meccanica...",
      "Riserva di carica che supera le 72 ore...",
      "Impermeabile fino a profondità importanti...",
      "La ghiera ruota con precisione...",
      "Certificato cronometro ufficiale...",
      "Il bracciale si adatta perfettamente...",
    ],
    week3: [
      "La lunetta presenta dettagli distintivi...",
      "Il cinturino abbraccia con eleganza {material_desc}...",
      "Resistente all'acqua come un sommergibile...",
      "Il fondello racconta la storia del marchio...",
      "Lancette che indicano più del semplice tempo...",
      "Complicazioni che solo i maestri sanno creare...",
      "Un datario perfettamente integrato...",
      "La corona avvitata garantisce sicurezza...",
      "Maglie del bracciale levigate a specchio...",
      "Il movimento batte a 28.800 alternanze/ora...",
      "Decorazioni Côtes de Genève visibili...",
      "Indici applicati in materiale luminescente...",
      "La fibbia deployante chiude con precisione...",
      "Un calibro con oltre 200 componenti...",
      "Il vetro bombato distorce appena la luce...",
    ],
    week4: [
      "Un orologio {brand} {model} attende il vincitore...",
      "Dimensioni: {size}, perfetto per chi ama il lusso...",
      "Valore certificato, autenticità garantita...",
      "Il sogno di ogni collezionista è a portata di mano...",
      "Referenza esclusiva, produzione limitata...",
      "Corredato di box e documenti originali...",
      "Garanzia internazionale inclusa...",
      "Pronto per essere indossato dal vincitore...",
      "Un pezzo che aumenterà di valore nel tempo...",
      "La storia dell'orologeria in un solo oggetto...",
      "Edizione speciale numerata...",
      "Il graal di ogni appassionato...",
      "Certificato di origine impeccabile...",
      "Un investimento che si indossa...",
      "L'orologio che tutti vorrebbero avere...",
    ],
  },
  'Automotive': {
    week1: [
      "Un bolide che fa battere il cuore degli appassionati...",
      "Quattro ruote che incarnano velocità e potenza...",
      "Un sogno su strada che tutti vorrebbero guidare...",
      "L'ingegneria automobilistica al suo massimo splendore...",
      "Motore che ruggisce come un leone...",
      "Adrenalina pura su quattro ruote...",
      "Un'auto che scrive la storia dell'automotive...",
      "Velocità e lusso in perfetta armonia...",
      "Il sogno di ogni bambino diventato realtà...",
      "Una macchina che fa girare tutte le teste...",
      "Prestazioni che tolgono il fiato...",
      "Design italiano che conquista il mondo...",
      "Il rombo del motore è musica per le orecchie...",
      "Un'auto che vale più di una casa...",
      "La perfezione meccanica su strada...",
    ],
    week2: [
      "La carrozzeria brilla di {color_desc}...",
      "Interni rivestiti in {material_desc}...",
      "Un veicolo dalla categoria {category}...",
      "Cavalli vapore che scalpitano sotto il cofano...",
      "Design aerodinamico che taglia l'aria...",
      "Motore posizionato centralmente...",
      "Trazione che spinge verso il futuro...",
      "Cambio a doppia frizione ultraveloce...",
      "Sospensioni attive per ogni curva...",
      "Freni carboceramici per fermate da record...",
      "Cerchi in lega forgiata da 20 pollici...",
      "Sedili racing avvolgenti...",
      "Volante rivestito in Alcantara...",
      "Scarichi in titanio per un sound unico...",
      "Alettone attivo per massima deportanza...",
    ],
    week3: [
      "Il rombo del motore è inconfondibile...",
      "Cerchi in lega che catturano lo sguardo...",
      "Sedili avvolgenti come un abbraccio...",
      "Cruscotto digitale del futuro...",
      "Ogni curva racconta di velocità...",
      "I fari LED tracciano la strada...",
      "Il cofano nasconde cavalli imbizzarriti...",
      "Lo specchietto retrovisore è una telecamera...",
      "Le pinze freno brillano di colore...",
      "L'abitacolo profuma di pelle pregiata...",
      "Il tetto è in fibra di carbonio...",
      "Le prese d'aria raffreddano il motore...",
      "Lo spoiler si alza oltre i 120 km/h...",
      "I sedili hanno memorie personalizzate...",
      "Il sound system è firmato da un brand premium...",
    ],
    week4: [
      "Una {brand} {model} attende chi saprà trovarla...",
      "Potenza e eleganza: {size} di pura adrenalina...",
      "Certificata, revisionata, pronta a partire...",
      "Le chiavi aspettano il legittimo vincitore...",
      "Chilometri certificati, storia limpida...",
      "Tagliandi sempre effettuati in casa madre...",
      "Garanzia ufficiale ancora valida...",
      "Optional da sogno inclusi...",
      "Colore esclusivo su ordinazione...",
      "Esemplare unico nella sua configurazione...",
      "Pronta per essere immatricolata...",
      "Assicurazione primo anno inclusa...",
      "Un'auto che farà invidia a tutti...",
      "Il garage dei sogni ti aspetta...",
      "La prossima curva sarà la tua...",
    ],
  },
  'Moda': {
    week1: [
      "Un accessorio che definisce lo stile di chi lo possiede...",
      "Qualcosa che le fashioniste di tutto il mondo desiderano...",
      "L'essenza dell'alta moda in un unico pezzo...",
      "Un capolavoro di design e artigianalità...",
      "Lo statement piece definitivo...",
      "Il must-have di ogni stagione...",
      "Un pezzo da red carpet...",
      "L'accessorio che completa ogni outfit...",
      "Qualcosa che fa tendenza da decenni...",
      "Il tocco finale per chi ama distinguersi...",
      "Un classico senza tempo...",
      "L'eleganza fatta accessorio...",
      "Un pezzo iconico riconosciuto ovunque...",
      "La firma del lusso italiano...",
      "Qualcosa che le celebrity adorano...",
    ],
    week2: [
      "Il colore richiama {color_desc}...",
      "Realizzato in {material_desc} pregiato...",
      "Un pezzo dalla categoria {category}...",
      "Cuciture perfette, finiture impeccabili...",
      "Un classico senza tempo...",
      "Hardware dorato o argentato di pregio...",
      "Zip e bottoni firmati...",
      "Fodera in tessuto pregiato...",
      "Logo discretamente visibile...",
      "Dimensioni perfette per ogni occasione...",
      "Manici che si adattano alla mano...",
      "Tracolla regolabile inclusa...",
      "Tasche interne organizzate...",
      "Chiusura sicura e elegante...",
      "Dettagli che fanno la differenza...",
    ],
    week3: [
      "Il logo del brand è discretamente visibile...",
      "Chiusure e fibbie di pregio...",
      "Interni foderati con cura maniacale...",
      "Ogni dettaglio racconta lusso...",
      "La silhouette è iconica...",
      "Le cuciture sono fatte a mano...",
      "Il pellame è morbidissimo al tatto...",
      "I bordi sono rifiniti con cura...",
      "La struttura mantiene la forma nel tempo...",
      "L'odore del pellame è inconfondibile...",
      "I piedini proteggono la base...",
      "La chiusura scatta con soddisfazione...",
      "L'interno è diviso in scomparti...",
      "Il colore è stato tinto a mano...",
      "Ogni pezzo è unico nella sua imperfezione...",
    ],
    week4: [
      "Un {prize_type} {brand} in edizione speciale...",
      "Dimensioni: {size}, perfetto per ogni occasione...",
      "Con certificato di autenticità originale...",
      "Il pezzo che completerà la collezione del vincitore...",
      "Corredato di dustbag e scatola originale...",
      "Numero di serie verificabile online...",
      "Acquistato in boutique ufficiale...",
      "Mai utilizzato, ancora con cartellino...",
      "Edizione limitata numerata...",
      "Colore esclusivo della stagione...",
      "Collaborazione speciale con designer...",
      "Pezzo da collezione per intenditori...",
      "L'accessorio che tutti riconosceranno...",
      "Il regalo perfetto per se stessi...",
      "Un investimento che si indossa...",
    ],
  },
  'Gioielleria': {
    week1: [
      "Una gemma che brilla di luce propria...",
      "Qualcosa che impreziosisce chi lo indossa...",
      "L'arte orafa al suo massimo splendore...",
      "Un gioiello che racconta storie millenarie...",
      "Brillantezza che cattura ogni sguardo...",
      "Il tocco di lusso che fa la differenza...",
      "Un pezzo che attraversa le generazioni...",
      "La luce danza su questa creazione...",
      "Un gioiello degno di una regina...",
      "Qualcosa che brilla più delle stelle...",
      "L'eccellenza dell'alta gioielleria...",
      "Un pezzo che vale un tesoro...",
      "La maestria orafa in ogni dettaglio...",
      "Un gioiello che sussurra eleganza...",
      "Qualcosa che lascia senza fiato...",
    ],
    week2: [
      "Il metallo riflette {color_desc}...",
      "Forgiato in {material_desc} purissimo...",
      "Un pezzo dalla categoria {category}...",
      "Pietre incastonate con maestria...",
      "Design che unisce tradizione e modernità...",
      "Carati che parlano da soli...",
      "Taglio che massimizza la brillantezza...",
      "Certificazione gemmologica inclusa...",
      "Montatura che esalta le gemme...",
      "Lavorazione artigianale italiana...",
      "Punzoni che garantiscono l'autenticità...",
      "Peso importante, presenza notevole...",
      "Chiusura di sicurezza invisibile...",
      "Finitura lucida o satinata...",
      "Design contemporaneo o classico...",
    ],
    week3: [
      "Carati che parlano di esclusività...",
      "Taglio che esalta la brillantezza...",
      "La montatura abbraccia le gemme con grazia...",
      "Punzoni che certificano l'autenticità...",
      "Ogni sfaccettatura cattura la luce...",
      "Il castello tiene sicura la pietra...",
      "Le griffe sono perfettamente simmetriche...",
      "La pulizia rivela fuoco interno...",
      "Il peso si sente piacevolmente...",
      "La chiusura scatta con precisione...",
      "Le proporzioni sono matematicamente perfette...",
      "Nessuna inclusione visibile a occhio nudo...",
      "Il colore è uniforme e intenso...",
      "La simmetria è impeccabile...",
      "Ogni angolo riflette un arcobaleno...",
    ],
    week4: [
      "Un {prize_type} {brand} con certificazione internazionale...",
      "Peso: {weight} di pura eleganza...",
      "Corredato di garanzia e documentazione...",
      "Il gioiello che cambierà la vita del vincitore...",
      "Certificato GIA o IGI incluso...",
      "Acquistato in gioielleria prestigiosa...",
      "Astuccio originale e sacchetto inclusi...",
      "Valutazione assicurativa disponibile...",
      "Pezzo unico realizzato su commissione...",
      "Firma del maestro orafo visibile...",
      "Edizione numerata e limitata...",
      "Storia del pezzo documentata...",
      "Provenienza delle gemme certificata...",
      "Un tesoro da tramandare...",
      "L'investimento più bello che esista...",
    ],
  },
  'Tech': {
    week1: [
      "Tecnologia all'avanguardia per chi guarda al futuro...",
      "Un device che ridefinisce gli standard...",
      "Innovazione che si tocca con mano...",
      "Il meglio che la tecnologia possa offrire...",
      "Un concentrato di potenza e design...",
      "L'evoluzione tecnologica in un oggetto...",
      "Qualcosa che renderà la vita più semplice...",
      "Il futuro è già qui...",
      "Un device che fa invidia a tutti...",
      "La perfezione tecnologica raggiunta...",
      "Qualcosa che gli early adopter adorano...",
      "Il top di gamma assoluto...",
      "Innovazione made in...",
      "Un oggetto che cambierà le tue abitudini...",
      "La tecnologia al servizio del lusso...",
    ],
    week2: [
      "La scocca brilla di {color_desc}...",
      "Costruito con {material_desc} premium...",
      "Un prodotto dalla categoria {category}...",
      "Prestazioni che superano ogni aspettativa...",
      "Display che incanta lo sguardo...",
      "Processore di ultimissima generazione...",
      "Memoria che non conosce limiti...",
      "Batteria che dura giorni interi...",
      "Connettività di nuova generazione...",
      "Fotocamera con sensore professionale...",
      "Audio spaziale immersivo...",
      "Ricarica wireless ultraveloce...",
      "Resistente all'acqua e alla polvere...",
      "Schermo con refresh rate altissimo...",
      "Materiali riciclati e sostenibili...",
    ],
    week3: [
      "Processore di ultima generazione...",
      "Memoria che non conosce limiti...",
      "Fotocamera che cattura la realtà...",
      "Batteria che dura quanto serve...",
      "Connettività di nuova generazione...",
      "Il chip più potente mai creato...",
      "Display con miliardi di colori...",
      "Sensori biometrici avanzati...",
      "Sistema operativo fluido e intuitivo...",
      "Aggiornamenti garantiti per anni...",
      "Ecosistema completo e integrato...",
      "Accessori premium inclusi...",
      "Design minimalista e funzionale...",
      "Materiali che invecchiano bene...",
      "Riparabilità garantita...",
    ],
    week4: [
      "Un {brand} {model} nuovo di zecca...",
      "Specifiche: {size} di pura potenza...",
      "Con garanzia ufficiale del produttore...",
      "Pronto per essere usato dal fortunato vincitore...",
      "Configurazione massima disponibile...",
      "Colore esclusivo edizione speciale...",
      "Accessori originali inclusi nella confezione...",
      "AppleCare+ o equivalente incluso...",
      "Sigillato, mai aperto...",
      "Fattura originale per garanzia...",
      "Acquisto effettuato in store ufficiale...",
      "Ultima versione disponibile...",
      "Scorte limitate nel mondo...",
      "Il device che tutti desiderano...",
      "Pronto per essere configurato...",
    ],
  },
  'Viaggi': {
    week1: [
      "Un'esperienza che porterai sempre nel cuore...",
      "Destinazioni da sogno ti aspettano...",
      "Il viaggio della vita...",
      "Lusso e avventura in perfetto equilibrio...",
      "Qualcosa che i soldi normalmente non comprano...",
      "Un'esperienza che cambierà la tua prospettiva...",
      "Il mondo ti aspetta...",
      "Destinazioni esclusive e private...",
      "Un viaggio che racconta una storia...",
      "L'avventura di una vita intera...",
      "Esperienze riservate a pochi eletti...",
      "Il lusso del tempo e dello spazio...",
      "Ricordi che dureranno per sempre...",
      "Un viaggio che ispira...",
      "La libertà di esplorare...",
    ],
    week2: [
      "Colori e paesaggi che richiamano {color_desc}...",
      "Esperienze costruite con {material_desc} cura...",
      "Un viaggio nella categoria {category}...",
      "Alloggi a 5 stelle e oltre...",
      "Voli in business o first class...",
      "Guide private parlanti italiano...",
      "Esperienze gastronomiche stellate...",
      "Accessi VIP a luoghi esclusivi...",
      "Transfer in auto di lusso...",
      "Concierge dedicato 24/7...",
      "Spa e wellness inclusi...",
      "Escursioni private organizzate...",
      "Assicurazione premium inclusa...",
      "Flessibilità totale sulle date...",
      "Upgrade garantiti dove possibile...",
    ],
    week3: [
      "Dettagli curati con ossessione...",
      "Ogni momento sarà indimenticabile...",
      "Servizio impeccabile garantito...",
      "Sorprese lungo il percorso...",
      "Momenti di pura magia...",
      "Sunset su panorami mozzafiato...",
      "Cene private in location esclusive...",
      "Incontri con personalità locali...",
      "Accesso a eventi speciali...",
      "Fotografie professionali incluse...",
      "Souvenir esclusivi personalizzati...",
      "Momenti di relax programmati...",
      "Avventure adrenalitiche opzionali...",
      "Cultura e tradizioni da scoprire...",
      "Natura incontaminata da esplorare...",
    ],
    week4: [
      "Un viaggio {brand} in destinazione esclusiva...",
      "Durata: {size} di pura meraviglia...",
      "Tutto incluso, nessun pensiero...",
      "Il vincitore volerà presto...",
      "Voucher valido per 12 mesi...",
      "Date flessibili da concordare...",
      "Accompagnatore incluso nel pacchetto...",
      "Valore totale documentato...",
      "Prenotazione prioritaria garantita...",
      "Esperienza già sold out altrove...",
      "Pacchetto non acquistabile separatamente...",
      "Il viaggio che tutti sognano...",
      "Pronto per essere prenotato...",
      "L'avventura inizia qui...",
      "Destinazione: i tuoi sogni...",
    ],
  },
  'Arte': {
    week1: [
      "Un'opera che parla all'anima...",
      "L'espressione artistica al suo massimo...",
      "Qualcosa che decora la vita...",
      "Un pezzo che fa riflettere...",
      "L'arte come investimento...",
      "Un'opera firmata da un grande artista...",
      "Qualcosa che i musei vorrebbero...",
      "Un pezzo che racconta una storia...",
      "L'immortalità attraverso l'arte...",
      "Un'opera che emoziona...",
      "Il talento cristallizzato...",
      "Qualcosa di unico al mondo...",
      "L'arte che supera il tempo...",
      "Un pezzo da collezione museale...",
      "La bellezza fatta opera...",
    ],
    week2: [
      "I colori dominanti richiamano {color_desc}...",
      "Realizzata con {material_desc}...",
      "Un'opera dalla categoria {category}...",
      "Tecnica mista o tradizionale...",
      "Dimensioni che impressionano...",
      "Cornice originale d'epoca...",
      "Firma dell'artista visibile...",
      "Certificato di autenticità incluso...",
      "Provenienza documentata...",
      "Esposizioni precedenti note...",
      "Pubblicazioni che la citano...",
      "Stato di conservazione perfetto...",
      "Restauri documentati se presenti...",
      "Valore assicurativo certificato...",
      "Pezzo unico, non riproducibile...",
    ],
    week3: [
      "Ogni dettaglio rivela maestria...",
      "La luce gioca con l'opera...",
      "Texture che invitano al tatto...",
      "Profondità che cattura lo sguardo...",
      "Movimento nella staticità...",
      "Emozioni che traspaiono...",
      "Simbolismi da interpretare...",
      "Strati di significato nascosti...",
      "Equilibrio compositivo perfetto...",
      "Contrasti che creano armonia...",
      "Pennellate o segni distintivi...",
      "Materiali che raccontano storia...",
      "L'artista ha lasciato un messaggio...",
      "Ogni angolazione rivela qualcosa...",
      "Il tempo non ha scalfito la bellezza...",
    ],
    week4: [
      "Un'opera {brand} del periodo {model}...",
      "Dimensioni: {size}, presenza importante...",
      "Autenticata da esperti internazionali...",
      "Il vincitore diventerà collezionista...",
      "Expertise rilasciata da autorità...",
      "Inclusa in catalogo ragionato...",
      "Passaggi d'asta documentati...",
      "Gallerie importanti l'hanno trattata...",
      "Valore in costante crescita...",
      "Pezzo raro sul mercato...",
      "Opportunità irripetibile...",
      "L'arte come eredità...",
      "Un tesoro da custodire...",
      "Il mondo dell'arte ti aspetta...",
      "Diventa custode della bellezza...",
    ],
  },
};

// Template generici espansi per categorie non specificate
const GENERIC_PRIZE_TEMPLATES = {
  week1: [
    "Un premio che rappresenta il successo e l'ambizione...",
    "Qualcosa che fa battere il cuore degli appassionati...",
    "Il simbolo di chi non si accontenta mai...",
    "Un sogno che diventa realtà tangibile...",
    "L'essenza del lusso e dell'esclusività...",
    "Un oggetto che definisce lo status...",
    "Qualcosa che tutti vorrebbero possedere...",
    "Il premio che cambia le regole del gioco...",
    "Un oggetto che parla di passione...",
    "L'eccellenza in forma tangibile...",
    "Qualcosa che i vincenti meritano...",
    "Un premio da sogno...",
    "L'oggetto del desiderio...",
    "Qualcosa che vale ogni sforzo...",
    "Un premio che fa la differenza...",
  ],
  week2: [
    "Il suo colore richiama {color_desc}...",
    "Realizzato con {material_desc} di prima qualità...",
    "Un oggetto dalla categoria {category}...",
    "Qualità che si percepisce al primo sguardo...",
    "Materiali che raccontano eccellenza...",
    "Design curato in ogni dettaglio...",
    "Finiture che parlano di lusso...",
    "Ergonomia e bellezza insieme...",
    "Proporzioni perfette...",
    "Peso e presenza bilanciati...",
    "Texture che invita al tocco...",
    "Colori che catturano la luce...",
    "Forme che ispirano...",
    "Dettagli invisibili ai più...",
    "Qualità che dura nel tempo...",
  ],
  week3: [
    "Ogni dettaglio è stato curato con ossessione...",
    "La sua presenza è magnetica...",
    "Un oggetto che emoziona a prima vista...",
    "Il tocco rivela la qualità superiore...",
    "Design che unisce forma e funzione...",
    "L'artigianato al suo meglio...",
    "Innovazione e tradizione insieme...",
    "Un pezzo che racconta una storia...",
    "La perfezione nei dettagli...",
    "Qualcosa che migliora con l'uso...",
    "Un oggetto che crea legame...",
    "Funzionalità nascosta nell'eleganza...",
    "Semplicità apparente, complessità reale...",
    "Ergonomia studiata nei minimi dettagli...",
    "Un pezzo che invecchia bene...",
  ],
  week4: [
    "Un {prize_type} autentico e certificato...",
    "Valore stimato: {value}...",
    "Il fortunato vincitore riceverà tutto incluso...",
    "Pronto per essere ritirato dal legittimo vincitore...",
    "Documentazione completa inclusa...",
    "Garanzia originale valida...",
    "Packaging originale preservato...",
    "Acquisto diretto da fonte ufficiale...",
    "Storia del pezzo tracciabile...",
    "Condizioni perfette, mai usato...",
    "Tutto pronto per il ritiro...",
    "Il vincitore sarà contattato personalmente...",
    "Consegna sicura e assicurata...",
    "Un premio che vale l'attesa...",
    "Il sogno diventa realtà...",
  ],
};

// ============================================
// LOCATION TEMPLATES (espansi per 1200 indizi)
// ============================================

const LOCATION_TEMPLATES = {
  week1: [
    "Nel cuore di {country}, dove la storia incontra il presente...",
    "Una terra famosa per la sua arte e cultura ti attende...",
    "Dove il sole del Mediterraneo scalda antiche pietre...",
    "In una nazione a forma di stivale, il destino ti chiama...",
    "Tra colline e pianure, un segreto attende di essere scoperto...",
    "Nel paese dei mille campanili, qualcosa ti aspetta...",
    "Dove la tradizione culinaria è patrimonio dell'umanità...",
    "Una terra di poeti, navigatori e sognatori...",
    "Nel regno della bellezza eterna, cerca con il cuore...",
    "Dove ogni pietra racconta una storia millenaria...",
    "In una terra benedetta dal clima mite tutto l'anno...",
    "Dove l'innovazione danza con la tradizione...",
    "Il premio si nasconde in terre antiche...",
    "Segui la strada che porta alla bellezza...",
    "In un paese che ha conquistato il mondo con la cultura...",
  ],
  week2: [
    "In una città che vive di moda e design...",
    "Dove l'innovazione incontra la tradizione...",
    "Una metropoli che non dorme mai ti nasconde qualcosa...",
    "Nelle vicinanze di {city}, il tesoro attende...",
    "In una zona dove gli affari sono di casa...",
    "Dove grandi eventi attirano visitatori da tutto il mondo...",
    "Una città che ha scritto la storia dell'industria...",
    "Nei pressi di un importante hub commerciale...",
    "Dove la moda detta legge nel mondo intero...",
    "In una città che ospita fiere internazionali...",
    "Vicino a stadi che hanno visto trionfi storici...",
    "In una zona universitaria prestigiosa...",
    "Dove il design ha trovato la sua capitale...",
    "In una città collegata con il mondo intero...",
    "Vicino a centri di ricerca d'avanguardia...",
  ],
  week3: [
    "Nel quartiere dove il lusso ha trovato casa...",
    "Vicino a dove le grandi firme espongono le loro creazioni...",
    "In una zona elegante e raffinata...",
    "Non lontano da un famoso luogo di ritrovo...",
    "Dove le vetrine brillano di luce propria...",
    "In un'area pedonale frequentata da chi ama il bello...",
    "Vicino a un punto di riferimento della città...",
    "Dove tradizione e modernità si incontrano ogni giorno...",
    "In un quartiere storico recentemente riqualificato...",
    "Vicino a gallerie d'arte contemporanea...",
    "In una zona dove i ristoranti stellati abbondano...",
    "Non lontano da hotel a 5 stelle...",
    "In un'area dove la movida notturna è vivace...",
    "Vicino a parchi curati e fontane artistiche...",
    "In un quartiere dove ogni palazzo ha una storia...",
  ],
  week4: [
    "Coordinate approssimative: {lat_approx}°N, {lng_approx}°E (±500m)...",
    "L'anagramma della zona è: {anagram}...",
    "Cerca verso {direction} dal centro...",
    "A pochi passi da dove {street_hint}...",
    "Il premio si trova in una zona accessibile al pubblico...",
    "Latitudine: {lat_approx}°, direzione: {direction}...",
    "Il civico è un numero a due cifre...",
    "Vicino a una fermata della metropolitana...",
    "A pochi isolati da un landmark famoso...",
    "In una via che porta il nome di un artista...",
    "Coordinate: {lat_approx}°N - cerca verso {direction}...",
    "L'edificio ha un'insegna luminosa...",
    "Vicino a un incrocio molto trafficato...",
    "In una piazza dove la gente si ritrova...",
    "A un passo dalla stazione centrale...",
  ],
};

const FAKE_LOCATION_TEMPLATES = [
  "Forse nel sud, dove il sole è più caldo...",
  "Potrebbe essere vicino al mare...",
  "Una città con un importante aeroporto...",
  "Vicino a un confine nazionale...",
  "In una zona collinare...",
  "Dove il vino è protagonista...",
  "Vicino a un importante fiume...",
  "In una zona termale rinomata...",
  "Forse in una città portuale...",
  "Nei pressi di un antico castello...",
  "In montagna, dove l'aria è fresca...",
  "Vicino a un lago famoso...",
  "In una regione insulare...",
  "Dove si parla un dialetto particolare...",
  "In una città medievale murata...",
  "Vicino a rovine romane...",
  "In una valle nascosta...",
  "Dove le Dolomiti toccano il cielo...",
  "Vicino a un vulcano attivo...",
  "In una zona di produzione DOP...",
];

const FAKE_PRIZE_TEMPLATES = [
  "Potrebbe essere qualcosa di tecnologico...",
  "Un premio dal valore inestimabile...",
  "Qualcosa legato al mondo dello sport...",
  "Un oggetto d'arte contemporanea...",
  "Forse qualcosa di vintage...",
  "Un premio esperienziale unico...",
  "Qualcosa che brilla di luce propria...",
  "Un oggetto da collezione raro...",
  "Forse un viaggio esclusivo...",
  "Qualcosa legato alla gastronomia...",
  "Un'esperienza da VIP...",
  "Qualcosa che si indossa...",
  "Un oggetto elettronico rivoluzionario...",
  "Forse un pezzo d'antiquariato...",
  "Qualcosa di sportivo e dinamico...",
  "Un premio relax e benessere...",
  "Qualcosa legato alla musica...",
  "Un oggetto firmato da una celebrity...",
  "Forse un investimento alternativo...",
  "Qualcosa che vale quanto un appartamento...",
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createAnagram(word: string): string {
  return shuffleArray(word.toUpperCase().split('')).join('');
}

function getRandomDirection(): string {
  const directions = ['nord', 'sud', 'est', 'ovest', 'nordest', 'nordovest', 'sudest', 'sudovest'];
  return directions[Math.floor(Math.random() * directions.length)];
}

function getColorDescription(color: string): string {
  const colorKey = color?.toLowerCase().trim() || '';
  const descriptions = COLOR_DESCRIPTIONS[colorKey] || COLOR_DESCRIPTIONS['nero'];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function getMaterialDescription(material: string): string {
  const materialKey = material?.toLowerCase().trim() || '';
  for (const [key, descriptions] of Object.entries(MATERIAL_DESCRIPTIONS)) {
    if (materialKey.includes(key) || key.includes(materialKey)) {
      return descriptions[Math.floor(Math.random() * descriptions.length)];
    }
  }
  return 'materiale pregiato';
}

function generateClue(template: string, data: MissionData): string {
  let clue = template;
  
  clue = clue.replace('{country}', data.country || 'Italia');
  clue = clue.replace('{city}', data.city || 'la città');
  clue = clue.replace('{color_desc}', getColorDescription(data.prize_color || ''));
  clue = clue.replace('{material_desc}', getMaterialDescription(data.prize_material || ''));
  clue = clue.replace('{category}', data.prize_category || 'lusso');
  clue = clue.replace('{direction}', getRandomDirection());
  clue = clue.replace('{brand}', data.prize_brand || 'prestigioso');
  clue = clue.replace('{model}', data.prize_model || '');
  clue = clue.replace('{prize_type}', data.prize_type || 'premio');
  clue = clue.replace('{size}', data.prize_size || 'dimensioni perfette');
  clue = clue.replace('{weight}', data.prize_weight || '');
  clue = clue.replace('{value}', data.prize_value_estimate || 'inestimabile');
  
  if (data.lat && data.lng) {
    const latApprox = (data.lat + (Math.random() - 0.5) * 0.1).toFixed(2);
    const lngApprox = (data.lng + (Math.random() - 0.5) * 0.1).toFixed(2);
    clue = clue.replace('{lat_approx}', latApprox);
    clue = clue.replace('{lng_approx}', lngApprox);
  } else {
    clue = clue.replace('{lat_approx}', '45.XX');
    clue = clue.replace('{lng_approx}', '9.XX');
  }
  
  if (clue.includes('{anagram}') && data.city) {
    clue = clue.replace('{anagram}', createAnagram(data.city));
  }
  
  if (clue.includes('{street_hint}') && data.street) {
    clue = clue.replace('{street_hint}', `una via famosa inizia per "${data.street[0]}"`);
  } else {
    clue = clue.replace('{street_hint}', 'si incrociano due importanti vie');
  }
  
  clue = clue.replace(/\{[^}]+\}/g, '');
  
  return clue.trim();
}

function getPrizeTemplates(category: string, week: number): string[] {
  const weekKey = `week${week}` as 'week1' | 'week2' | 'week3' | 'week4';
  
  for (const [cat, templates] of Object.entries(CATEGORY_PRIZE_TEMPLATES)) {
    if (category?.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(category?.toLowerCase() || '')) {
      if (templates[weekKey]) {
        return templates[weekKey];
      }
    }
  }
  
  return GENERIC_PRIZE_TEMPLATES[weekKey];
}

// ============================================
// MAIN HANDLER - GENERA 1200 INDIZI
// ============================================

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎯 [GENERATE-CLUES-V3] Starting generation of 1200 clues...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let body: any;
    try {
      body = await req.json();
    } catch {
      const textBody = await req.text();
      body = JSON.parse(textBody);
    }
    
    const data: MissionData = {
      prize_id: body.prize_id,
      city: body.city || '',
      country: body.country || 'Italia',
      region: body.region || '',
      street: body.street || '',
      prize_name: body.prize_name || '',
      prize_brand: body.prize_brand || '',
      prize_model: body.prize_model || '',
      prize_type: body.prize_type || '',
      prize_color: body.prize_color || '',
      prize_material: body.prize_material || '',
      prize_category: body.prize_category || '',
      prize_size: body.prize_size || '',
      prize_weight: body.prize_weight || '',
      prize_description: body.prize_description || '',
      prize_value_estimate: body.prize_value_estimate || '',
      lat: body.lat,
      lng: body.lng,
    };

    if (!data.prize_id) {
      throw new Error('prize_id is required');
    }

    console.log('📍 [GENERATE-CLUES-V3] Mission data:', {
      prize_id: data.prize_id,
      city: data.city,
      prize_category: data.prize_category,
      prize_color: data.prize_color,
    });

    // Delete existing clues
    await supabase.from('prize_clues').delete().eq('prize_id', data.prize_id);

    const clues: any[] = [];
    const weeks = [1, 2, 3, 4];

    // NUMERI PER 1200 INDIZI TOTALI
    // Per settimana: 300 (75 location reali + 25 location falsi + 75 premio reali + 25 premio falsi)
    // Totale: 1200 (600 location + 600 premio) (900 reali + 300 falsi)
    
    const REAL_LOCATION_PER_WEEK = 112; // ~75% di 150
    const FAKE_LOCATION_PER_WEEK = 38;  // ~25% di 150
    const REAL_PRIZE_PER_WEEK = 112;    // ~75% di 150
    const FAKE_PRIZE_PER_WEEK = 38;     // ~25% di 150

    for (const week of weeks) {
      // LOCATION CLUES - 150 per settimana (112 reali + 38 falsi)
      const locationTemplates = LOCATION_TEMPLATES[`week${week}` as keyof typeof LOCATION_TEMPLATES];
      
      for (let i = 0; i < REAL_LOCATION_PER_WEEK; i++) {
        const template = locationTemplates[i % locationTemplates.length];
        clues.push({
          prize_id: data.prize_id,
          week,
          clue_category: 'location',
          description_it: generateClue(template, data),
          title_it: `Indizio Luogo - Settimana ${week}`,
          is_fake: false,
          difficulty_level: week,
          clue_type: 'real'
        });
      }

      for (let i = 0; i < FAKE_LOCATION_PER_WEEK; i++) {
        clues.push({
          prize_id: data.prize_id,
          week,
          clue_category: 'location',
          description_it: FAKE_LOCATION_TEMPLATES[i % FAKE_LOCATION_TEMPLATES.length],
          title_it: `Indizio Luogo - Settimana ${week}`,
          is_fake: true,
          difficulty_level: week,
          clue_type: 'decoy'
        });
      }

      // PRIZE CLUES - 150 per settimana (112 reali + 38 falsi)
      const prizeTemplates = getPrizeTemplates(data.prize_category || data.prize_type, week);
      
      for (let i = 0; i < REAL_PRIZE_PER_WEEK; i++) {
        const template = prizeTemplates[i % prizeTemplates.length];
        clues.push({
          prize_id: data.prize_id,
          week,
          clue_category: 'prize',
          description_it: generateClue(template, data),
          title_it: `Indizio Premio - Settimana ${week}`,
          is_fake: false,
          difficulty_level: week,
          clue_type: 'real'
        });
      }

      for (let i = 0; i < FAKE_PRIZE_PER_WEEK; i++) {
        clues.push({
          prize_id: data.prize_id,
          week,
          clue_category: 'prize',
          description_it: FAKE_PRIZE_TEMPLATES[i % FAKE_PRIZE_TEMPLATES.length],
          title_it: `Indizio Premio - Settimana ${week}`,
          is_fake: true,
          difficulty_level: week,
          clue_type: 'decoy'
        });
      }
    }

    // Shuffle all clues
    const shuffledClues = shuffleArray(clues);

    console.log(`📝 [GENERATE-CLUES-V3] Generated ${shuffledClues.length} clues`);

    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < shuffledClues.length; i += batchSize) {
      const batch = shuffledClues.slice(i, i + batchSize);
      const { error } = await supabase.from('prize_clues').insert(batch);
      if (error) {
        console.error(`❌ [GENERATE-CLUES-V3] Error inserting batch ${i}:`, error);
        throw error;
      }
      console.log(`✅ [GENERATE-CLUES-V3] Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(shuffledClues.length/batchSize)} inserted`);
    }

    // Calculate stats
    const realClues = shuffledClues.filter(c => !c.is_fake);
    const fakeClues = shuffledClues.filter(c => c.is_fake);
    const locationClues = shuffledClues.filter(c => c.clue_category === 'location');
    const prizeClues = shuffledClues.filter(c => c.clue_category === 'prize');

    console.log('✅ [GENERATE-CLUES-V3] All 1200 clues saved successfully!');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated ${shuffledClues.length} intelligent clues for M1SSION`,
        breakdown: {
          total: shuffledClues.length,
          per_week: shuffledClues.length / 4,
          real_clues: realClues.length,
          fake_clues: fakeClues.length,
          real_percentage: ((realClues.length / shuffledClues.length) * 100).toFixed(1) + '%',
          fake_percentage: ((fakeClues.length / shuffledClues.length) * 100).toFixed(1) + '%',
          location_clues: locationClues.length,
          prize_clues: prizeClues.length,
          location_percentage: '50%',
          prize_percentage: '50%',
        },
        user_config: {
          max_unlockable: 250,
          weekly_progression: {
            week1: 45,
            week2: 55,
            week3: 70,
            week4: 80,
          }
        },
        sample_clues: shuffledClues.slice(0, 5).map(c => ({
          text: c.description_it,
          category: c.clue_category,
          is_fake: c.is_fake,
          week: c.week
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ [GENERATE-CLUES-V3] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
