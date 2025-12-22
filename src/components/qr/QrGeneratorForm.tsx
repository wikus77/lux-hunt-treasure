/**
 * M1SSION™ QR Generator Form Component - ENHANCED
 * Form per generare singoli QR codes con personalizzazione completa
 * Stili, logo, testo custom
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Link, Gift, Users, MapPin, FileText, Clock, AlertCircle, Palette, Type, Image, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  MissionQrType, 
  MissionQrConfig,
  buildQrUrl, 
  GeneratedQr,
  QR_TYPE_LABELS,
  validateMissionUrl
} from '@/utils/qr/missionQr';
import { MissionQrCard, QrLogoStyle } from './MissionQrCard';

interface QrGeneratorFormProps {
  onQrGenerated?: (qr: GeneratedQr) => void;
}

const QR_TYPE_OPTIONS: { value: MissionQrType; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    value: 'LINK', 
    label: 'Link Interno', 
    icon: <Link className="w-5 h-5" />,
    description: 'QR che apre una pagina interna M1SSION'
  },
  { 
    value: 'CLAIM', 
    label: 'Claim Reward', 
    icon: <Gift className="w-5 h-5" />,
    description: 'QR per riscattare un premio (token univoco)'
  },
  { 
    value: 'INVITE', 
    label: 'Agent Invite', 
    icon: <Users className="w-5 h-5" />,
    description: 'QR per invitare nuovi agenti'
  },
  { 
    value: 'CHECKPOINT', 
    label: 'Checkpoint', 
    icon: <MapPin className="w-5 h-5" />,
    description: 'QR per checkpoint o area specifica'
  },
  { 
    value: 'BRIEF', 
    label: 'Mission Brief', 
    icon: <FileText className="w-5 h-5" />,
    description: 'QR per briefing missione'
  },
  { 
    value: 'TIME_LOCKED', 
    label: 'Time-Locked', 
    icon: <Clock className="w-5 h-5" />,
    description: 'QR con scadenza temporale'
  }
];

// Logo opzioni
const LOGO_OPTIONS: { value: QrLogoStyle; label: string; description: string }[] = [
  { value: 'M1', label: 'Logo M1', description: 'Logo ufficiale M1 (M cyan + 1 bianco)' },
  { value: 'M1SSION', label: 'Testo M1SSION', description: 'Testo completo con stile header' },
  { value: 'none', label: 'Nessuno', description: 'QR senza logo centrale' }
];

export const QrGeneratorForm: React.FC<QrGeneratorFormProps> = ({ onQrGenerated }) => {
  const [selectedType, setSelectedType] = useState<MissionQrType>('LINK');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [targetPath, setTargetPath] = useState('/home');
  const [expiresAt, setExpiresAt] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQr, setGeneratedQr] = useState<GeneratedQr | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  // Nuovi stati per personalizzazione
  const [customText, setCustomText] = useState('');          // Testo sotto il QR
  const [logoStyle, setLogoStyle] = useState<QrLogoStyle>('M1');
  const [showCustomization, setShowCustomization] = useState(true);
  
  // Salvataggio in QR Control Panel
  const [saveToPanel, setSaveToPanel] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Valida path in tempo reale
  const handlePathChange = (value: string) => {
    setTargetPath(value);
    
    if (value && (selectedType === 'LINK' || selectedType === 'TIME_LOCKED')) {
      const validation = validateMissionUrl(value);
      setValidationError(validation.valid ? '' : validation.error || '');
    } else {
      setValidationError('');
    }
  };

  // Genera QR
  const handleGenerate = async () => {
    if (!label.trim()) {
      toast.error('Inserisci un label/titolo');
      return;
    }

    // Valida path per tipi che lo richiedono
    if ((selectedType === 'LINK' || selectedType === 'TIME_LOCKED') && !targetPath) {
      toast.error('Inserisci il path target');
      return;
    }

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsGenerating(true);

    try {
      const config: MissionQrConfig = {
        type: selectedType,
        label: label.trim(),
        description: description.trim() || undefined,
        targetPath: (selectedType === 'LINK' || selectedType === 'TIME_LOCKED') ? targetPath : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        rewardAmount: rewardAmount ? Number(rewardAmount) : undefined
      };

      const qr = buildQrUrl(config);
      setGeneratedQr(qr);
      onQrGenerated?.(qr);
      
      // Salva nel database se richiesto
      if (saveToPanel) {
        await saveQrToDatabase(qr);
      } else {
        toast.success('✅ QR Code generato!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Errore nella generazione');
    } finally {
      setIsGenerating(false);
    }
  };

  // Salva QR nel database (qr_codes table)
  const saveQrToDatabase = async (qr: GeneratedQr) => {
    setIsSaving(true);
    try {
      // Genera codice univoco per il QR
      const qrCode = qr.token || `QR-${Date.now().toString(36).toUpperCase()}`;
      
      // Mappa il tipo QR al reward_type del database
      const rewardTypeMap: Record<MissionQrType, string> = {
        'LINK': 'link',
        'CLAIM': 'buzz_credit',
        'INVITE': 'invite',
        'CHECKPOINT': 'checkpoint',
        'BRIEF': 'brief',
        'TIME_LOCKED': 'time_locked'
      };

      const { error } = await supabase
        .from('qr_codes')
        .insert([{
          code: qrCode,
          title: qr.label,
          reward_type: rewardTypeMap[qr.type] || 'custom',
          is_active: true,
          expires_at: qr.expiresAt ? new Date(qr.expiresAt).toISOString() : null,
          // URL del QR per riferimento
          lat: 0, // Placeholder - può essere aggiornato dopo
          lng: 0  // Placeholder - può essere aggiornato dopo
        }]);

      if (error) {
        console.error('[QrGeneratorForm] Errore salvataggio:', error);
        toast.error(`Errore salvataggio: ${error.message}`);
      } else {
        toast.success('✅ QR generato e salvato nel Control Panel!');
      }
    } catch (err: any) {
      console.error('[QrGeneratorForm] Errore:', err);
      toast.error('Errore nel salvataggio');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setLabel('');
    setDescription('');
    setTargetPath('/home');
    setExpiresAt('');
    setRewardAmount('');
    setGeneratedQr(null);
    setValidationError('');
    setCustomText('');
    setLogoStyle('M1');
  };

  const selectedTypeInfo = QR_TYPE_OPTIONS.find(t => t.value === selectedType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
          <QrCode className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white">QR Generator PRO</h3>
          <p className="text-xs text-gray-400">Genera QR codes personalizzati M1SSION</p>
        </div>
      </div>

      {/* Type Selection */}
      <div className="space-y-2">
        <Label>Tipo QR Code</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {QR_TYPE_OPTIONS.map((option) => {
            const isSelected = selectedType === option.value;
            return (
              <motion.button
                key={option.value}
                onClick={() => setSelectedType(option.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected 
                    ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/20' 
                    : 'border-gray-700 bg-black/30 hover:border-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`flex items-center gap-2 mb-1 ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`}>
                  {option.icon}
                  <span className="font-semibold text-sm text-white">{option.label}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{option.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Label */}
        <div>
          <Label htmlFor="qr-label">Label/Titolo *</Label>
          <Input
            id="qr-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Es: Premio Speciale Milano"
            className="bg-black/30 border-gray-700"
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="qr-desc">Descrizione (opzionale)</Label>
          <Textarea
            id="qr-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrizione breve del QR..."
            rows={2}
            className="bg-black/30 border-gray-700"
          />
        </div>

        {/* Target Path - per LINK e TIME_LOCKED */}
        {(selectedType === 'LINK' || selectedType === 'TIME_LOCKED') && (
          <div>
            <Label htmlFor="qr-path">Path Target *</Label>
            <Input
              id="qr-path"
              value={targetPath}
              onChange={(e) => handlePathChange(e.target.value)}
              placeholder="/map-3d-tiler"
              className={`bg-black/30 ${validationError ? 'border-red-500' : 'border-gray-700'}`}
            />
            {validationError ? (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
                <AlertCircle className="w-3 h-3" />
                {validationError}
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Solo percorsi M1SSION interni (es: /home, /buzz, /map-3d-tiler)
              </p>
            )}
          </div>
        )}

        {/* Expiry - per TIME_LOCKED e opzionalmente altri */}
        {(selectedType === 'TIME_LOCKED' || selectedType === 'CLAIM') && (
          <div>
            <Label htmlFor="qr-expiry">
              Data Scadenza {selectedType === 'TIME_LOCKED' ? '*' : '(opzionale)'}
            </Label>
            <Input
              id="qr-expiry"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="bg-black/30 border-gray-700"
            />
          </div>
        )}

        {/* Reward Amount - per CLAIM */}
        {selectedType === 'CLAIM' && (
          <div>
            <Label htmlFor="qr-reward">Valore Reward (opzionale)</Label>
            <Input
              id="qr-reward"
              type="number"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              placeholder="Es: 100 (M1U)"
              className="bg-black/30 border-gray-700"
            />
          </div>
        )}
      </div>

      {/* ===== PERSONALIZZAZIONE QR ===== */}
      <div className="border-t border-gray-800 pt-4">
        <button
          onClick={() => setShowCustomization(!showCustomization)}
          className="flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 mb-4"
        >
          <Palette className="w-4 h-4" />
          {showCustomization ? '▼' : '▶'} Personalizzazione Sticker
        </button>

        {showCustomization && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            {/* Testo Custom sotto il QR */}
            <div>
              <Label htmlFor="qr-custom-text" className="flex items-center gap-2">
                <Type className="w-4 h-4 text-purple-400" />
                Testo sotto il QR (per adesivi)
              </Label>
              <Input
                id="qr-custom-text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Es: M1SSION, SCAN ME, PREMIO..."
                className="bg-black/30 border-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Se inizia con "M1", avrà lo stile ufficiale (M1 cyan + resto bianco)
              </p>
            </div>

            {/* Logo interno */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Image className="w-4 h-4 text-purple-400" />
                Logo al centro del QR
              </Label>
              <div className="space-y-2">
                {LOGO_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLogoStyle(option.value)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      logoStyle === option.value
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-gray-700 bg-black/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        logoStyle === option.value ? 'bg-purple-500' : 'bg-gray-700'
                      }`}>
                        {logoStyle === option.value && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Salva nel Control Panel */}
      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Save className="w-4 h-4 text-green-400" />
          <div>
            <div className="text-sm font-semibold text-white">Salva in QR Control Panel</div>
            <div className="text-xs text-gray-400">Il QR sarà visibile e gestibile dal pannello</div>
          </div>
        </div>
        <button
          onClick={() => setSaveToPanel(!saveToPanel)}
          className={`w-12 h-6 rounded-full transition-colors ${
            saveToPanel ? 'bg-green-500' : 'bg-gray-600'
          }`}
        >
          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
            saveToPanel ? 'translate-x-6' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || isSaving || !label.trim() || !!validationError}
          className="flex-1"
          style={{
            background: 'linear-gradient(90deg, #00D1FF, #00FF88)',
            color: '#000'
          }}
        >
          {isGenerating || isSaving ? 'Generazione...' : saveToPanel ? '⚡ Genera e Salva' : '⚡ Genera QR Code'}
        </Button>
        
        {generatedQr && (
          <Button 
            onClick={handleReset} 
            variant="outline"
          >
            Nuovo
          </Button>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
          <div className="text-xs text-blue-300">
            <strong>Sicurezza:</strong> I QR generati puntano esclusivamente a {' '}
            <code className="bg-black/30 px-1 rounded">m1ssion.eu</code>. 
            Domini esterni sono bloccati automaticamente.
          </div>
        </div>
      </div>

      {/* Generated QR Preview */}
      {generatedQr && (
        <MissionQrCard
          isOpen={!!generatedQr}
          onClose={() => setGeneratedQr(null)}
          url={generatedQr.url}
          label={generatedQr.label}
          type={generatedQr.type}
          token={generatedQr.token}
          expiresAt={generatedQr.expiresAt}
          customText={customText}
          logoStyle={logoStyle}
        />
      )}
    </div>
  );
};

export default QrGeneratorForm;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
