
import React, { Component, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Game component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="mx-auto max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Impossibile caricare il gioco
            </h3>
            <p className="text-gray-400 mb-4">
              Si è verificato un errore durante il caricamento. Riprova o torna alla lista giochi.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => this.setState({ hasError: false })}
                className="bg-[#00D1FF] hover:bg-[#00D1FF]/80"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Riprova
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                Torna indietro
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default GameErrorBoundary;
