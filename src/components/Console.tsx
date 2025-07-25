// M1SSION™ - Console Component for iOS Capacitor
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  User, 
  Shield, 
  Zap, 
  Target, 
  Activity,
  ChevronRight,
  Minimize2,
  Maximize2,
  Power
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { preserveFunctionName } from '@/utils/iosCapacitorFunctions';

interface ConsoleMessage {
  id: string;
  type: 'system' | 'agent' | 'command' | 'warning' | 'success' | 'error';
  timestamp: string;
  message: string;
  details?: string;
}

interface ConsoleProps {
  className?: string;
  compact?: boolean;
}

export const Console: React.FC<ConsoleProps> = ({ 
  className = '', 
  compact = false 
}) => {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [isMinimized, setIsMinimized] = useState(compact);
  const [isOnline, setIsOnline] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Add initial messages and simulate system activity
  useEffect(() => {
    const initialMessages: ConsoleMessage[] = [
      {
        id: '1',
        type: 'system',
        timestamp: new Date().toISOString(),
        message: 'SISTEMA M1SSION™ INIZIALIZZATO',
        details: 'Connessione sicura stabilita'
      },
      {
        id: '2',
        type: 'success',
        timestamp: new Date(Date.now() - 30000).toISOString(),
        message: 'AGENTE AUTENTICATO',
        details: user?.email || 'Agente Anonimo'
      },
      {
        id: '3',
        type: 'agent',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        message: 'Protocolli di sicurezza attivi',
        details: 'Encryption: AES-256'
      }
    ];

    setMessages(initialMessages);

    // Simulate periodic system messages
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 10 seconds
        addSystemMessage();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Add system message
  const addSystemMessage = preserveFunctionName(() => {
    const systemMessages = [
      { message: 'Scansione rete completata', details: 'Nessuna minaccia rilevata' },
      { message: 'Sincronizzazione dati in corso', details: 'Server Status: ONLINE' },
      { message: 'Aggiornamento posizione GPS', details: 'Accuratezza: ±3m' },
      { message: 'Verifica protocolli sicurezza', details: 'Tutti i sistemi operativi' },
      { message: 'Monitoraggio attività BUZZ', details: 'Sistema di tracking attivo' }
    ];

    const randomMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)];
    const newMessage: ConsoleMessage = {
      id: Date.now().toString(),
      type: 'system',
      timestamp: new Date().toISOString(),
      message: randomMessage.message,
      details: randomMessage.details
    };

    setMessages(prev => [...prev.slice(-19), newMessage]); // Keep last 20 messages
  }, 'addSystemMessage');

  // Toggle minimized state
  const toggleMinimized = preserveFunctionName(() => {
    setIsMinimized(!isMinimized);
  }, 'toggleMinimized');

  // Get message styling
  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'system':
        return { 
          color: 'text-[#00D1FF]', 
          prefix: '[SYS]',
          icon: <Activity className="w-3 h-3" />
        };
      case 'agent':
        return { 
          color: 'text-green-400', 
          prefix: '[AGT]',
          icon: <User className="w-3 h-3" />
        };
      case 'command':
        return { 
          color: 'text-yellow-400', 
          prefix: '[CMD]',
          icon: <Terminal className="w-3 h-3" />
        };
      case 'warning':
        return { 
          color: 'text-orange-400', 
          prefix: '[WAR]',
          icon: <Shield className="w-3 h-3" />
        };
      case 'success':
        return { 
          color: 'text-green-400', 
          prefix: '[SUC]',
          icon: <Target className="w-3 h-3" />
        };
      case 'error':
        return { 
          color: 'text-red-400', 
          prefix: '[ERR]',
          icon: <Zap className="w-3 h-3" />
        };
      default:
        return { 
          color: 'text-gray-400', 
          prefix: '[LOG]',
          icon: <Activity className="w-3 h-3" />
        };
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('it-IT', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="glass-card bg-black/80 border-[#00D1FF]/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#00D1FF]" />
              Console Agente
              <div className="flex items-center gap-2 ml-2">
                <div className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-green-400' : 'bg-red-400'
                } animate-pulse`} />
                <span className="text-xs text-gray-400">
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                v2.1.0
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimized}
                className="w-8 h-8 p-0"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="p-0">
                <div 
                  ref={scrollRef}
                  className="h-64 bg-black/50 font-mono text-sm overflow-y-auto p-3 space-y-1"
                  style={{ 
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,209,255,0.05) 100%)'
                  }}
                >
                  <AnimatePresence>
                    {messages.map((msg, index) => {
                      const style = getMessageStyle(msg.type);
                      
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: 10, opacity: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="group hover:bg-white/5 p-1 rounded transition-colors"
                        >
                          <div className="flex items-start gap-2 text-xs">
                            <span className="text-gray-500 flex-shrink-0">
                              {formatTime(msg.timestamp)}
                            </span>
                            
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {style.icon}
                              <span className={`${style.color} font-bold`}>
                                {style.prefix}
                              </span>
                            </div>
                            
                            <ChevronRight className="w-3 h-3 text-gray-600 mt-0.5 flex-shrink-0" />
                            
                            <div className="flex-1 min-w-0">
                              <div className={`${style.color} break-words`}>
                                {msg.message}
                              </div>
                              {msg.details && (
                                <div className="text-gray-400 text-xs mt-0.5 break-words">
                                  {msg.details}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  
                  {/* Cursor */}
                  <motion.div
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="text-gray-500">
                      {formatTime(new Date().toISOString())}
                    </span>
                    <span className="text-[#00D1FF]">[SYS]</span>
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                    <span className="text-[#00D1FF]">Sistema in attesa...</span>
                    <span className="w-2 h-4 bg-[#00D1FF] inline-block" />
                  </motion.div>
                </div>

                {/* Status Bar */}
                <div className="p-3 border-t border-gray-700/50 bg-black/30">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Power className="w-3 h-3 text-green-400" />
                        <span className="text-gray-400">Sistema Attivo</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-[#00D1FF]" />
                        <span className="text-gray-400">Sicurezza OK</span>
                      </div>
                    </div>
                    
                    <div className="text-gray-500">
                      {messages.length}/20 messaggi
                    </div>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default Console;