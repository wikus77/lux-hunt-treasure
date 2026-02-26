// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Legale - Section Modal Content (Revolut-style glass design)
// Now with full legal content and IT/EN language switcher
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { X, FileText, Shield, Settings, Copyright, Award, ExternalLink, Trash2, ChevronRight, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { SettingsSectionFlipOverlay } from '../SettingsSectionFlipOverlay';
import { DeleteAccountModal } from '@/components/m1units/DeleteAccountModal';

interface LegalSectionContentProps {
  onClose: () => void;
}

interface LegalLink {
  id: string;
  title: string;
  titleEn: string;
  titleFr: string;
  description: string;
  descriptionEn: string;
  descriptionFr: string;
  icon: React.ElementType;
  color: string;
}

type Language = 'it' | 'en' | 'fr';

const LegalSectionContent: React.FC<LegalSectionContentProps> = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.substring(0, 2) || 'en'; // 'en' | 'it' | 'fr'
  const { user } = useAuth();
  const { toast } = useToast();
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State per document modal
  const [openDocument, setOpenDocument] = useState<LegalLink | null>(null);
  const [documentOriginRect, setDocumentOriginRect] = useState<DOMRect | null>(null);

  const legalLinks: LegalLink[] = [
    { id: 'terms', title: 'Termini di Servizio', titleEn: 'Terms of Service', titleFr: 'Conditions d\'Utilisation', description: "Condizioni d'uso dell'applicazione", descriptionEn: 'Application usage conditions', descriptionFr: 'Conditions d\'utilisation de l\'application', icon: FileText, color: '#00D1FF' },
    { id: 'privacy', title: 'Privacy Policy', titleEn: 'Privacy Policy', titleFr: 'Politique de Confidentialité', description: 'Come raccogliamo e utilizziamo i tuoi dati', descriptionEn: 'How we collect and use your data', descriptionFr: 'Comment nous collectons et utilisons vos données', icon: Shield, color: '#22C55E' },
    { id: 'cookie', title: 'Cookie Policy', titleEn: 'Cookie Policy', titleFr: 'Politique des Cookies', description: 'Come utilizziamo i cookie', descriptionEn: 'How we use cookies', descriptionFr: 'Comment nous utilisons les cookies', icon: Settings, color: '#F59E0B' },
    { id: 'rules', title: 'Regolamento M1SSION™', titleEn: 'M1SSION™ Rules', titleFr: 'Règlement M1SSION™', description: 'Modalità di gioco, premi, meccaniche', descriptionEn: 'Gameplay, prizes, mechanics', descriptionFr: 'Règles du jeu, prix, mécaniques', icon: FileText, color: '#A855F7' },
    { id: 'policies', title: 'Game Policies', titleEn: 'Game Policies', titleFr: 'Politiques du Jeu', description: 'Disclaimers, virtual currencies', descriptionEn: 'Disclaimers, virtual currencies', descriptionFr: 'Avertissements, monnaies virtuelles', icon: Shield, color: '#EF4444' },
    { id: 'safecreative', title: 'SafeCreative', titleEn: 'SafeCreative', titleFr: 'SafeCreative', description: 'Certificazione proprietà intellettuale', descriptionEn: 'Intellectual property certification', descriptionFr: 'Certification de propriété intellectuelle', icon: Copyright, color: '#EC4899' },
    { id: 'euipo', title: 'EUIPO – Marchio Registrato', titleEn: 'EUIPO – Registered Trademark', titleFr: 'EUIPO – Marque Déposée', description: 'Registrazione marchio EU', descriptionEn: 'EU trademark registration', descriptionFr: 'Enregistrement de marque UE', icon: Award, color: '#6366F1' },
  ];

  // Helper per ottenere titolo/descrizione nella lingua corrente
  const getLinkTitle = (link: LegalLink) => {
    if (currentLang === 'fr') return link.titleFr;
    if (currentLang === 'en') return link.titleEn;
    return link.title; // default IT
  };
  const getLinkDescription = (link: LegalLink) => {
    if (currentLang === 'fr') return link.descriptionFr;
    if (currentLang === 'en') return link.descriptionEn;
    return link.description; // default IT
  };

  const openDocumentModal = (link: LegalLink, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDocumentOriginRect(rect);
    setOpenDocument(link);
  };

  const openDeleteModal = (e: React.MouseEvent<HTMLElement>) => {
    setDeleteOriginRect(e.currentTarget.getBoundingClientRect());
    setDeleteModalOpen(true);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {/* HEADER */}
      <div style={{
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(236, 72, 153, 0.8) 0%, rgba(150, 40, 100, 0.6) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
        paddingBottom: '20px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
          </button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>{t('legal_title')}</h1>
          </div>
          <div style={{ width: '40px' }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>{t('legal_subtitle')}</p>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Legal Documents */}
        <GlassCard style={{ marginBottom: '16px', padding: 0 }}>
          {legalLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={(e) => openDocumentModal(link, e)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: index === legalLinks.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', borderRadius: '12px', background: `${link.color}20` }}>
                    <Icon style={{ width: '20px', height: '20px', color: link.color }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{getLinkTitle(link)}</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{getLinkDescription(link)}</p>
                  </div>
                </div>
                <ChevronRight style={{ width: '18px', height: '18px', color: 'rgba(255,255,255,0.3)' }} />
              </button>
            );
          })}
        </GlassCard>

        {/* App Info */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>{t('app_information')}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <InfoBox label={t('version')} value="2.1.0" />
            <InfoBox label={t('build')} value="2025.12.05" />
            <InfoBox label={t('developer')} value="NIYVORA KFT™" />
            <InfoBox label={t('copyright')} value="M1SSION™ 2025" />
          </div>

          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: 'rgba(0, 209, 255, 0.1)', border: '1px solid rgba(0, 209, 255, 0.2)' }}>
            <p style={{ color: '#00D1FF', fontSize: '12px' }}>
              {t('official_app_notice')}
            </p>
          </div>
        </GlassCard>

        {/* Contact */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '12px' }}>
              {t('need_help_question')}
            </p>
            <button
              onClick={() => window.location.href = 'mailto:contact@m1ssion.com?subject=M1SSION%20Support'}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'rgba(0, 209, 255, 0.15)',
                border: '1px solid rgba(0, 209, 255, 0.3)',
                color: '#00D1FF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('contact_support')}
            </button>
          </div>
        </GlassCard>

        {/* Danger Zone — Delete Account (in-app self-service, Apple 5.1.1 compliant) */}
        <GlassCard style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Trash2 style={{ width: '20px', height: '20px', color: '#EF4444' }} />
            <span style={{ color: '#EF4444', fontSize: '16px', fontWeight: 600 }}>{t('danger_zone')}</span>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '12px' }}>
            {t('delete_account_desc_in_app')}
          </p>

          <button
            onClick={openDeleteModal}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('delete_account_permanently')}
          </button>
        </GlassCard>
      </div>

      {/* Legal Document Modal */}
      {openDocument && (
        <SettingsSectionFlipOverlay
          open={openDocument !== null}
          originRect={documentOriginRect}
          onClose={() => setOpenDocument(null)}
        >
          <LegalDocumentModalContent 
            documentId={openDocument.id}
            document={openDocument} 
            onClose={() => setOpenDocument(null)} 
          />
        </SettingsSectionFlipOverlay>
      )}

      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        originRect={deleteOriginRect}
      />
    </div>
  );
};

