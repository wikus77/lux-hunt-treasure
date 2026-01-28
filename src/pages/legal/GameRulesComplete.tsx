/**
 * M1SSION™ OFFICIAL GAME REGULATION
 * Regolamento Ufficiale del Gioco M1SSION™
 * Version 1.2 - December 2025
 * © 2025 NIYVORA KFT™ – Joseph MULÉ – All Rights Reserved
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  FileText, 
  Shield, 
  Target,
  MapPin,
  Trophy,
  Ban,
  Users,
  Lock,
  Scale,
  Globe,
  Mail,
  AlertTriangle,
  Compass,
  Zap,
  Award,
  UserX,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useLocation } from 'wouter';

type Language = 'it' | 'en';

const GameRulesComplete: React.FC = () => {
  const [, setLocation] = useLocation();
  const [language, setLanguage] = useState<Language>('it');

  const content = {
    it: {
      title: "Regolamento Ufficiale M1SSION™",
      subtitle: "Versione 1.2 – Dicembre 2025",
      lastUpdate: "Ultimo aggiornamento",
      sections: {
        art1: {
          title: "Art. 1 — Oggetto del Gioco",
          content: [
            "M1SSION™ è un gioco di abilità e investigazione (skill-based game) che consiste nella ricerca di premi reali attraverso l'interpretazione di indizi, l'analisi di coordinate geografiche e l'interazione con meccaniche di gioco basate interamente sulla logica e sulla deduzione.",
            "Il gioco NON è basato sulla fortuna, sulla casualità o su meccanismi RNG (Random Number Generator). Ogni elemento del gioco richiede abilità cognitive, strategia e capacità investigative.",
            "M1SSION™ è gestito e operato da NIYVORA KFT™, società registrata in Ungheria."
          ]
        },
        // 🏪 STORE COMPLIANCE: Updated anti-gambling clause
        antiGambling: {
          title: "⚠️ CLAUSOLA ANTI-GAMBLING — Gioco a Progressione Deterministica",
          warning: "DICHIARAZIONE IMPORTANTE",
          content: [
            "M1SSION™ è un GIOCO A PROGRESSIONE DETERMINISTICA (Skill & Progress Based).",
            "NON è un gioco d'azzardo. Utilizza un sistema di progressione a soglie e milestone, NON basato su casualità.",
            "La progressione dipende dall'impegno del giocatore: interazioni giornaliere, accumulo di punti progressione, raggiungimento di obiettivi specifici.",
            "Tutte le ricompense sono basate su soglie deterministiche. NON esiste uno stato di 'vincita' o 'perdita' — solo avanzamento progressivo.",
            "Le funzionalità come Ruota Progressione, Rivelazione Scratch e Percorso Biglietti sono sistemi di sblocco a obiettivi, NON giochi d'azzardo."
          ],
          prohibited: [
            "Scommesse o puntate in denaro reale",
            "Cash-out o conversione in denaro delle ricompense",
            "Prelievo di valute virtuali",
            "Trasferimento di M1U/PE ad altri utenti",
            "Qualsiasi forma di gambling, betting o estrazione casuale"
          ]
        },
        art2: {
          title: "Art. 2 — Modalità di Partecipazione",
          content: [
            "Per partecipare a M1SSION™ è necessario:",
            "• Avere almeno 18 anni di età",
            "• Registrare un account valido con email verificata",
            "• Accettare i presenti Termini, la Privacy Policy e il Regolamento",
            "• Sottoscrivere un abbonamento (gratuito o premium)",
            "È consentito UN SOLO account per persona fisica. Account multipli, condivisi o ceduti comportano squalifica immediata e permanente."
          ],
          subscriptions: {
            title: "Tipologie di Abbonamento:",
            free: {
              name: "FREE",
              features: [
                "Accesso base al gioco",
                "Numero limitato di indizi giornalieri",
                "1 BUZZ al giorno",
                "Funzionalità base"
              ]
            },
            premium: {
              name: "PREMIUM (Silver, Gold, Black, Titanium)",
              features: [
                "Maggior numero di indizi giornalieri e settimanali",
                "BUZZ multipli (in base al piano)",
                "Accesso a indizi esclusivi",
                "Funzionalità avanzate e priorità"
              ]
            }
          }
        },
        art3: {
          title: "Art. 3 — Tipologie di Premi e Trasparenza",
          content: [
            "M1SSION™ mette in palio PREMI REALI di alto valore, tra cui:",
            "• Automobili di lusso (es. Lamborghini, Ferrari, Porsche)",
            "• Orologi di prestigio (es. Rolex, Patek Philippe)",
            "• Borse firmate (es. Hermès Birkin)",
            "• Dispositivi tecnologici premium",
            "• Altri premi di valore",
            "",
            "Ogni missione prevede un sistema di 99 PREMI SECONDARI e 1 PREMIO PRINCIPALE.",
            "I premi secondari vengono assegnati ai giocatori che raggiungono determinati traguardi durante la missione.",
            "Il premio principale viene assegnato al PRIMO giocatore che risolve correttamente la missione."
          ],
          transparency: [
            "Tutti i premi sono reali e verificabili",
            "Le immagini dei premi sono a scopo illustrativo",
            "I premi sono soggetti a disponibilità e possono variare",
            "La consegna dei premi è subordinata alla verifica dell'identità del vincitore"
          ]
        },
        art4: {
          title: "Art. 4 — Indizi, BUZZ e Meccaniche di Gioco",
          buzz: {
            title: "Sistema BUZZ™",
            content: [
              "Il BUZZ è la meccanica principale di M1SSION™ per restringere l'area di ricerca.",
              "Ogni BUZZ effettuato riduce il raggio di ricerca basandosi sulle coordinate inviate dal giocatore.",
              "Il BUZZ NON influenza la vittoria finale — serve solo a guidare la ricerca.",
              "Il numero di BUZZ disponibili dipende dal tipo di abbonamento."
            ]
          },
          buzzMap: {
            title: "BUZZ MAPPA™",
            content: [
              "La funzione BUZZ MAPPA™ permette di visualizzare sulla mappa 3D le aree di ricerca.",
              "Mostra in tempo reale il raggio di ricerca attuale.",
              "NON rivela la posizione esatta del premio.",
              "È uno strumento di supporto alla strategia del giocatore."
            ]
          },
          clues: {
            title: "Sistema Indizi",
            content: [
              "Gli indizi vengono rilasciati giornalmente e settimanalmente.",
              "FREE: numero limitato di indizi base",
              "PREMIUM: accesso a più indizi, inclusi indizi esclusivi",
              "Gli indizi richiedono interpretazione e deduzione — non forniscono la soluzione diretta.",
              "È VIETATO condividere, vendere o divulgare gli indizi ad altri partecipanti."
            ]
          }
        },
        art5: {
          title: "Art. 5 — Modalità di Assegnazione Premi",
          content: [
            "Il PREMIO PRINCIPALE viene assegnato al PRIMO giocatore che:",
            "• Individua le coordinate esatte del premio",
            "• Invia la soluzione corretta tramite il sistema BUZZ",
            "• Viene validato dal sistema automatico",
            "",
            "In caso di EX AEQUO (più giocatori inviano la soluzione corretta nello stesso istante):",
            "• Vince chi ha inviato per PRIMO (timestamp del server)",
            "• In caso di parità assoluta, il premio viene diviso equamente",
            "",
            "I PREMI SECONDARI (99 premi) vengono assegnati secondo criteri di merito:",
            "• Progressione nella missione",
            "• Traguardi raggiunti",
            "• Partecipazione attiva"
          ],
          verification: {
            title: "Verifica Vincitore",
            steps: [
              "Validazione automatica della soluzione",
              "Verifica dell'identità del vincitore (documento d'identità)",
              "Controllo anti-frode e anti-bot",
              "Verifica unicità account",
              "Conferma dati di spedizione"
            ]
          }
        },
        art6: {
          title: "Art. 6 — Comportamenti Vietati e Responsabilità Utente",
          prohibited: [
            "Utilizzo di bot, script automatici o software di automazione",
            "Creazione di account multipli o account fake",
            "Condivisione, vendita o divulgazione di indizi ad altri partecipanti",
            "Collaborazione illecita tra più giocatori",
            "Tentativi di hacking, manipolazione o alterazione del gioco",
            "Utilizzo di VPN o sistemi per mascherare la propria identità/posizione",
            "Qualsiasi forma di cheating o comportamento fraudolento"
          ],
          consequences: [
            "Squalifica immediata e permanente",
            "Annullamento di eventuali premi vinti",
            "Ban dell'account senza rimborso",
            "Possibili azioni legali in caso di danni"
          ]
        },
        art7: {
          title: "Art. 7 — Privacy, Consensi e GDPR",
          content: [
            "La raccolta e il trattamento dei dati personali avviene in conformità al GDPR (Regolamento UE 2016/679) e alla normativa ungherese sulla protezione dei dati.",
            "Per i dettagli completi, consultare la Privacy Policy disponibile nell'app.",
            "I dati di geolocalizzazione sono utilizzati ESCLUSIVAMENTE per le meccaniche di gioco e non vengono condivisi con terze parti per fini commerciali.",
            "L'utente può esercitare i propri diritti (accesso, rettifica, cancellazione, portabilità) contattando: contact@m1ssion.com"
          ]
        },
        art8: {
          title: "Art. 8 — Recesso e Cancellazione Account",
          content: [
            "L'utente può cancellare il proprio account in qualsiasi momento dalle Impostazioni dell'app.",
            "La cancellazione comporta la perdita di tutti i progressi, indizi e dati associati.",
            "Gli abbonamenti premium possono essere disdetti secondo le policy dell'App Store/Play Store.",
            "Non sono previsti rimborsi per abbonamenti già attivati, salvo quanto previsto dalla legge."
          ]
        },
        art9: {
          title: "Art. 9 — Proprietà Intellettuale",
          content: [
            "M1SSION™, il logo, il brand, i contenuti, le grafiche, il codice e tutti gli elementi dell'applicazione sono di proprietà esclusiva di NIYVORA KFT™.",
            "È vietata qualsiasi riproduzione, distribuzione, modifica o utilizzo non autorizzato.",
            "I marchi citati (Lamborghini, Ferrari, Rolex, Hermès, etc.) appartengono ai rispettivi proprietari e sono usati a scopo illustrativo."
          ]
        },
        art10: {
          title: "Art. 10 — Limitazioni di Responsabilità",
          content: [
            "NIYVORA KFT™ non è responsabile per:",
            "• Malfunzionamenti tecnici, interruzioni del servizio o problemi di connettività",
            "• Perdita di dati dovuta a cause esterne",
            "• Danni derivanti dall'uso improprio dell'applicazione",
            "• Comportamenti illegali o pericolosi degli utenti durante l'utilizzo di funzioni basate sulla geolocalizzazione",
            "",
            "L'utente è l'unico responsabile della propria sicurezza fisica durante l'utilizzo dell'app."
          ]
        },
        art11: {
          title: "Art. 11 — Giurisdizione e Foro Competente",
          content: [
            "Il presente Regolamento è regolato dalla legge ungherese.",
            "Per qualsiasi controversia, il Foro competente è quello di Budapest, Ungheria.",
            "NIYVORA KFT™ si riserva il diritto di modificare il presente Regolamento in qualsiasi momento, con effetto immediato dalla pubblicazione nell'app."
          ]
        }
      },
      footer: {
        company: "NIYVORA KFT™",
        location: "Budapest, Ungheria",
        email: "contact@m1ssion.com",
        version: "Versione 1.2",
        copyright: "© 2025 M1SSION™ – Tutti i diritti riservati"
      }
    },
    en: {
      title: "M1SSION™ Official Game Regulation",
      subtitle: "Version 1.2 – December 2025",
      lastUpdate: "Last updated",
      sections: {
        art1: {
          title: "Art. 1 — Purpose of the Game",
          content: [
            "M1SSION™ is a skill-based investigation game that consists of searching for real prizes through the interpretation of clues, analysis of geographic coordinates, and interaction with game mechanics based entirely on logic and deduction.",
            "The game is NOT based on luck, chance, or RNG (Random Number Generator) mechanisms. Every element of the game requires cognitive skills, strategy, and investigative abilities.",
            "M1SSION™ is managed and operated by NIYVORA KFT™, a company registered in Hungary."
          ]
        },
        antiGambling: {
          title: "⚠️ ANTI-GAMBLING CLAUSE — Pure Skill-Based Game",
          warning: "IMPORTANT STATEMENT",
          content: [
            "M1SSION™ is a PURE SKILL-BASED GAME (Skill-Based Game Only).",
            "It is NOT gambling. It does NOT use chance mechanisms, lotteries, random draws, slot machines, wheels of fortune, or any other system based on luck or chance.",
            "Victory depends EXCLUSIVELY on the player's cognitive abilities: interpretation of clues, logical deduction, coordinate analysis, resolution speed.",
            "No element of the game is determined by RNG (Random Number Generator) or random systems."
          ],
          prohibited: [
            "Real money bets or wagers",
            "Luck or chance mechanisms",
            "Wheels of fortune or daily spins with random prizes",
            "Random draws or lotteries",
            "Any form of gambling or betting"
          ]
        },
        art2: {
          title: "Art. 2 — Participation Requirements",
          content: [
            "To participate in M1SSION™, you must:",
            "• Be at least 18 years old",
            "• Register a valid account with verified email",
            "• Accept these Terms, Privacy Policy, and Regulation",
            "• Subscribe to a plan (free or premium)",
            "Only ONE account per natural person is allowed. Multiple, shared, or transferred accounts result in immediate and permanent disqualification."
          ],
          subscriptions: {
            title: "Subscription Types:",
            free: {
              name: "FREE",
              features: [
                "Basic game access",
                "Limited daily clues",
                "1 BUZZ per day",
                "Basic features"
              ]
            },
            premium: {
              name: "PREMIUM (Silver, Gold, Black, Titanium)",
              features: [
                "More daily and weekly clues",
                "Multiple BUZZes (depending on plan)",
                "Access to exclusive clues",
                "Advanced features and priority"
              ]
            }
          }
        },
        art3: {
          title: "Art. 3 — Prize Types and Transparency",
          content: [
            "M1SSION™ offers REAL high-value PRIZES, including:",
            "• Luxury cars (e.g., Lamborghini, Ferrari, Porsche)",
            "• Prestigious watches (e.g., Rolex, Patek Philippe)",
            "• Designer bags (e.g., Hermès Birkin)",
            "• Premium tech devices",
            "• Other valuable prizes",
            "",
            "Each mission features a system of 99 SECONDARY PRIZES and 1 MAIN PRIZE.",
            "Secondary prizes are awarded to players who reach certain milestones during the mission.",
            "The main prize is awarded to the FIRST player who correctly solves the mission."
          ],
          transparency: [
            "All prizes are real and verifiable",
            "Prize images are for illustrative purposes",
            "Prizes are subject to availability and may vary",
            "Prize delivery is subject to winner identity verification"
          ]
        },
        art4: {
          title: "Art. 4 — Clues, BUZZ and Game Mechanics",
          buzz: {
            title: "BUZZ™ System",
            content: [
              "BUZZ is M1SSION™'s main mechanic to narrow down the search area.",
              "Each BUZZ reduces the search radius based on coordinates sent by the player.",
              "BUZZ does NOT influence the final victory — it only guides the search.",
              "The number of available BUZZes depends on the subscription type."
            ]
          },
          buzzMap: {
            title: "BUZZ MAP™",
            content: [
              "The BUZZ MAP™ feature allows viewing search areas on the 3D map.",
              "Shows the current search radius in real time.",
              "Does NOT reveal the exact prize location.",
              "It's a support tool for the player's strategy."
            ]
          },
          clues: {
            title: "Clue System",
            content: [
              "Clues are released daily and weekly.",
              "FREE: limited number of basic clues",
              "PREMIUM: access to more clues, including exclusive ones",
              "Clues require interpretation and deduction — they don't provide the direct solution.",
              "It is FORBIDDEN to share, sell, or disclose clues to other participants."
            ]
          }
        },
        art5: {
          title: "Art. 5 — Prize Award Methods",
          content: [
            "The MAIN PRIZE is awarded to the FIRST player who:",
            "• Identifies the exact prize coordinates",
            "• Sends the correct solution through the BUZZ system",
            "• Is validated by the automatic system",
            "",
            "In case of TIE (multiple players send the correct solution at the same time):",
            "• The one who sent FIRST wins (server timestamp)",
            "• In case of absolute tie, the prize is divided equally",
            "",
            "SECONDARY PRIZES (99 prizes) are awarded based on merit criteria:",
            "• Mission progression",
            "• Milestones reached",
            "• Active participation"
          ],
          verification: {
            title: "Winner Verification",
            steps: [
              "Automatic solution validation",
              "Winner identity verification (ID document)",
              "Anti-fraud and anti-bot check",
              "Account uniqueness verification",
              "Shipping data confirmation"
            ]
          }
        },
        art6: {
          title: "Art. 6 — Prohibited Behaviors and User Responsibility",
          prohibited: [
            "Use of bots, automated scripts, or automation software",
            "Creation of multiple accounts or fake accounts",
            "Sharing, selling, or disclosing clues to other participants",
            "Illicit collaboration between multiple players",
            "Hacking attempts, manipulation, or game alteration",
            "Use of VPN or systems to mask identity/location",
            "Any form of cheating or fraudulent behavior"
          ],
          consequences: [
            "Immediate and permanent disqualification",
            "Cancellation of any prizes won",
            "Account ban without refund",
            "Possible legal action in case of damages"
          ]
        },
        art7: {
          title: "Art. 7 — Privacy, Consent and GDPR",
          content: [
            "The collection and processing of personal data is carried out in compliance with GDPR (EU Regulation 2016/679) and Hungarian data protection legislation.",
            "For complete details, see the Privacy Policy available in the app.",
            "Geolocation data is used EXCLUSIVELY for game mechanics and is not shared with third parties for commercial purposes.",
            "Users can exercise their rights (access, rectification, deletion, portability) by contacting: contact@m1ssion.com"
          ]
        },
        art8: {
          title: "Art. 8 — Withdrawal and Account Deletion",
          content: [
            "Users can delete their account at any time from the app Settings.",
            "Deletion results in the loss of all progress, clues, and associated data.",
            "Premium subscriptions can be canceled according to App Store/Play Store policies.",
            "No refunds are provided for already activated subscriptions, except as required by law."
          ]
        },
        art9: {
          title: "Art. 9 — Intellectual Property",
          content: [
            "M1SSION™, the logo, brand, content, graphics, code, and all application elements are the exclusive property of NIYVORA KFT™.",
            "Any unauthorized reproduction, distribution, modification, or use is prohibited.",
            "Referenced trademarks (Lamborghini, Ferrari, Rolex, Hermès, etc.) belong to their respective owners and are used for illustrative purposes."
          ]
        },
        art10: {
          title: "Art. 10 — Limitation of Liability",
          content: [
            "NIYVORA KFT™ is not responsible for:",
            "• Technical malfunctions, service interruptions, or connectivity issues",
            "• Data loss due to external causes",
            "• Damages resulting from improper use of the application",
            "• Illegal or dangerous user behavior while using geolocation-based features",
            "",
            "The user is solely responsible for their physical safety while using the app."
          ]
        },
        art11: {
          title: "Art. 11 — Jurisdiction and Competent Court",
          content: [
            "This Regulation is governed by Hungarian law.",
            "For any dispute, the competent court is that of Budapest, Hungary.",
            "NIYVORA KFT™ reserves the right to modify this Regulation at any time, effective immediately upon publication in the app."
          ]
        }
      },
      footer: {
        company: "NIYVORA KFT™",
        location: "Budapest, Hungary",
        email: "contact@m1ssion.com",
        version: "Version 1.2",
        copyright: "© 2025 M1SSION™ – All Rights Reserved"
      }
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#131524] via-[#0F1419] to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => window.history.back()}
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-orbitron font-bold text-white">{t.title}</h1>
                <p className="text-white/70">{t.subtitle}</p>
              </div>
            </div>
            
            {/* Language Toggle */}
            <div className="flex items-center space-x-2 bg-black/30 rounded-full p-1">
              <Button
                onClick={() => setLanguage('it')}
                variant={language === 'it' ? 'default' : 'ghost'}
                size="sm"
                className={`rounded-full ${language === 'it' ? 'bg-[#00D1FF] text-black' : 'text-white/70 hover:text-white'}`}
              >
                🇮🇹 IT
              </Button>
              <Button
                onClick={() => setLanguage('en')}
                variant={language === 'en' ? 'default' : 'ghost'}
                size="sm"
                className={`rounded-full ${language === 'en' ? 'bg-[#00D1FF] text-black' : 'text-white/70 hover:text-white'}`}
              >
                🇬🇧 EN
              </Button>
            </div>
          </div>

          {/* Art. 1 - Oggetto del Gioco */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Target className="w-5 h-5 mr-2 text-[#00D1FF]" />
                {t.sections.art1.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              {t.sections.art1.content.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </CardContent>
          </Card>

          {/* ANTI-GAMBLING CLAUSE */}
          <Card className="bg-black/40 border-red-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Ban className="w-5 h-5 mr-2 text-red-400" />
                {t.sections.antiGambling.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                <p className="text-red-300 font-semibold mb-2">⚠️ {t.sections.antiGambling.warning}</p>
                {t.sections.antiGambling.content.map((text, i) => (
                  <p key={i} className="text-white/80 mb-2">{text}</p>
                ))}
              </div>
              
              <div className="space-y-2">
                <p className="font-semibold text-red-300">{language === 'it' ? 'M1SSION™ NON include:' : 'M1SSION™ does NOT include:'}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                  {t.sections.antiGambling.prohibited.map((item, i) => (
                    <li key={i}>❌ {item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Art. 2 - Modalità di Partecipazione */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Users className="w-5 h-5 mr-2 text-[#00D1FF]" />
                {t.sections.art2.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              {t.sections.art2.content.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
              
              <div className="mt-4">
                <h4 className="text-[#00D1FF] font-semibold mb-3">{t.sections.art2.subscriptions.title}</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                    <h5 className="text-white font-semibold mb-2">{t.sections.art2.subscriptions.free.name}</h5>
                    <ul className="space-y-1 text-white/70 text-sm">
                      {t.sections.art2.subscriptions.free.features.map((f, i) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg border border-[#00D1FF]/20">
                    <h5 className="text-[#00D1FF] font-semibold mb-2">{t.sections.art2.subscriptions.premium.name}</h5>
                    <ul className="space-y-1 text-white/70 text-sm">
                      {t.sections.art2.subscriptions.premium.features.map((f, i) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Art. 3 - Premi */}
          <Card className="bg-black/40 border-yellow-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                {t.sections.art3.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              {t.sections.art3.content.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
              
              <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30 mt-4">
                <p className="text-yellow-300 font-semibold mb-2">{language === 'it' ? 'Trasparenza Premi:' : 'Prize Transparency:'}</p>
                <ul className="space-y-1 text-white/80 text-sm">
                  {t.sections.art3.transparency.map((item, i) => (
                    <li key={i}>✓ {item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Art. 4 - BUZZ e Meccaniche */}
          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Zap className="w-5 h-5 mr-2 text-purple-400" />
                {t.sections.art4.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-white/90 leading-relaxed">
              {/* BUZZ System */}
              <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
                <h4 className="text-purple-300 font-semibold mb-2 flex items-center">
                  <Compass className="w-4 h-4 mr-2" />
                  {t.sections.art4.buzz.title}
                </h4>
                {t.sections.art4.buzz.content.map((text, i) => (
                  <p key={i} className="text-white/80 mb-1">{text}</p>
                ))}
              </div>
              
              {/* BUZZ MAP */}
              <div className="bg-[#00D1FF]/10 p-4 rounded-lg border border-[#00D1FF]/20">
                <h4 className="text-[#00D1FF] font-semibold mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {t.sections.art4.buzzMap.title}
                </h4>
                {t.sections.art4.buzzMap.content.map((text, i) => (
                  <p key={i} className="text-white/80 mb-1">{text}</p>
                ))}
              </div>
              
              {/* Clue System */}
              <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                <h4 className="text-white font-semibold mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  {t.sections.art4.clues.title}
                </h4>
                {t.sections.art4.clues.content.map((text, i) => (
                  <p key={i} className="text-white/80 mb-1">{text}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Art. 5 - Assegnazione Premi */}
          <Card className="bg-black/40 border-green-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Award className="w-5 h-5 mr-2 text-green-400" />
                {t.sections.art5.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              {t.sections.art5.content.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
              
              <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/20 mt-4">
                <h4 className="text-green-300 font-semibold mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t.sections.art5.verification.title}
                </h4>
                <ol className="space-y-1 text-white/80 text-sm list-decimal list-inside">
                  {t.sections.art5.verification.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Art. 6 - Comportamenti Vietati */}
          <Card className="bg-black/40 border-red-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <UserX className="w-5 h-5 mr-2 text-red-400" />
                {t.sections.art6.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <div>
                <p className="font-semibold mb-2">{language === 'it' ? 'Comportamenti VIETATI:' : 'PROHIBITED Behaviors:'}</p>
                <ul className="space-y-1 text-white/80">
                  {t.sections.art6.prohibited.map((item, i) => (
                    <li key={i}>❌ {item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/20 mt-4">
                <p className="text-red-300 font-semibold mb-2">{language === 'it' ? 'Conseguenze:' : 'Consequences:'}</p>
                <ul className="space-y-1 text-white/80 text-sm">
                  {t.sections.art6.consequences.map((item, i) => (
                    <li key={i}>⚠️ {item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Art. 7 - Privacy */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Lock className="w-5 h-5 mr-2 text-[#00D1FF]" />
                {t.sections.art7.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              {t.sections.art7.content.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </CardContent>
          </Card>

          {/* Art. 8 - Recesso */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Clock className="w-5 h-5 mr-2 text-[#00D1FF]" />
                {t.sections.art8.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              {t.sections.art8.content.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </CardContent>
          </Card>

          {/* Art. 9 - Proprietà Intellettuale */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Shield className="w-5 h-5 mr-2 text-[#00D1FF]" />
                {t.sections.art9.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              {t.sections.art9.content.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </CardContent>
          </Card>

          {/* Art. 10 - Limitazioni */}
          <Card className="bg-black/40 border-orange-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
                {t.sections.art10.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              {t.sections.art10.content.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </CardContent>
          </Card>

          {/* Art. 11 - Giurisdizione */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Scale className="w-5 h-5 mr-2 text-[#00D1FF]" />
                {t.sections.art11.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              {t.sections.art11.content.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="pt-6 border-t border-white/10 text-center text-white/60">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Globe className="w-4 h-4" />
              <span>{t.footer.company}</span>
              <span>–</span>
              <span>{t.footer.location}</span>
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Mail className="w-4 h-4" />
              <a href="mailto:contact@m1ssion.com" className="text-[#00D1FF] hover:underline">
                {t.footer.email}
              </a>
            </div>
            <p className="text-sm">{t.footer.version}</p>
            <p className="text-sm mt-1">{t.footer.copyright}</p>
            <p className="text-xs mt-2 text-white/40">
              {t.lastUpdate}: {new Date().toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button
              onClick={() => setLocation('/privacy-policy')}
              variant="ghost"
              size="sm"
              className="text-[#00D1FF] hover:bg-[#00D1FF]/10"
            >
              Privacy Policy
            </Button>
            <Button
              onClick={() => setLocation('/terms')}
              variant="ghost"
              size="sm"
              className="text-[#00D1FF] hover:bg-[#00D1FF]/10"
            >
              {language === 'it' ? 'Termini di Servizio' : 'Terms of Service'}
            </Button>
            <Button
              onClick={() => setLocation('/cookie-policy')}
              variant="ghost"
              size="sm"
              className="text-[#00D1FF] hover:bg-[#00D1FF]/10"
            >
              Cookie Policy
            </Button>
            <Button
              onClick={() => setLocation('/policies')}
              variant="ghost"
              size="sm"
              className="text-[#00D1FF] hover:bg-[#00D1FF]/10"
            >
              Policies
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GameRulesComplete;

