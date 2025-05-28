
import { getEmailTemplate } from '../emailTemplates';

describe('emailTemplates', () => {
  it('should return correct template for preregistrazione form type', () => {
    const template = getEmailTemplate('preregistrazione', 'Test User', 'ABCD123');
    
    expect(template.senderEmail).toBe('contact@m1ssion.com');
    expect(template.senderName).toBe('M1SSION');
    expect(template.subject).toBe('Pre-registrazione confermata');
    expect(template.htmlPart).toContain('Test User');
    expect(template.htmlPart).toContain('ABCD123');
    expect(template.htmlPart).toContain('M1SSION');
  });

  it('should return correct template for agente form type', () => {
    const template = getEmailTemplate('agente', 'Test User');
    
    expect(template.senderEmail).toBe('contact@m1ssion.com');
    expect(template.subject).toBe('Conferma ricezione richiesta agente');
    expect(template.htmlPart).toContain('richiesta per diventare agente');
  });

  it('should return correct template for newsletter form type', () => {
    const template = getEmailTemplate('newsletter', 'Test User');
    
    expect(template.senderEmail).toBe('contact@m1ssion.com');
    expect(template.subject).toBe('Iscrizione Newsletter M1SSION');
    expect(template.htmlPart).toContain('newsletter');
  });

  it('should return correct template for contatto form type', () => {
    const template = getEmailTemplate('contatto', 'Test User');
    
    expect(template.senderEmail).toBe('contact@m1ssion.com');
    expect(template.subject).toBe('Abbiamo ricevuto il tuo messaggio');
    expect(template.htmlPart).toContain('averci contattato');
  });

  it('should return default template for unknown form type', () => {
    const template = getEmailTemplate('unknown', 'Test User');
    
    expect(template.senderEmail).toBe('noreply@m1ssion.com');
    expect(template.senderName).toBe('M1SSION');
    expect(template.subject).toBe('Benvenuto in M1SSION');
    expect(template.htmlPart).toContain('primo passo');
  });

  it('should handle missing referral code in preregistrazione', () => {
    const template = getEmailTemplate('preregistrazione', 'Test User');
    
    expect(template.htmlPart).toContain('CODICE NON DISPONIBILE');
    expect(template.htmlPart).toContain('Test User');
  });

  it('should generate non-empty HTML content', () => {
    const template = getEmailTemplate('preregistrazione', 'Test User', 'ABC123');
    
    expect(template.htmlPart).toBeTruthy();
    expect(template.htmlPart.length).toBeGreaterThan(100);
    expect(template.htmlPart).toContain('<div');
    expect(template.htmlPart).toContain('</div>');
  });

  it('should include current year in footer', () => {
    const template = getEmailTemplate('preregistrazione', 'Test User');
    const currentYear = new Date().getFullYear();
    
    expect(template.htmlPart).toContain(currentYear.toString());
  });
});
