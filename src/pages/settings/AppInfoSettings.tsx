import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Info, 
  Smartphone, 
  Globe, 
  Code, 
  Users, 
  Shield,
  ArrowLeft,
  ExternalLink,
  Heart
} from 'lucide-react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useLocation } from 'wouter';

const AppInfoSettings = () => {
  const [, setLocation] = useLocation();

  const appInfo = {
    name: "M1SSION™",
    version: "2.0.1",
    build: "2025.01.05",
    environment: "Production",
    developer: "NIYVORA KFT™",
    ceo: "Joseph MULÉ"
  };

  const features = [
    { icon: Globe, title: "Missioni Globali", description: "Esplora il mondo attraverso missioni interattive" },
    { icon: Users, title: "Community", description: "Connettiti con agenti in tutto il mondo" },
    { icon: Shield, title: "Sicurezza", description: "Protezione avanzata dei dati personali" },
    { icon: Smartphone, title: "Multi-Platform", description: "Disponibile su tutti i dispositivi" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <UnifiedHeader />
      
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/settings')}
              className="p-2 hover:bg-background/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Info App
              </h1>
              <p className="text-muted-foreground">Dettagli dell'applicazione</p>
            </div>
          </div>

          {/* App Info Card */}
          <Card className="glass-card border-0 bg-card/50 backdrop-blur-md">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mb-4 mx-auto">
                <Info className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {appInfo.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 glass-card bg-background/20 border-0">
                  <p className="text-sm text-muted-foreground">Versione</p>
                  <p className="font-semibold text-lg text-primary">{appInfo.version}</p>
                </div>
                <div className="text-center p-3 glass-card bg-background/20 border-0">
                  <p className="text-sm text-muted-foreground">Build</p>
                  <p className="font-semibold text-lg text-primary">{appInfo.build}</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ambiente</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    {appInfo.environment}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Sviluppatore</span>
                  <span className="font-medium text-foreground">{appInfo.developer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">CEO</span>
                  <span className="font-medium text-foreground">{appInfo.ceo}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="glass-card border-0 bg-card/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Caratteristiche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="glass-card p-4 bg-background/20 border-0">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground/80">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Links */}
          <Card className="glass-card border-0 bg-card/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Collegamenti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-between bg-background/50 border-primary/30 hover:bg-primary/10"
              >
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4 text-primary" />
                  <span>Codice Sorgente</span>
                </div>
                <ExternalLink className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-between bg-background/50 border-primary/30 hover:bg-primary/10"
              >
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-400" />
                  <span>Supporta il Progetto</span>
                </div>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Copyright */}
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground/60">
              © 2025 Joseph MULÉ – M1SSION™
            </p>
            <p className="text-xs text-muted-foreground/40">
              ALL RIGHTS RESERVED – NIYVORA KFT™
            </p>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default AppInfoSettings;