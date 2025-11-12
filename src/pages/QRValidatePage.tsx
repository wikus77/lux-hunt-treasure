import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Search } from 'lucide-react';

interface QRValidatePageProps {}

const QRValidatePage: React.FC<QRValidatePageProps> = () => {
  const { code } = useParams<{ code: string }>();
  const [, setLocation] = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const validateQRCode = async () => {
      if (!code) {
        setIsValid(false);
        setMessage('Codice QR non fornito');
        setIsValidating(false);
        return;
      }

      try {
        // Simula validazione QR code
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Per ora tutti i codici sono considerati validi per evitare errori
        setIsValid(true);
        setMessage(`Codice QR ${code} validato con successo!`);
        
        // Redirect to map after validation
        setTimeout(() => {
          setLocation('/map-3d-tiler');
        }, 2000);
        
      } catch (error) {
        console.error('Errore validazione QR:', error);
        setIsValid(false);
        setMessage('Errore durante la validazione del codice QR');
      } finally {
        setIsValidating(false);
      }
    };

    validateQRCode();
  }, [code, setLocation]);

  const handleRetry = () => {
    setLocation('/map-3d-tiler');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-background to-primary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-orbitron text-primary">
            Validazione QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {isValidating ? (
              <>
                <Search className="w-16 h-16 text-primary animate-pulse" />
                <p className="text-muted-foreground text-center">
                  Validazione del codice QR in corso...
                </p>
                <div className="text-sm text-muted-foreground">
                  Codice: <span className="font-mono text-primary">{code}</span>
                </div>
              </>
            ) : (
              <>
                {isValid ? (
                  <CheckCircle className="w-16 h-16 text-green-500" />
                ) : (
                  <XCircle className="w-16 h-16 text-destructive" />
                )}
                <p className={`text-center font-medium ${
                  isValid ? 'text-green-500' : 'text-destructive'
                }`}>
                  {message}
                </p>
                {!isValid && (
                  <Button 
                    onClick={handleRetry}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Torna alla Mappa
                  </Button>
                )}
                {isValid && (
                  <p className="text-sm text-muted-foreground text-center">
                    Reindirizzamento alla mappa...
                  </p>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRValidatePage;