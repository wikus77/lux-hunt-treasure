import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Cpu, Wand2, FileText, Image, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AIContentGeneratorProps {
  onBack: () => void;
}

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'clue' | 'mission' | 'story'>('clue');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Inserisci un prompt per generare contenuto');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🚀 Frontend: Starting AI content generation...');
      
      // Verifica autenticazione richiesta per funzioni sicure
      const { data: { session } } = await supabase.auth.getSession();
      console.log('📱 Frontend: Session check:', session ? 'SESSION_FOUND' : 'NO_SESSION');
      
      if (!session) {
        throw new Error('Sessione non trovata - accesso negato');
      }

      const requestPayload = {
        prompt: prompt.trim(),
        contentType,
        missionId: null // Per ora null, in futuro si potrà selezionare una missione
      };
      
      console.log('📤 Frontend: Sending request payload:', requestPayload);
      console.log('🔐 Frontend: Using JWT token:', session.access_token.substring(0, 20) + '...');

      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: requestPayload
      });

      console.log('📥 Frontend: Raw response data:', data);
      console.log('📥 Frontend: Raw response error:', error);

      if (error) {
        console.error('🚨 Frontend: Supabase functions error:', error);
        throw new Error(`Edge Function Error: ${error.message || 'Unknown Supabase error'}`);
      }

      if (data?.error) {
        console.error('🚨 Frontend: Edge Function returned error:', data);
        throw new Error(`AI Generator Error: ${data.error}`);
      }

      if (!data?.content) {
        console.error('🚨 Frontend: No content in response:', data);
        throw new Error('Nessun contenuto generato dall\'AI');
      }

      console.log('✅ Frontend: Successfully generated content:', data.content);
      setGeneratedContent(data.content);
      
      if (data.saved) {
        toast.success('Contenuto generato e salvato con successo!');
      } else {
        toast.success('Contenuto generato!');
        toast.error('Attenzione: contenuto non salvato nel database');
      }
    } catch (error) {
      console.error('🚨 Frontend: Complete error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        prompt: prompt.trim(),
        contentType: contentType
      });
      
      // Mostra errore specifico all'utente invece di messaggio generico
      let userErrorMessage = 'Errore durante la generazione del contenuto';
      
      if (error.message?.includes('Sessione non trovata')) {
        userErrorMessage = 'Sessione scaduta. Riloggati per continuare.';
      } else if (error.message?.includes('Edge Function Error')) {
        userErrorMessage = 'Errore del server AI. Riprova tra qualche secondo.';
      } else if (error.message?.includes('AI Generator Error')) {
        userErrorMessage = `Errore AI: ${error.message.replace('AI Generator Error: ', '')}`;
      } else if (error.message) {
        userErrorMessage = error.message;
      }
      
      toast.error(userErrorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const contentTypes = [
    { id: 'clue', label: 'Indizio', icon: FileText, color: 'from-blue-500 to-purple-600' },
    { id: 'mission', label: 'Missione', icon: Zap, color: 'from-purple-500 to-pink-600' },
    { id: 'story', label: 'Storia', icon: Image, color: 'from-green-500 to-blue-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818] p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={onBack}
              variant="ghost"
              className="glass-card p-2 border border-white/20 hover:border-[#4361ee]/50"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-orbitron font-bold text-white">
                  AI Content Generator
                </h1>
                <p className="text-gray-400">Sistema di generazione automatica M1SSION™</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Control Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-[#4361ee]" />
                    Pannello di Controllo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Content Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Tipo di Contenuto
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {contentTypes.map((type) => (
                        <motion.button
                          key={type.id}
                          onClick={() => setContentType(type.id as any)}
                          className={`p-3 rounded-lg border transition-all ${
                            contentType === type.id
                              ? 'border-[#4361ee] bg-[#4361ee]/20'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <type.icon className={`w-5 h-5 mx-auto mb-1 ${
                            contentType === type.id ? 'text-[#4361ee]' : 'text-gray-400'
                          }`} />
                          <div className={`text-xs ${
                            contentType === type.id ? 'text-white' : 'text-gray-400'
                          }`}>
                            {type.label}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Prompt Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Prompt di Generazione
                    </label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Inserisci il prompt per generare contenuto automaticamente..."
                      className="glass-input bg-black/20 border-white/20 text-white placeholder-gray-400 min-h-[120px]"
                      rows={5}
                    />
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] hover:from-[#4361ee]/80 hover:to-[#7209b7]/80 text-white font-semibold py-3"
                  >
                    {isGenerating ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Genera Contenuto
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Preview Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#7209b7]" />
                    Anteprima Contenuto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedContent ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-black/30 rounded-lg p-4 border border-white/10"
                    >
                      <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                        {generatedContent}
                      </pre>
                    </motion.div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Il contenuto generato apparirà qui</p>
                      <p className="text-sm mt-2">Inserisci un prompt e clicca "Genera Contenuto"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Stats Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card className="glass-card border border-white/20">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#4361ee]">42</div>
                    <div className="text-sm text-gray-400">Indizi Generati</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#7209b7]">15</div>
                    <div className="text-sm text-gray-400">Missioni Create</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">89%</div>
                    <div className="text-sm text-gray-400">Successo AI</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">1.2k</div>
                    <div className="text-sm text-gray-400">Token Utilizzati</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AIContentGenerator;