// Legal Document Modal Content with Language Switcher
const LegalDocumentModalContent: React.FC<{ documentId: string; document: LegalLink; onClose: () => void }> = ({ documentId, document, onClose }) => {
  const [lang, setLang] = useState<Language>('it');
  const Icon = document.icon;

  const getTitle = () => {
    if (lang === 'fr') return document.titleFr;
    if (lang === 'en') return document.titleEn;
    return document.title;
  };
  const getDescription = () => {
    if (lang === 'fr') return document.descriptionFr;
    if (lang === 'en') return document.descriptionEn;
    return document.description;
  };
  const title = getTitle();
  const description = getDescription();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {/* HEADER with Language Switcher */}
      <div style={{
        flexShrink: 0,
        background: `linear-gradient(180deg, ${document.color}CC 0%, ${document.color}66 100%)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
        paddingBottom: '20px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
          </button>
          
          {/* Language Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', padding: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setLang('it')}
              style={{
                padding: '6px 10px',
                borderRadius: '16px',
                border: 'none',
                background: lang === 'it' ? '#00D1FF' : 'transparent',
                color: lang === 'it' ? '#000' : 'rgba(255,255,255,0.6)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🇮🇹
            </button>
            <button
              onClick={() => setLang('en')}
              style={{
                padding: '6px 10px',
                borderRadius: '16px',
                border: 'none',
                background: lang === 'en' ? '#00D1FF' : 'transparent',
                color: lang === 'en' ? '#000' : 'rgba(255,255,255,0.6)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🇬🇧
            </button>
            <button
              onClick={() => setLang('fr')}
              style={{
                padding: '6px 10px',
                borderRadius: '16px',
                border: 'none',
                background: lang === 'fr' ? '#00D1FF' : 'transparent',
                color: lang === 'fr' ? '#000' : 'rgba(255,255,255,0.6)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🇫🇷
            </button>
          </div>
          
          <div style={{ width: '40px' }} />
        </div>
        <h1 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 700, letterSpacing: '1px', textAlign: 'center' }}>
          {title.toUpperCase()}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center', marginTop: '4px' }}>{description}</p>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)', WebkitOverflowScrolling: 'touch' }}>
        {renderDocumentContent(documentId, lang)}
      </div>
    </div>
  );
};

// Render document content based on ID
const renderDocumentContent = (documentId: string, lang: Language) => {
  switch (documentId) {
    case 'terms':
      return <TermsContent lang={lang} />;
    case 'privacy':
      return <PrivacyContent lang={lang} />;
    case 'cookie':
      return <CookieContent lang={lang} />;
    case 'rules':
      return <GameRulesContent lang={lang} />;
    case 'policies':
      return <PoliciesContent lang={lang} />;
    case 'safecreative':
      return <SafeCreativeContent lang={lang} />;
    case 'euipo':
      return <EuipoContent lang={lang} />;
    default:
      return <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>Documento non disponibile</div>;
  }
};

// ============ TERMS CONTENT ============
const TermsContent: React.FC<{ lang: Language }> = ({ lang }) => {
  const contentByLang = {
    it: {
      title: "Termini e Condizioni d'Uso",
      lastUpdate: "Ultimo aggiornamento: 5 Dicembre 2025",
      sections: [
        { title: "1. Oggetto del Servizio", content: "I presenti Termini e Condizioni (\"Termini\") regolano l'accesso e l'utilizzo dell'applicazione M1SSION™, di proprietà di NIYVORA KFT™. Utilizzando l'applicazione, l'Utente accetta integralmente questi Termini." },
        { title: "2. Requisiti di Accesso", content: "Per utilizzare M1SSION™, l'Utente deve: avere almeno 13 anni di età, fornire informazioni accurate durante la registrazione, mantenere la riservatezza delle credenziali, utilizzare un solo account personale." },
        { title: "3. Servizi di Gioco", content: "M1SSION™ offre: Buzz Map (mappa 3D interattiva), Missioni (sfide fisiche e digitali), Indizi (elementi narrativi), Classifiche, Premi, Community e AION (assistente AI)." },
        { title: "4. Valute Virtuali", content: "M1U e PE sono valute virtuali senza valore monetario reale. NON sono scambiabili, vendibili o convertibili in valuta legale. NON sono rimborsabili." },
        { title: "5. Pulse Breaker", content: "Pulse Breaker è un mini-gioco di PURO INTRATTENIMENTO. NON è un gioco d'azzardo. Le puntate avvengono SOLO con valute virtuali. NON esiste possibilità di prelievo o conversione in denaro." },
        { title: "6. Divieti", content: "È vietato: utilizzare l'app per attività illegali, violare proprietà private, condividere/vendere account, creare account multipli, hackerare l'applicazione, usare bot/script, manipolare classifiche." },
        { title: "7. Proprietà Intellettuale", content: "Tutti i contenuti di M1SSION™ sono di esclusiva proprietà di Joseph Mulé e NIYVORA KFT™, protetti dalle leggi sul copyright." },
        { title: "8. Limitazione Responsabilità", content: "M1SSION™ è fornito \"così com'è\". L'Utente è responsabile della propria sicurezza durante le missioni fisiche." },
        { title: "9. Privacy e AION", content: "La raccolta dati è regolata dalla Privacy Policy. AION elabora dati per fornire assistenza contestuale." },
        { title: "10. Modifiche", content: "NIYVORA KFT™ si riserva il diritto di modificare Termini, funzionalità e meccaniche di gioco in qualsiasi momento." },
        { title: "11. Giurisdizione", content: "Termini regolati dalla legge italiana. Foro competente: Tribunale di Milano." },
        { title: "12. Contatti", content: "Per comunicazioni legali: legal@m1ssion.app | NIYVORA KFT™, Budapest, Hungary" }
      ]
    },
    en: {
      title: "Terms and Conditions of Use",
      lastUpdate: "Last updated: December 5, 2025",
      sections: [
        { title: "1. Subject Matter", content: "These Terms and Conditions (\"Terms\") govern access to and use of the M1SSION™ application, owned by NIYVORA KFT™. By using the application, the User fully accepts these Terms." },
        { title: "2. Access Requirements", content: "To use M1SSION™, the User must: be at least 13 years old, provide accurate information during registration, maintain credential confidentiality, use only one personal account." },
        { title: "3. Gaming Services", content: "M1SSION™ offers: Buzz Map (interactive 3D map), Missions (physical and digital challenges), Clues (narrative elements), Leaderboards, Prizes, Community and AION (AI assistant)." },
        { title: "4. Virtual Currencies", content: "M1U and PE are virtual currencies with no real monetary value. They are NOT exchangeable, sellable or convertible to legal currency. They are NOT refundable." },
        { title: "5. Pulse Breaker", content: "Pulse Breaker is a PURELY ENTERTAINMENT mini-game. It is NOT gambling. Bets are made ONLY with virtual currencies. There is NO possibility of withdrawal or conversion to money." },
        { title: "6. Prohibitions", content: "It is prohibited to: use the app for illegal activities, trespass on private property, share/sell accounts, create multiple accounts, hack the application, use bots/scripts, manipulate leaderboards." },
        { title: "7. Intellectual Property", content: "All M1SSION™ content is the exclusive property of Joseph Mulé and NIYVORA KFT™, protected by copyright laws." },
        { title: "8. Limitation of Liability", content: "M1SSION™ is provided \"as is\". The User is responsible for their own safety during physical missions." },
        { title: "9. Privacy and AION", content: "Data collection is governed by the Privacy Policy. AION processes data to provide contextual assistance." },
        { title: "10. Changes", content: "NIYVORA KFT™ reserves the right to modify Terms, features and game mechanics at any time." },
        { title: "11. Jurisdiction", content: "Terms governed by Italian law. Exclusive jurisdiction: Court of Milan." },
        { title: "12. Contacts", content: "For legal communications: legal@m1ssion.app | NIYVORA KFT™, Budapest, Hungary" }
      ]
    },
    fr: {
      title: "Conditions Générales d'Utilisation",
      lastUpdate: "Dernière mise à jour : 5 décembre 2025",
      sections: [
        { title: "1. Objet du Service", content: "Les présentes Conditions Générales (\"Conditions\") régissent l'accès et l'utilisation de l'application M1SSION™, propriété de NIYVORA KFT™. En utilisant l'application, l'Utilisateur accepte intégralement ces Conditions." },
        { title: "2. Conditions d'Accès", content: "Pour utiliser M1SSION™, l'Utilisateur doit : avoir au moins 13 ans, fournir des informations exactes lors de l'inscription, maintenir la confidentialité de ses identifiants, n'utiliser qu'un seul compte personnel." },
        { title: "3. Services de Jeu", content: "M1SSION™ offre : Buzz Map (carte 3D interactive), Missions (défis physiques et numériques), Indices (éléments narratifs), Classements, Prix, Communauté et AION (assistant IA)." },
        { title: "4. Monnaies Virtuelles", content: "M1U et PE sont des monnaies virtuelles sans valeur monétaire réelle. Elles ne sont PAS échangeables, vendables ou convertibles en monnaie légale. Elles ne sont PAS remboursables." },
        { title: "5. Pulse Breaker", content: "Pulse Breaker est un mini-jeu de DIVERTISSEMENT PUR. Ce n'est PAS un jeu de hasard. Les mises se font UNIQUEMENT avec des monnaies virtuelles. Il n'existe AUCUNE possibilité de retrait ou de conversion en argent." },
        { title: "6. Interdictions", content: "Il est interdit de : utiliser l'app pour des activités illégales, violer des propriétés privées, partager/vendre des comptes, créer plusieurs comptes, pirater l'application, utiliser des bots/scripts, manipuler les classements." },
        { title: "7. Propriété Intellectuelle", content: "Tout le contenu de M1SSION™ est la propriété exclusive de Joseph Mulé et NIYVORA KFT™, protégé par les lois sur le droit d'auteur." },
        { title: "8. Limitation de Responsabilité", content: "M1SSION™ est fourni \"tel quel\". L'Utilisateur est responsable de sa propre sécurité lors des missions physiques." },
        { title: "9. Confidentialité et AION", content: "La collecte de données est régie par la Politique de Confidentialité. AION traite les données pour fournir une assistance contextuelle." },
        { title: "10. Modifications", content: "NIYVORA KFT™ se réserve le droit de modifier les Conditions, fonctionnalités et mécaniques de jeu à tout moment." },
        { title: "11. Juridiction", content: "Conditions régies par le droit italien. Juridiction exclusive : Tribunal de Milan." },
        { title: "12. Contacts", content: "Pour les communications légales : legal@m1ssion.app | NIYVORA KFT™, Budapest, Hongrie" }
      ]
    }
  };
  const content = contentByLang[lang] || contentByLang.en;

  return (
    <>
      <GlassCard style={{ marginBottom: '16px' }}>
        <h2 style={{ color: '#00D1FF', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{content.title}</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{content.lastUpdate}</p>
      </GlassCard>
      {content.sections.map((section, i) => (
        <GlassCard key={i} style={{ marginBottom: '12px' }}>
          <h3 style={{ color: '#00D1FF', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{section.title}</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: '1.6' }}>{section.content}</p>
        </GlassCard>
      ))}
      <LegalFooter lang={lang} />
    </>
  );
};

// ============ PRIVACY CONTENT ============
const PrivacyContent: React.FC<{ lang: Language }> = ({ lang }) => {
  const contentByLang = {
    it: {
      title: "Informativa sulla Privacy",
      lastUpdate: "Ultimo aggiornamento: 5 Dicembre 2025",
      sections: [
        { title: "1. Titolare del Trattamento", content: "NIYVORA KFT™, Budapest, Hungary. DPO: Joseph Mulé - contact@m1ssion.com" },
        { title: "2. Dati Raccolti", content: "Dati di account (nome, email, password crittografata), dati di geolocalizzazione (GPS per Buzz Map), dati di utilizzo (progressi, punteggi, M1U/PE), dati tecnici (IP, dispositivo, crash report)." },
        { title: "3. Geolocalizzazione", content: "La geolocalizzazione è ESSENZIALE per M1SSION™. Serve per: visualizzare la Buzz Map, verificare missioni fisiche, generare indizi contestuali. I dati in tempo reale NON vengono memorizzati permanentemente." },
        { title: "4. Basi Giuridiche (GDPR)", content: "Contratto (Art. 6.1.b): necessario per il servizio. Consenso (Art. 6.1.a): per notifiche e marketing. Legittimo Interesse (Art. 6.1.f): sicurezza e prevenzione frodi." },
        { title: "5. AI AION", content: "AION elabora messaggi e dati di gioco per fornire assistenza. Nessun dato viene utilizzato per addestrare modelli esterni. Le risposte sono per intrattenimento." },
        { title: "6. M1U e Pulse Breaker", content: "M1U e PE sono valute virtuali senza valore monetario. Pulse Breaker è intrattenimento, NON gambling. Nessun dato condiviso con piattaforme di betting." },
        { title: "7. Condivisione Dati", content: "Condivisi con: Supabase (database), Cloudflare (CDN), Apple/Google (notifiche), OpenAI (AI), Stripe (pagamenti). NON vendiamo MAI i dati." },
        { title: "8. Trasferimenti Extra-UE", content: "Tramite clausole contrattuali standard (SCC) e misure tecniche supplementari (crittografia)." },
        { title: "9. Sicurezza", content: "SSL/TLS, crittografia AES-256, hashing password bcrypt, 2FA disponibile, accesso limitato." },
        { title: "10. Cookie", content: "Cookie tecnici essenziali, localStorage per preferenze. Vedi Cookie Policy completa." },
        { title: "11. Conservazione", content: "Account: durata attiva + 30 giorni. Log tecnici: 90 giorni. Fatturazione: 10 anni." },
        { title: "12. Diritti GDPR", content: "Accesso, rettifica, cancellazione, limitazione, portabilità, opposizione, revoca consenso. Contatta: contact@m1ssion.com" }
      ]
    },
    en: {
      title: "Privacy Policy",
      lastUpdate: "Last updated: December 5, 2025",
      sections: [
        { title: "1. Data Controller", content: "NIYVORA KFT™, Budapest, Hungary. DPO: Joseph Mulé - contact@m1ssion.com" },
        { title: "2. Data Collected", content: "Account data (name, email, encrypted password), geolocation data (GPS for Buzz Map), usage data (progress, scores, M1U/PE), technical data (IP, device, crash reports)." },
        { title: "3. Geolocation", content: "Geolocation is ESSENTIAL for M1SSION™. Used for: displaying Buzz Map, verifying physical missions, generating contextual clues. Real-time data is NOT permanently stored." },
        { title: "4. Legal Bases (GDPR)", content: "Contract (Art. 6.1.b): necessary for service. Consent (Art. 6.1.a): for notifications and marketing. Legitimate Interest (Art. 6.1.f): security and fraud prevention." },
        { title: "5. AI AION", content: "AION processes messages and game data to provide assistance. No data is used to train external models. Responses are for entertainment." },
        { title: "6. M1U and Pulse Breaker", content: "M1U and PE are virtual currencies with no monetary value. Pulse Breaker is entertainment, NOT gambling. No data shared with betting platforms." },
        { title: "7. Data Sharing", content: "Shared with: Supabase (database), Cloudflare (CDN), Apple/Google (notifications), OpenAI (AI), Stripe (payments). We NEVER sell data." },
        { title: "8. Extra-EU Transfers", content: "Through standard contractual clauses (SCCs) and supplementary technical measures (encryption)." },
        { title: "9. Security", content: "SSL/TLS, AES-256 encryption, bcrypt password hashing, 2FA available, limited access." },
        { title: "10. Cookies", content: "Essential technical cookies, localStorage for preferences. See complete Cookie Policy." },
        { title: "11. Retention", content: "Account: active duration + 30 days. Technical logs: 90 days. Billing: 10 years." },
        { title: "12. GDPR Rights", content: "Access, rectification, erasure, restriction, portability, objection, consent withdrawal. Contact: contact@m1ssion.com" }
      ]
    },
    fr: {
      title: "Politique de Confidentialité",
      lastUpdate: "Dernière mise à jour : 5 décembre 2025",
      sections: [
        { title: "1. Responsable du Traitement", content: "NIYVORA KFT™, Budapest, Hongrie. DPO : Joseph Mulé - contact@m1ssion.com" },
        { title: "2. Données Collectées", content: "Données de compte (nom, email, mot de passe chiffré), données de géolocalisation (GPS pour Buzz Map), données d'utilisation (progression, scores, M1U/PE), données techniques (IP, appareil, rapports d'erreur)." },
        { title: "3. Géolocalisation", content: "La géolocalisation est ESSENTIELLE pour M1SSION™. Utilisée pour : afficher la Buzz Map, vérifier les missions physiques, générer des indices contextuels. Les données en temps réel ne sont PAS stockées de façon permanente." },
        { title: "4. Bases Juridiques (RGPD)", content: "Contrat (Art. 6.1.b) : nécessaire au service. Consentement (Art. 6.1.a) : pour notifications et marketing. Intérêt Légitime (Art. 6.1.f) : sécurité et prévention des fraudes." },
        { title: "5. IA AION", content: "AION traite les messages et données de jeu pour fournir une assistance. Aucune donnée n'est utilisée pour entraîner des modèles externes. Les réponses sont à des fins de divertissement." },
        { title: "6. M1U et Pulse Breaker", content: "M1U et PE sont des monnaies virtuelles sans valeur monétaire. Pulse Breaker est un divertissement, PAS un jeu de hasard. Aucune donnée partagée avec des plateformes de paris." },
        { title: "7. Partage de Données", content: "Partagées avec : Supabase (base de données), Cloudflare (CDN), Apple/Google (notifications), OpenAI (IA), Stripe (paiements). Nous ne vendons JAMAIS les données." },
        { title: "8. Transferts Hors-UE", content: "Via clauses contractuelles types (CCT) et mesures techniques supplémentaires (chiffrement)." },
        { title: "9. Sécurité", content: "SSL/TLS, chiffrement AES-256, hachage bcrypt des mots de passe, 2FA disponible, accès limité." },
        { title: "10. Cookies", content: "Cookies techniques essentiels, localStorage pour les préférences. Voir Politique des Cookies complète." },
        { title: "11. Conservation", content: "Compte : durée active + 30 jours. Logs techniques : 90 jours. Facturation : 10 ans." },
        { title: "12. Droits RGPD", content: "Accès, rectification, effacement, limitation, portabilité, opposition, retrait du consentement. Contact : contact@m1ssion.com" }
      ]
    }
  };
  const content = contentByLang[lang] || contentByLang.en;

  return (
    <>
      <GlassCard style={{ marginBottom: '16px' }}>
        <h2 style={{ color: '#22C55E', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{content.title}</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{content.lastUpdate}</p>
        <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <p style={{ color: '#22C55E', fontSize: '11px' }}>GDPR Compliant - Reg. UE 2016/679</p>
        </div>
      </GlassCard>
      {content.sections.map((section, i) => (
        <GlassCard key={i} style={{ marginBottom: '12px' }}>
          <h3 style={{ color: '#22C55E', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{section.title}</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: '1.6' }}>{section.content}</p>
        </GlassCard>
      ))}
      <LegalFooter lang={lang} />
    </>
  );
};

// ============ COOKIE CONTENT ============
const CookieContent: React.FC<{ lang: Language }> = ({ lang }) => {
  const contentByLang = {
    it: {
      title: "Cookie Policy",
      lastUpdate: "Ultimo aggiornamento: 5 Dicembre 2025",
      sections: [
        { title: "1. Cosa sono i Cookie", content: "I cookie sono piccoli file di testo memorizzati sul dispositivo. Servono a memorizzare preferenze e migliorare l'esperienza utente." },
        { title: "2. Cookie Tecnici (Essenziali)", content: "sb-*-auth-token (Supabase): autenticazione. __cf_bm (Cloudflare): protezione DDoS. __stripe_mid (Stripe): prevenzione frodi. Questi NON possono essere disabilitati." },
        { title: "3. Cookie Funzionali", content: "m1:language (lingua), m1:theme (tema), m1:onboarding_complete (tutorial), m1:sound_enabled (audio). Memorizzano le tue preferenze." },
        { title: "4. Cookie Analitici", content: "_ga, _gid (Google Analytics): statistiche anonimizzate. Richiedono consenso. IP anonimizzato." },
        { title: "5. Cookie Marketing", content: "Attualmente M1SSION™ NON utilizza cookie di marketing o profilazione di terze parti." },
        { title: "6. LocalStorage", content: "m1:cookie_consent (consenso), m1:push_token (notifiche), m1:last_sync (sincronizzazione), m1:buzz_cache (cache indizi)." },
        { title: "7. Gestione Preferenze", content: "Puoi gestire i cookie tramite: banner cookie, impostazioni app, impostazioni browser, revoca consenso." },
        { title: "8. Diritti", content: "Revocare consenso, richiedere informazioni, richiedere cancellazione, presentare reclamo al Garante Privacy." }
      ]
    },
    en: {
      title: "Cookie Policy",
      lastUpdate: "Last updated: December 5, 2025",
      sections: [
        { title: "1. What are Cookies", content: "Cookies are small text files stored on your device. They store preferences and improve user experience." },
        { title: "2. Technical Cookies (Essential)", content: "sb-*-auth-token (Supabase): authentication. __cf_bm (Cloudflare): DDoS protection. __stripe_mid (Stripe): fraud prevention. These CANNOT be disabled." },
        { title: "3. Functional Cookies", content: "m1:language (language), m1:theme (theme), m1:onboarding_complete (tutorial), m1:sound_enabled (audio). Store your preferences." },
        { title: "4. Analytics Cookies", content: "_ga, _gid (Google Analytics): anonymized statistics. Require consent. Anonymized IP." },
        { title: "5. Marketing Cookies", content: "Currently M1SSION™ does NOT use third-party marketing or profiling cookies." },
        { title: "6. LocalStorage", content: "m1:cookie_consent (consent), m1:push_token (notifications), m1:last_sync (sync), m1:buzz_cache (clue cache)." },
        { title: "7. Preference Management", content: "You can manage cookies via: cookie banner, app settings, browser settings, consent withdrawal." },
        { title: "8. Rights", content: "Withdraw consent, request information, request deletion, file complaint with Data Protection Authority." }
      ]
    },
    fr: {
      title: "Politique des Cookies",
      lastUpdate: "Dernière mise à jour : 5 décembre 2025",
      sections: [
        { title: "1. Que sont les Cookies", content: "Les cookies sont de petits fichiers texte stockés sur votre appareil. Ils servent à mémoriser les préférences et améliorer l'expérience utilisateur." },
        { title: "2. Cookies Techniques (Essentiels)", content: "sb-*-auth-token (Supabase) : authentification. __cf_bm (Cloudflare) : protection DDoS. __stripe_mid (Stripe) : prévention des fraudes. Ceux-ci ne peuvent PAS être désactivés." },
        { title: "3. Cookies Fonctionnels", content: "m1:language (langue), m1:theme (thème), m1:onboarding_complete (tutoriel), m1:sound_enabled (audio). Mémorisent vos préférences." },
        { title: "4. Cookies Analytiques", content: "_ga, _gid (Google Analytics) : statistiques anonymisées. Nécessitent le consentement. IP anonymisée." },
        { title: "5. Cookies Marketing", content: "Actuellement M1SSION™ n'utilise PAS de cookies de marketing ou de profilage tiers." },
        { title: "6. LocalStorage", content: "m1:cookie_consent (consentement), m1:push_token (notifications), m1:last_sync (synchronisation), m1:buzz_cache (cache indices)." },
        { title: "7. Gestion des Préférences", content: "Vous pouvez gérer les cookies via : bannière cookies, paramètres de l'app, paramètres du navigateur, retrait du consentement." },
        { title: "8. Droits", content: "Retirer le consentement, demander des informations, demander la suppression, déposer une plainte auprès de la CNIL." }
      ]
    }
  };
  const content = contentByLang[lang] || contentByLang.en;

  return (
    <>
      <GlassCard style={{ marginBottom: '16px' }}>
        <h2 style={{ color: '#F59E0B', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{content.title}</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{content.lastUpdate}</p>
      </GlassCard>
      {content.sections.map((section, i) => (
        <GlassCard key={i} style={{ marginBottom: '12px' }}>
          <h3 style={{ color: '#F59E0B', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{section.title}</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: '1.6' }}>{section.content}</p>
        </GlassCard>
      ))}
      <LegalFooter lang={lang} />
    </>
  );
};

// ============ GAME RULES CONTENT ============
const GameRulesContent: React.FC<{ lang: Language }> = ({ lang }) => {
  const contentByLang = {
    it: {
      title: "Regolamento Ufficiale M1SSION™",
      lastUpdate: "Versione 1.2 – Dicembre 2025",
      antiGambling: "⚠️ CLAUSOLA ANTI-GAMBLING: M1SSION™ è un GIOCO A PROGRESSIONE DETERMINISTICA. NON è un gioco d'azzardo. La progressione dipende dall'impegno del giocatore.",
      sections: [
        { title: "Art. 1 — Oggetto del Gioco", content: "M1SSION™ è un gioco di abilità e investigazione (skill-based) che consiste nella ricerca di premi reali attraverso l'interpretazione di indizi e l'analisi di coordinate geografiche. NON è basato sulla fortuna o RNG." },
        { title: "Art. 2 — Partecipazione", content: "Requisiti: 18+ anni, email verificata, accettazione termini, un solo account per persona. Account multipli = squalifica permanente." },
        { title: "Art. 3 — Abbonamenti", content: "FREE: accesso base, indizi limitati, 1 BUZZ/giorno. PREMIUM (Silver, Gold, Black, Titanium): più indizi, BUZZ multipli, contenuti esclusivi." },
        { title: "Art. 4 — Indizi e BUZZ", content: "Gli indizi sono elementi narrativi geolocalizzati. Il BUZZ segnala la prossimità ai POI. La precisione dipende dalle abilità del giocatore." },
        { title: "Art. 5 — Premi", content: "Premi reali e digitali assegnati per raggiungimento obiettivi. NON sono vincite d'azzardo. Richiedono verifica identità per ritiro." },
        { title: "Art. 6 — M1U e PE", content: "Valute virtuali SENZA valore monetario. M1U acquistabili ma NON convertibili. PE guadagnabili solo giocando." },
        { title: "Art. 7 — Divieti", content: "Vietato: cheating, exploit, sharing account, manipolazione, comportamenti illegali, violazione copyright." },
        { title: "Art. 8 — Sanzioni", content: "Warning → Sospensione temporanea → Ban permanente → Azioni legali" }
      ]
    },
    en: {
      title: "Official M1SSION™ Regulation",
      lastUpdate: "Version 1.2 – December 2025",
      antiGambling: "⚠️ ANTI-GAMBLING CLAUSE: M1SSION™ is a DETERMINISTIC PROGRESSION GAME. It is NOT gambling. Progression depends on player effort.",
      sections: [
        { title: "Art. 1 — Game Object", content: "M1SSION™ is a skill-based investigation game consisting of searching for real prizes through clue interpretation and geographical coordinate analysis. It is NOT based on luck or RNG." },
        { title: "Art. 2 — Participation", content: "Requirements: 18+ years, verified email, terms acceptance, one account per person. Multiple accounts = permanent disqualification." },
        { title: "Art. 3 — Subscriptions", content: "FREE: basic access, limited clues, 1 BUZZ/day. PREMIUM (Silver, Gold, Black, Titanium): more clues, multiple BUZZ, exclusive content." },
        { title: "Art. 4 — Clues and BUZZ", content: "Clues are geolocated narrative elements. BUZZ signals proximity to POIs. Accuracy depends on player skills." },
        { title: "Art. 5 — Prizes", content: "Real and digital prizes awarded for achieving objectives. They are NOT gambling winnings. Identity verification required for collection." },
        { title: "Art. 6 — M1U and PE", content: "Virtual currencies with NO monetary value. M1U purchasable but NOT convertible. PE only earned through gameplay." },
        { title: "Art. 7 — Prohibitions", content: "Prohibited: cheating, exploits, account sharing, manipulation, illegal behavior, copyright violation." },
        { title: "Art. 8 — Sanctions", content: "Warning → Temporary suspension → Permanent ban → Legal action" }
      ]
    },
    fr: {
      title: "Règlement Officiel M1SSION™",
      lastUpdate: "Version 1.2 – Décembre 2025",
      antiGambling: "⚠️ CLAUSE ANTI-JEU DE HASARD : M1SSION™ est un JEU À PROGRESSION DÉTERMINISTE. Ce n'est PAS un jeu de hasard. La progression dépend de l'effort du joueur.",
      sections: [
        { title: "Art. 1 — Objet du Jeu", content: "M1SSION™ est un jeu d'habileté et d'investigation (skill-based) consistant à rechercher des prix réels à travers l'interprétation d'indices et l'analyse de coordonnées géographiques. Il n'est PAS basé sur la chance ou le RNG." },
        { title: "Art. 2 — Participation", content: "Conditions : 18+ ans, email vérifié, acceptation des conditions, un seul compte par personne. Comptes multiples = disqualification permanente." },
        { title: "Art. 3 — Abonnements", content: "FREE : accès basique, indices limités, 1 BUZZ/jour. PREMIUM (Silver, Gold, Black, Titanium) : plus d'indices, BUZZ multiples, contenus exclusifs." },
        { title: "Art. 4 — Indices et BUZZ", content: "Les indices sont des éléments narratifs géolocalisés. Le BUZZ signale la proximité aux POI. La précision dépend des compétences du joueur." },
        { title: "Art. 5 — Prix", content: "Prix réels et numériques attribués pour l'atteinte d'objectifs. Ce ne sont PAS des gains de jeu de hasard. Vérification d'identité requise pour le retrait." },
        { title: "Art. 6 — M1U et PE", content: "Monnaies virtuelles SANS valeur monétaire. M1U achetables mais NON convertibles. PE uniquement gagnés en jouant." },
        { title: "Art. 7 — Interdictions", content: "Interdit : triche, exploits, partage de compte, manipulation, comportements illégaux, violation de droits d'auteur." },
        { title: "Art. 8 — Sanctions", content: "Avertissement → Suspension temporaire → Bannissement permanent → Actions légales" }
      ]
    }
  };
  const content = contentByLang[lang] || contentByLang.en;

  return (
    <>
      <GlassCard style={{ marginBottom: '16px' }}>
        <h2 style={{ color: '#A855F7', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{content.title}</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{content.lastUpdate}</p>
      </GlassCard>
      <GlassCard style={{ marginBottom: '16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <p style={{ color: '#EF4444', fontSize: '13px', fontWeight: 600 }}>{content.antiGambling}</p>
      </GlassCard>
      {content.sections.map((section, i) => (
        <GlassCard key={i} style={{ marginBottom: '12px' }}>
          <h3 style={{ color: '#A855F7', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{section.title}</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: '1.6' }}>{section.content}</p>
        </GlassCard>
      ))}
      <LegalFooter lang={lang} />
    </>
  );
};

// ============ POLICIES CONTENT ============
const PoliciesContent: React.FC<{ lang: Language }> = ({ lang }) => {
  const contentByLang = {
    it: {
      title: "Policy & Disclaimer",
      lastUpdate: "Ultimo aggiornamento: Dicembre 2025",
      antiGambling: "🚫 M1SSION™ NON è un'applicazione di gioco d'azzardo. Non offre scommesse, puntate o giochi basati sulla fortuna che coinvolgono denaro reale.",
      sections: [
        { title: "Natura dell'App", content: "M1SSION™ è un'applicazione di intrattenimento interattivo: gioco di simulazione investigativa, puzzle/mistero, basato sulla posizione. Puramente per divertimento." },
        { title: "Valute Virtuali", content: "M1U e PE NON hanno valore monetario reale. NON possono essere venduti, scambiati o convertiti in denaro. NON possono essere prelevati. Acquisti non rimborsabili." },
        { title: "Pulse Breaker", content: "Mini-gioco di INTRATTENIMENTO. NON è gambling. Usa solo valute virtuali. Nessuna possibilità di vincere denaro reale." },
        { title: "Nessun Gambling", content: "Nessun deposito per scommesse, nessun prelievo di vincite, nessun riscatto per denaro, nessun servizio di casinò o lotterie." },
        { title: "Responsabilità", content: "L'utente è responsabile della propria sicurezza. Non entrare in proprietà private. Rispettare le leggi locali." },
        { title: "AION AI", content: "Assistente AI per intrattenimento. NON fornisce consulenze professionali, legali o finanziarie." }
      ]
    },
    en: {
      title: "Policy & Disclaimer",
      lastUpdate: "Last updated: December 2025",
      antiGambling: "🚫 M1SSION™ is NOT a gambling application. It does not offer betting, wagers or luck-based games involving real money.",
      sections: [
        { title: "App Nature", content: "M1SSION™ is an interactive entertainment application: investigative simulation game, puzzle/mystery, location-based. Purely for fun." },
        { title: "Virtual Currencies", content: "M1U and PE have NO real monetary value. They CANNOT be sold, exchanged or converted to money. They CANNOT be withdrawn. Purchases are non-refundable." },
        { title: "Pulse Breaker", content: "ENTERTAINMENT mini-game. It is NOT gambling. Uses only virtual currencies. No possibility of winning real money." },
        { title: "No Gambling", content: "No deposits for betting, no withdrawal of winnings, no redemption for money, no casino or lottery services." },
        { title: "Responsibility", content: "User is responsible for their own safety. Do not trespass on private property. Respect local laws." },
        { title: "AION AI", content: "AI assistant for entertainment. Does NOT provide professional, legal or financial advice." }
      ]
    },
    fr: {
      title: "Politique & Avertissement",
      lastUpdate: "Dernière mise à jour : Décembre 2025",
      antiGambling: "🚫 M1SSION™ n'est PAS une application de jeu de hasard. Elle ne propose pas de paris, mises ou jeux basés sur la chance impliquant de l'argent réel.",
      sections: [
        { title: "Nature de l'App", content: "M1SSION™ est une application de divertissement interactif : jeu de simulation d'enquête, puzzle/mystère, basé sur la localisation. Purement pour le plaisir." },
        { title: "Monnaies Virtuelles", content: "M1U et PE n'ont AUCUNE valeur monétaire réelle. Ils ne peuvent PAS être vendus, échangés ou convertis en argent. Ils ne peuvent PAS être retirés. Achats non remboursables." },
        { title: "Pulse Breaker", content: "Mini-jeu de DIVERTISSEMENT. Ce n'est PAS du gambling. Utilise uniquement des monnaies virtuelles. Aucune possibilité de gagner de l'argent réel." },
        { title: "Pas de Jeu de Hasard", content: "Aucun dépôt pour paris, aucun retrait de gains, aucun échange contre de l'argent, aucun service de casino ou loterie." },
        { title: "Responsabilité", content: "L'utilisateur est responsable de sa propre sécurité. Ne pas pénétrer sur des propriétés privées. Respecter les lois locales." },
        { title: "AION IA", content: "Assistant IA pour le divertissement. Ne fournit PAS de conseils professionnels, juridiques ou financiers." }
      ]
    }
  };
  const content = contentByLang[lang] || contentByLang.en;

  return (
    <>
      <GlassCard style={{ marginBottom: '16px' }}>
        <h2 style={{ color: '#EF4444', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{content.title}</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{content.lastUpdate}</p>
      </GlassCard>
      <GlassCard style={{ marginBottom: '16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <p style={{ color: '#EF4444', fontSize: '13px', fontWeight: 600 }}>{content.antiGambling}</p>
      </GlassCard>
      {content.sections.map((section, i) => (
        <GlassCard key={i} style={{ marginBottom: '12px' }}>
          <h3 style={{ color: '#EF4444', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{section.title}</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: '1.6' }}>{section.content}</p>
        </GlassCard>
      ))}
      <LegalFooter lang={lang} />
    </>
  );
};

// ============ SAFECREATIVE CONTENT ============
const SafeCreativeContent: React.FC<{ lang: Language }> = ({ lang }) => {
  const contentByLang = {
    it: {
      title: "SafeCreative - Certificazione Copyright",
      sections: [
        { title: "Certificazione Ufficiale", content: "🔐 M1SSION™ | Autore: Joseph Mulé | Data: 2025 | Tipologia: Applicazione Mobile iOS | Stato: Registrata e Protetta" },
        { title: "Elementi Protetti", content: "Nome e Logo M1SSION™, Codice Sorgente e algoritmi, Design Interface UI/UX, Game Mechanics (caccia al tesoro geolocalizzato), Contenuti (testi, indizi, narrazioni), Documentazione." },
        { title: "Tecnologie Proprietarie", content: "Sistema di generazione indizi AI, Algoritmo posizionamento geografico, Framework gamification multi-tier, Sistema sicurezza avanzato, Interfaccia Capacitor iOS." },
        { title: "Dichiarazione di Originalità", content: "L'autore Joseph Mulé dichiara che M1SSION™ è un'opera completamente originale, sviluppata autonomamente, senza violazione di diritti di terzi." },
        { title: "Certificati SafeCreative", content: "2505261861325 | 2512103987648 | 2512103988744" }
      ]
    },
    en: {
      title: "SafeCreative - Copyright Certification",
      sections: [
        { title: "Official Certification", content: "🔐 M1SSION™ | Author: Joseph Mulé | Date: 2025 | Type: iOS Mobile Application | Status: Registered and Protected" },
        { title: "Protected Elements", content: "M1SSION™ Name and Logo, Source Code and algorithms, UI/UX Interface Design, Game Mechanics (geolocated treasure hunt), Content (texts, clues, narratives), Documentation." },
        { title: "Proprietary Technologies", content: "AI clue generation system, Geographic positioning algorithm, Multi-tier gamification framework, Advanced security system, Capacitor iOS interface." },
        { title: "Originality Statement", content: "Author Joseph Mulé declares that M1SSION™ is a completely original work, independently developed, without violation of third-party rights." },
        { title: "SafeCreative Certificates", content: "2505261861325 | 2512103987648 | 2512103988744" }
      ]
    },
    fr: {
      title: "SafeCreative - Certification Copyright",
      sections: [
        { title: "Certification Officielle", content: "🔐 M1SSION™ | Auteur : Joseph Mulé | Date : 2025 | Type : Application Mobile iOS | Statut : Enregistrée et Protégée" },
        { title: "Éléments Protégés", content: "Nom et Logo M1SSION™, Code Source et algorithmes, Design Interface UI/UX, Mécaniques de Jeu (chasse au trésor géolocalisée), Contenus (textes, indices, narrations), Documentation." },
        { title: "Technologies Propriétaires", content: "Système de génération d'indices IA, Algorithme de positionnement géographique, Framework de gamification multi-niveaux, Système de sécurité avancé, Interface Capacitor iOS." },
        { title: "Déclaration d'Originalité", content: "L'auteur Joseph Mulé déclare que M1SSION™ est une œuvre entièrement originale, développée de manière autonome, sans violation des droits de tiers." },
        { title: "Certificats SafeCreative", content: "2505261861325 | 2512103987648 | 2512103988744" }
      ]
    }
  };
  const content = contentByLang[lang] || contentByLang.en;

  return (
    <>
      <GlassCard style={{ marginBottom: '16px' }}>
        <h2 style={{ color: '#EC4899', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{content.title}</h2>
      </GlassCard>
      {content.sections.map((section, i) => (
        <GlassCard key={i} style={{ marginBottom: '12px' }}>
          <h3 style={{ color: '#EC4899', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{section.title}</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: '1.6' }}>{section.content}</p>
        </GlassCard>
      ))}
      <LegalFooter lang={lang} />
    </>
  );
};

// ============ EUIPO CONTENT ============
const EuipoContent: React.FC<{ lang: Language }> = ({ lang }) => {
  const contentByLang = {
    it: {
      title: "EUIPO – Marchio Registrato UE",
      sections: [
        { title: "Registrazione Marchio", content: "M1SSION™ è un marchio registrato presso l'Ufficio dell'Unione Europea per la Proprietà Intellettuale (EUIPO). Titolare: NIYVORA KFT™" },
        { title: "Classe 9 – Software & App", content: "Software applicativo mobile, software per intrattenimento interattivo, software per giochi a premi, applicazioni smartphone/tablet, software geolocalizzazione, software AR." },
        { title: "Classe 28 – Giochi", content: "Giochi elettronici, giochi di società, giochi interattivi, giocattoli elettronici, giochi a premi (non d'azzardo)." },
        { title: "Classe 41 – Intrattenimento", content: "Servizi di intrattenimento interattivo, organizzazione concorsi, servizi giochi online, produzione contenuti multimediali." },
        { title: "Classe 42 – Tecnologia", content: "Progettazione e sviluppo software, SaaS, PaaS, hosting piattaforme, cloud computing, sviluppo app mobile." },
        { title: "Protezione", content: "L'uso non autorizzato del marchio M1SSION™ è vietato e perseguibile per legge su tutto il territorio dell'Unione Europea." }
      ]
    },
    en: {
      title: "EUIPO – EU Registered Trademark",
      sections: [
        { title: "Trademark Registration", content: "M1SSION™ is a trademark registered with the European Union Intellectual Property Office (EUIPO). Owner: NIYVORA KFT™" },
        { title: "Class 9 – Software & Apps", content: "Mobile application software, interactive entertainment software, prize game software, smartphone/tablet applications, geolocation software, AR software." },
        { title: "Class 28 – Games", content: "Electronic games, board games, interactive games, electronic toys, prize games (non-gambling)." },
        { title: "Class 41 – Entertainment", content: "Interactive entertainment services, contest organization, online gaming services, multimedia content production." },
        { title: "Class 42 – Technology", content: "Software design and development, SaaS, PaaS, platform hosting, cloud computing, mobile app development." },
        { title: "Protection", content: "Unauthorized use of the M1SSION™ trademark is prohibited and legally prosecutable throughout the European Union." }
      ]
    },
    fr: {
      title: "EUIPO – Marque Déposée UE",
      sections: [
        { title: "Enregistrement de la Marque", content: "M1SSION™ est une marque enregistrée auprès de l'Office de l'Union Européenne pour la Propriété Intellectuelle (EUIPO). Titulaire : NIYVORA KFT™" },
        { title: "Classe 9 – Logiciels & Apps", content: "Logiciels d'application mobile, logiciels de divertissement interactif, logiciels de jeux à prix, applications smartphone/tablette, logiciels de géolocalisation, logiciels AR." },
        { title: "Classe 28 – Jeux", content: "Jeux électroniques, jeux de société, jeux interactifs, jouets électroniques, jeux à prix (sans hasard)." },
        { title: "Classe 41 – Divertissement", content: "Services de divertissement interactif, organisation de concours, services de jeux en ligne, production de contenus multimédias." },
        { title: "Classe 42 – Technologie", content: "Conception et développement de logiciels, SaaS, PaaS, hébergement de plateformes, cloud computing, développement d'apps mobiles." },
        { title: "Protection", content: "L'utilisation non autorisée de la marque M1SSION™ est interdite et passible de poursuites judiciaires sur tout le territoire de l'Union Européenne." }
      ]
    }
  };
  const content = contentByLang[lang] || contentByLang.en;

  return (
    <>
      <GlassCard style={{ marginBottom: '16px' }}>
        <h2 style={{ color: '#6366F1', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{content.title}</h2>
      </GlassCard>
      {content.sections.map((section, i) => (
        <GlassCard key={i} style={{ marginBottom: '12px' }}>
          <h3 style={{ color: '#6366F1', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{section.title}</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: '1.6' }}>{section.content}</p>
        </GlassCard>
      ))}
      <LegalFooter lang={lang} />
    </>
  );
};

// ============ LEGAL FOOTER ============
const LegalFooter: React.FC<{ lang: Language }> = ({ lang }) => {
  const rights = lang === 'it' ? 'Tutti i diritti riservati' : lang === 'fr' ? 'Tous droits réservés' : 'All Rights Reserved';
  return (
    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '8px' }}>
        © 2025 M1SSION™ – {rights}
      </p>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginBottom: '4px' }}>
        NIYVORA KFT™ – Budapest, Hungary
      </p>
      <p style={{ color: 'rgba(0, 209, 255, 0.4)', fontSize: '9px' }}>
        SafeCreative: 2505261861325 | EUIPO: M1SSION™
      </p>
    </div>
  );
};

// Glass Card
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: 'rgba(25, 25, 35, 0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)', ...style }}>{children}</div>
);

// Info Box
const InfoBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
    <p style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500 }}>{value}</p>
  </div>
);

export default LegalSectionContent;
