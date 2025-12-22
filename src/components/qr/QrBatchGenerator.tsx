/**
 * M1SSION™ QR Batch Generator Component
 * Generazione batch di QR codes con print pack
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Printer, Copy, Check, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import QRCodeLib from 'qrcode';
import { 
  MissionQrType, 
  generateBatch, 
  GeneratedQr,
  QR_TYPE_LABELS,
  validateMissionUrl
} from '@/utils/qr/missionQr';
import { MissionQrCard } from './MissionQrCard';

interface QrBatchGeneratorProps {
  onBatchGenerated?: (batch: GeneratedQr[]) => void;
}

const BATCH_SIZES = [5, 10, 25, 50];

export const QrBatchGenerator: React.FC<QrBatchGeneratorProps> = ({ onBatchGenerated }) => {
  const [qrType, setQrType] = useState<MissionQrType>('CLAIM');
  const [baseLabel, setBaseLabel] = useState('');
  const [targetPath, setTargetPath] = useState('/home');
  const [batchSize, setBatchSize] = useState<number>(10);
  const [generatedBatch, setGeneratedBatch] = useState<GeneratedQr[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [previewQr, setPreviewQr] = useState<GeneratedQr | null>(null);
  const [qrPreviews, setQrPreviews] = useState<Record<number, string>>({});

  // Genera batch di QR
  const handleGenerateBatch = async () => {
    if (!baseLabel.trim()) {
      toast.error('Inserisci un label base');
      return;
    }

    // Valida path per tipo LINK
    if (qrType === 'LINK' || qrType === 'TIME_LOCKED') {
      const validation = validateMissionUrl(targetPath);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
    }

    setIsGenerating(true);

    try {
      const batch = generateBatch(
        {
          type: qrType,
          label: baseLabel,
          targetPath: qrType === 'LINK' || qrType === 'TIME_LOCKED' ? targetPath : undefined
        },
        batchSize
      );

      setGeneratedBatch(batch);
      
      // Genera preview per ogni QR
      const previews: Record<number, string> = {};
      for (let i = 0; i < batch.length; i++) {
        try {
          const dataUrl = await QRCodeLib.toDataURL(batch[i].url, {
            width: 128,
            margin: 1,
            errorCorrectionLevel: 'M'
          });
          previews[i] = dataUrl;
        } catch (e) {
          console.error(`Errore generazione preview ${i}:`, e);
        }
      }
      setQrPreviews(previews);

      onBatchGenerated?.(batch);
      toast.success(`✅ Generati ${batch.length} QR codes!`);
    } catch (error: any) {
      toast.error(error.message || 'Errore nella generazione batch');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copia URL singolo
  const handleCopyUrl = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      toast.success('Link copiato!');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error('Errore nella copia');
    }
  };

  // Stampa pack A4
  const handlePrintPack = () => {
    if (generatedBatch.length === 0) {
      toast.error('Nessun QR da stampare');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup bloccato dal browser');
      return;
    }

    const typeInfo = QR_TYPE_LABELS[qrType];

    // Genera HTML per griglia di QR
    const qrCards = generatedBatch.map((qr, i) => `
      <div class="qr-card">
        <img src="${qrPreviews[i] || ''}" alt="QR ${i + 1}" />
        <div class="qr-label">${qr.label}</div>
        <div class="qr-type">${typeInfo.icon} ${typeInfo.label}</div>
        ${qr.token ? `<div class="qr-token">${qr.token.substring(0, 8)}...</div>` : ''}
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>M1SSION™ QR Pack - ${baseLabel}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          @page {
            size: A4;
            margin: 10mm;
          }
          
          body {
            font-family: 'Orbitron', Arial, sans-serif;
            background: #fff;
            padding: 10mm;
          }
          
          .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
          }
          
          .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
          }
          
          .header .subtitle {
            font-size: 12px;
            color: #666;
          }
          
          .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
          }
          
          .qr-card {
            border: 1px solid #000;
            border-radius: 8px;
            padding: 10px;
            text-align: center;
            page-break-inside: avoid;
          }
          
          .qr-card img {
            width: 100%;
            max-width: 100px;
            height: auto;
            margin-bottom: 5px;
          }
          
          .qr-label {
            font-size: 9px;
            font-weight: bold;
            margin-bottom: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .qr-type {
            font-size: 7px;
            color: #666;
            margin-bottom: 2px;
          }
          
          .qr-token {
            font-size: 6px;
            color: #999;
            font-family: monospace;
          }
          
          .footer {
            margin-top: 15px;
            text-align: center;
            font-size: 10px;
            color: #999;
            padding-top: 10px;
            border-top: 1px solid #ddd;
          }
          
          @media print {
            body { padding: 0; }
            .grid { gap: 8px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>M1SSION™ QR PACK</h1>
          <div class="subtitle">${baseLabel} • ${generatedBatch.length} codici • ${new Date().toLocaleDateString('it-IT')}</div>
        </div>
        
        <div class="grid">
          ${qrCards}
        </div>
        
        <div class="footer">
          © 2025 M1SSION™ - NIYVORA KFT • Generato automaticamente
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); }
          }
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Clear batch
  const handleClearBatch = () => {
    setGeneratedBatch([]);
    setQrPreviews({});
  };

  const typeInfo = QR_TYPE_LABELS[qrType];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white">Batch Generator</h3>
          <p className="text-xs text-gray-400">Genera multipli QR codes</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tipo QR</Label>
            <Select value={qrType} onValueChange={(v) => setQrType(v as MissionQrType)}>
              <SelectTrigger className="bg-black/30 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLAIM">🎁 Claim Reward</SelectItem>
                <SelectItem value="LINK">🔗 Link Interno</SelectItem>
                <SelectItem value="CHECKPOINT">📍 Checkpoint</SelectItem>
                <SelectItem value="BRIEF">📋 Mission Brief</SelectItem>
                <SelectItem value="INVITE">👤 Agent Invite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Quantità</Label>
            <Select value={String(batchSize)} onValueChange={(v) => setBatchSize(Number(v))}>
              <SelectTrigger className="bg-black/30 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BATCH_SIZES.map(size => (
                  <SelectItem key={size} value={String(size)}>{size} QR codes</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Label Base *</Label>
          <Input
            value={baseLabel}
            onChange={(e) => setBaseLabel(e.target.value)}
            placeholder="Es: Premio Evento Milano"
            className="bg-black/30 border-gray-700"
          />
          <p className="text-xs text-gray-500 mt-1">
            I QR saranno numerati: "{baseLabel} #1", "{baseLabel} #2", ecc.
          </p>
        </div>

        {(qrType === 'LINK' || qrType === 'TIME_LOCKED') && (
          <div>
            <Label>Path Target *</Label>
            <Input
              value={targetPath}
              onChange={(e) => setTargetPath(e.target.value)}
              placeholder="/map-3d-tiler"
              className="bg-black/30 border-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">
              Solo percorsi interni M1SSION (es: /home, /buzz, /map-3d-tiler)
            </p>
          </div>
        )}

        <Button 
          onClick={handleGenerateBatch} 
          disabled={isGenerating || !baseLabel.trim()}
          className="w-full"
        >
          {isGenerating ? 'Generazione...' : `⚡ Genera ${batchSize} QR Codes`}
        </Button>
      </div>

      {/* Generated Batch */}
      {generatedBatch.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {generatedBatch.length} QR generati
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrintPack}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Stampa Pack A4
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleClearBatch}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </div>

          {/* QR List */}
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {generatedBatch.map((qr, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-gray-800"
              >
                {/* Preview */}
                {qrPreviews[index] && (
                  <img 
                    src={qrPreviews[index]} 
                    alt={`QR ${index + 1}`}
                    className="w-12 h-12 rounded"
                  />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate">
                    {qr.label}
                  </div>
                  <div className="text-xs text-gray-500 font-mono truncate">
                    {qr.token ? qr.token.substring(0, 20) + '...' : qr.url.substring(0, 40) + '...'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPreviewQr(qr)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyUrl(qr.url, index)}
                    className="h-8 w-8 p-0"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* QR Preview Modal */}
      {previewQr && (
        <MissionQrCard
          isOpen={!!previewQr}
          onClose={() => setPreviewQr(null)}
          url={previewQr.url}
          label={previewQr.label}
          type={previewQr.type}
          token={previewQr.token}
          expiresAt={previewQr.expiresAt}
        />
      )}
    </div>
  );
};

export default QrBatchGenerator;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™


