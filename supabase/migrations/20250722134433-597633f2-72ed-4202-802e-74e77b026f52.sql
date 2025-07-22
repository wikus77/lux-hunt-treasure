-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Legal Compliance & GDPR Tables

-- 1. User Consents Table (GDPR compliance)
CREATE TABLE IF NOT EXISTS public.user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    marketing_consent BOOLEAN DEFAULT false,
    analytics_consent BOOLEAN DEFAULT false,
    profiling_consent BOOLEAN DEFAULT false,
    communications_consent BOOLEAN DEFAULT false,
    cookie_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- 2. Consent History Table (audit trail)
CREATE TABLE IF NOT EXISTS public.consent_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    consent_type TEXT NOT NULL,
    consent_given BOOLEAN NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    consent_timestamp TIMESTAMPTZ DEFAULT now(),
    consent_version TEXT DEFAULT '1.0'
);

-- 3. Legal Documents Table (versioned documents)
CREATE TABLE IF NOT EXISTS public.legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('terms_of_service', 'privacy_policy', 'cookie_policy', 'giveaway_rules', 'disclaimer')),
    version TEXT NOT NULL,
    title TEXT NOT NULL,
    content_md TEXT NOT NULL,
    published_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. User Cookie Preferences Table (granular cookie control)
CREATE TABLE IF NOT EXISTS public.user_cookie_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    essential_cookies BOOLEAN DEFAULT true, -- Always true, cannot be disabled
    analytics_cookies BOOLEAN DEFAULT false,
    marketing_cookies BOOLEAN DEFAULT false,
    preferences_cookies BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cookie_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_consents
CREATE POLICY "Users can view their own consents"
    ON public.user_consents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
    ON public.user_consents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consents"
    ON public.user_consents FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for consent_history
CREATE POLICY "Users can view their own consent history"
    ON public.consent_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert consent history"
    ON public.consent_history FOR INSERT
    WITH CHECK (true);

-- RLS Policies for legal_documents (public read-only)
CREATE POLICY "Anyone can view active legal documents"
    ON public.legal_documents FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage legal documents"
    ON public.legal_documents FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    ));

-- RLS Policies for user_cookie_preferences
CREATE POLICY "Users can view their own cookie preferences"
    ON public.user_cookie_preferences FOR SELECT
    USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own cookie preferences"
    ON public.user_cookie_preferences FOR INSERT
    WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can update their own cookie preferences"
    ON public.user_cookie_preferences FOR UPDATE
    USING (user_id IS NULL OR auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_consents_updated_at 
    BEFORE UPDATE ON public.user_consents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_cookie_preferences_updated_at 
    BEFORE UPDATE ON public.user_cookie_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default legal documents
INSERT INTO public.legal_documents (type, version, title, content_md, is_active) VALUES
('terms_of_service', '1.0', 'Termini di Servizio M1SSION™', 
'# Termini di Servizio M1SSION™

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**

## 1. Accettazione dei Termini
L''utilizzo dell''app M1SSION™ implica l''accettazione integrale dei seguenti termini e condizioni.

## 2. Oggetto
M1SSION™ è un''esperienza interattiva basata su missioni, enigmi e premi reali.

## 3. Requisiti
L''uso è consentito solo agli utenti maggiorenni o con il consenso dei genitori.

## 4. Responsabilità dell''utente
L''utente si impegna a non utilizzare l''app per scopi illeciti o fraudolenti.

## 5. Proprietà Intellettuale
Tutti i contenuti, loghi, meccaniche di gioco e layout sono protetti da copyright.

## 6. Disclaimer Premi
I premi citati (auto, orologi, gioielli) non sono sponsorizzati né affiliati ai marchi menzionati. Questi marchi non sponsorizzano né sono affiliati all''app M1SSION™.

Ultimo aggiornamento: Gennaio 2025', 
true),

('privacy_policy', '1.0', 'Privacy Policy M1SSION™',
'# Privacy Policy M1SSION™

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**

## 1. Titolare del trattamento
Il titolare del trattamento è NIYVORA KFT™, con sede in Ungheria.

## 2. Dati trattati
Raccogliamo dati personali come nome, email, posizione geografica (se autorizzata), dati di navigazione e contenuti generati dall''utente.

## 3. Finalità del trattamento
- Fornitura dei servizi dell''app
- Analisi e miglioramento dell''esperienza utente
- Comunicazioni relative a missioni e premi
- Adempimenti legali

## 4. Diritti dell''utente
Hai diritto di accesso, rettifica, cancellazione, limitazione, portabilità e opposizione al trattamento.

Ultimo aggiornamento: Gennaio 2025',
true),

('cookie_policy', '1.0', 'Cookie Policy M1SSION™',
'# Cookie Policy M1SSION™

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**

## Cosa sono i Cookie
I cookie sono piccoli file di testo memorizzati sul tuo dispositivo quando visiti il nostro sito web.

## Tipi di Cookie utilizzati

### Cookie Essenziali
Necessari per il funzionamento base dell''app. Non possono essere disabilitati.

### Cookie Analitici
Ci aiutano a capire come utilizzi l''app per migliorare l''esperienza utente.

### Cookie di Marketing
Utilizzati per personalizzare contenuti e pubblicità.

## Gestione Cookie
Puoi gestire le tue preferenze sui cookie nelle impostazioni dell''app.

Ultimo aggiornamento: Gennaio 2025',
true);