-- © 2025 – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Fix finale: Aggiorna firma e email legale in tutti i documenti

-- Aggiorna Privacy Policy
UPDATE public.legal_documents 
SET content_md = REPLACE(
    REPLACE(content_md, 
        '© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™', 
        '© 2025 – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™'
    ),
    'privacy@m1ssion.app',
    'legal@m1ssion.com'
)
WHERE type = 'privacy_policy';

-- Aggiorna Cookie Policy
UPDATE public.legal_documents 
SET content_md = REPLACE(
    REPLACE(content_md, 
        '© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™', 
        '© 2025 – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™'
    ),
    'privacy@m1ssion.app',
    'legal@m1ssion.com'
)
WHERE type = 'cookie_policy';

-- Aggiorna Terms of Service
UPDATE public.legal_documents 
SET content_md = REPLACE(
    REPLACE(content_md, 
        '© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™', 
        '© 2025 – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™'
    ),
    'privacy@m1ssion.app',
    'legal@m1ssion.com'
)
WHERE type = 'terms_of_service';

-- Aggiorna Disclaimer
UPDATE public.legal_documents 
SET content_md = REPLACE(
    REPLACE(content_md, 
        '© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™', 
        '© 2025 – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™'
    ),
    'privacy@m1ssion.app',
    'legal@m1ssion.com'
)
WHERE type = 'disclaimer';

-- Aggiorna SafeCreative
UPDATE public.legal_documents 
SET content_md = REPLACE(
    REPLACE(content_md, 
        '© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™', 
        '© 2025 – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™'
    ),
    'privacy@m1ssion.app',
    'legal@m1ssion.com'
)
WHERE type = 'safecreative';