/**
 * M1SSION™ QR Card Component - FIXED
 * Card stile neon/glass per visualizzazione e download QR codes
 * Download genera immagine con Canvas puro (no html2canvas bugs)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Copy, Check, Download } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { toast } from 'sonner';
import { QR_TYPE_LABELS, MissionQrType, formatExpiry, isExpired } from '@/utils/qr/missionQr';

// Logo interno QR - solo opzioni che funzionano
export type QrLogoStyle = 'M1' | 'M1SSION' | 'none';

// Export per compatibilità (ma non più usato)
export type QrDotStyle = 'squares';

interface MissionQrCardProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  label: string;
  type: MissionQrType;
  token?: string;
  expiresAt?: Date | string;
  showPrintButton?: boolean;
  customText?: string;
  qrStyle?: QrDotStyle;  // Ignorato - solo squares funziona
  logoStyle?: QrLogoStyle;
}

// Percorso logo M1 ufficiale
const M1_LOGO_URL = '/icons/icon-m1-512x512.png';

export const MissionQrCard: React.FC<MissionQrCardProps> = ({
  isOpen,
  onClose,
  url,
  label,
  type,
  token,
  expiresAt,
  showPrintButton = true,
  customText = '',
  logoStyle = 'M1'
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Genera QR code con logo al centro
  useEffect(() => {
    if (!isOpen || !url) return;

    const generateQR = async () => {
      try {
        // Genera QR base ad alta risoluzione - SOLO QUADRATI (funzionano sempre)
        const baseQr = await QRCodeLib.toDataURL(url, {
          width: 512,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H'
        });

        // Se non serve logo, usa il QR base
        if (logoStyle === 'none') {
          setQrDataUrl(baseQr);
          return;
        }

        // Aggiungi logo al centro
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setQrDataUrl(baseQr);
          return;
        }

        canvas.width = 512;
        canvas.height = 512;

        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        
        qrImg.onload = async () => {
          ctx.drawImage(qrImg, 0, 0, 512, 512);
          await drawCenterLogo(ctx, logoStyle);
          setQrDataUrl(canvas.toDataURL('image/png'));
        };
        
        qrImg.onerror = () => {
          setQrDataUrl(baseQr);
        };
        
        qrImg.src = baseQr;
      } catch (error) {
        console.error('[MissionQrCard] Errore generazione QR:', error);
        toast.error('Errore nella generazione del QR Code');
      }
    };

    generateQR();
  }, [isOpen, url, logoStyle]);

  // Disegna logo al centro del QR
  const drawCenterLogo = async (ctx: CanvasRenderingContext2D, style: QrLogoStyle): Promise<void> => {
    const centerX = 256;
    const centerY = 256;
    const logoSize = 80;
    
    // Sfondo bianco per logo
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(centerX - logoSize/2 - 8, centerY - logoSize/2 - 8, logoSize + 16, logoSize + 16, 10);
    ctx.fill();
    
    // Bordo cyan
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    if (style === 'M1') {
      // Prova a caricare il logo ufficiale
      return new Promise<void>((resolve) => {
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.onload = () => {
          ctx.drawImage(logo, centerX - logoSize/2, centerY - logoSize/2, logoSize, logoSize);
          resolve();
        };
        logo.onerror = () => {
          // Fallback: disegna M1 con testo
          ctx.font = 'bold 36px "Orbitron", Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#00E5FF';
          ctx.fillText('M', centerX - 12, centerY);
          ctx.fillStyle = '#000000';
          ctx.fillText('1', centerX + 18, centerY);
          resolve();
        };
        logo.src = M1_LOGO_URL;
      });
    } else if (style === 'M1SSION') {
      ctx.font = 'bold 16px "Orbitron", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#00E5FF';
      ctx.fillText('M1', centerX - 22, centerY);
      ctx.fillStyle = '#000000';
      ctx.fillText('SSION', centerX + 20, centerY);
    }
  };

  // Copy URL to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copiato!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Errore nella copia');
    }
  };

  // Helper: word wrap per testo lungo
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  // Download CARD COMPLETA - genera con Canvas puro
  const handleDownload = async () => {
    if (!qrDataUrl) return;
    
    try {
      toast.loading('Generazione immagine...');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');
      
      // Calcola altezza dinamica in base al testo
      const width = 600;
      const baseHeight = 750;
      
      // Pre-calcola linee del testo custom per determinare altezza
      let customTextLines: string[] = [];
      if (customText) {
        ctx.font = 'bold 28px "Orbitron", Arial, sans-serif';
        customTextLines = wrapText(ctx, customText.toUpperCase(), width - 80);
      }
      
      const extraHeight = customText ? (customTextLines.length * 40) + 30 : 0;
      const height = baseHeight + extraHeight;
      
      canvas.width = width;
      canvas.height = height;
      
      // Sfondo gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Bordo neon
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 4;
      ctx.roundRect(10, 10, width - 20, height - 20, 20);
      ctx.stroke();
      
      // Glow effect interno
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 30;
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.roundRect(15, 15, width - 30, height - 30, 18);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Header: M1SSION™ QR CODE
      ctx.font = 'bold 32px "Orbitron", Arial, sans-serif';
      ctx.textAlign = 'center';
      
      // M1 cyan
      ctx.fillStyle = '#00E5FF';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 15;
      ctx.fillText('M1', width/2 - 90, 60);
      ctx.shadowBlur = 0;
      
      // SSION™ bianco
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('SSION™', width/2 + 10, 60);
      
      // QR CODE testo
      ctx.font = 'bold 20px "Orbitron", Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('QR CODE', width/2 + 140, 60);
      
      // Type Badge
      const typeInfo = QR_TYPE_LABELS[type];
      ctx.font = 'bold 14px "Orbitron", Arial, sans-serif';
      const badgeText = `${typeInfo.icon} ${typeInfo.label}`;
      const badgeWidth = ctx.measureText(badgeText).width + 40;
      
      // Badge background
      ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(width/2 - badgeWidth/2, 85, badgeWidth, 35, 20);
      ctx.fill();
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Badge text
      ctx.fillStyle = '#00E5FF';
      ctx.fillText(badgeText, width/2, 107);
      
      // QR Code container (sfondo bianco)
      const qrSize = 350;
      const qrX = (width - qrSize) / 2;
      const qrY = 140;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 4;
      ctx.beginPath();
      ctx.roundRect(qrX - 20, qrY, qrSize + 40, qrSize + 40, 20);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      // Carica e disegna QR
      await new Promise<void>((resolve) => {
        const qrImg = new Image();
        qrImg.onload = () => {
          ctx.drawImage(qrImg, qrX, qrY + 20, qrSize, qrSize);
          resolve();
        };
        qrImg.onerror = () => resolve();
        qrImg.src = qrDataUrl;
      });
      
      let yOffset = qrY + qrSize + 70;
      
      // Custom Text con WORD WRAP (multiriga) - TUTTO CENTRATO
      if (customText && customTextLines.length > 0) {
        ctx.font = 'bold 28px "Orbitron", Arial, sans-serif';
        ctx.textAlign = 'center';
        
        for (const line of customTextLines) {
          // Controlla se la linea inizia con M1 per applicare stile bicolore
          if (line.startsWith('M1')) {
            // Calcola posizione per centrare il testo completo
            const m1Width = ctx.measureText('M1').width;
            const restText = line.slice(2);
            const restWidth = ctx.measureText(restText).width;
            const totalWidth = m1Width + restWidth;
            const centerX = width / 2;
            const startX = centerX - totalWidth / 2;
            
            // M1 in cyan con glow
            ctx.textAlign = 'left';
            ctx.fillStyle = '#00E5FF';
            ctx.shadowColor = '#00E5FF';
            ctx.shadowBlur = 15;
            ctx.fillText('M1', startX, yOffset);
            ctx.shadowBlur = 0;
            
            // Resto in bianco
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(restText, startX + m1Width, yOffset);
          } else {
            // Testo normale centrato
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(line, width / 2, yOffset);
          }
          yOffset += 40;
        }
        yOffset += 10;
      }
      
      // Label
      ctx.font = 'bold 18px "Orbitron", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00E5FF';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 10;
      ctx.fillText(label, width/2, yOffset);
      ctx.shadowBlur = 0;
      yOffset += 30;
      
      // Token (se presente)
      if (token) {
        ctx.font = '12px monospace';
        ctx.fillStyle = '#666666';
        const displayToken = token.length > 40 ? token.substring(0, 40) + '...' : token;
        ctx.fillText(displayToken, width/2, yOffset);
        yOffset += 25;
      }
      
      // Expiry (se presente)
      if (expiresAt) {
        const expired = isExpired(expiresAt);
        ctx.font = 'bold 12px "Orbitron", Arial, sans-serif';
        ctx.fillStyle = expired ? '#ff3232' : '#00ff88';
        const expiryText = expired ? '⚠️ SCADUTO' : `⏰ Scade: ${formatExpiry(expiresAt)}`;
        ctx.fillText(expiryText, width/2, yOffset);
        yOffset += 30;
      }
      
      // Footer
      ctx.font = '11px "Orbitron", Arial, sans-serif';
      ctx.fillStyle = '#444444';
      ctx.fillText('© 2025 M1SSION™ - NIYVORA KFT', width/2, height - 25);
      
      // Download
      const link = document.createElement('a');
      link.download = `M1SSION_QR_${label.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.dismiss();
      toast.success('Card QR scaricata!');
    } catch (error) {
      console.error('[MissionQrCard] Errore download:', error);
      toast.dismiss();
      toast.error('Errore nel download');
      
      // Fallback: scarica solo il QR
      if (qrDataUrl) {
        const link = document.createElement('a');
        link.download = `M1SSION_QR_${label.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        link.href = qrDataUrl;
        link.click();
      }
    }
  };

  // Print QR card
  const handlePrint = () => {
    if (!qrDataUrl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup bloccato dal browser');
      return;
    }

    const typeInfo = QR_TYPE_LABELS[type];
    const expired = isExpired(expiresAt);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>M1SSION™ QR - ${label}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Orbitron', sans-serif;
            background: #000;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }
          
          .card {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            border: 3px solid #00E5FF;
            border-radius: 24px;
            padding: 40px 35px;
            text-align: center;
            max-width: 380px;
            box-shadow: 0 0 60px rgba(0, 229, 255, 0.4);
          }
          
          .header {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 12px;
            letter-spacing: 2px;
          }
          
          .header .m1 {
            color: #00E5FF;
            text-shadow: 0 0 15px rgba(0, 229, 255, 0.8);
          }
          
          .header .ssion {
            color: #fff;
          }
          
          .type-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 20px;
            background: rgba(0, 229, 255, 0.15);
            border: 1px solid #00E5FF;
            border-radius: 24px;
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 24px;
            color: #00E5FF;
          }
          
          .qr-container {
            background: #fff;
            border-radius: 20px;
            padding: 20px;
            margin: 0 auto 20px;
            width: fit-content;
          }
          
          .qr-container img {
            width: 220px;
            height: 220px;
            display: block;
          }
          
          .custom-text {
            font-size: 28px;
            font-weight: 900;
            margin: 20px 0 8px;
            letter-spacing: 4px;
          }
          
          .custom-text .m1 {
            color: #00E5FF;
            text-shadow: 0 0 20px rgba(0, 229, 255, 0.8);
          }
          
          .custom-text .rest {
            color: #fff;
          }
          
          .label {
            color: #00E5FF;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0 5px;
            text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
          }
          
          .token {
            color: #666;
            font-size: 9px;
            font-family: monospace;
            word-break: break-all;
          }
          
          .expiry {
            margin-top: 15px;
            padding: 8px 18px;
            background: ${expired ? 'rgba(255, 50, 50, 0.2)' : 'rgba(0, 255, 136, 0.2)'};
            border: 1px solid ${expired ? '#ff3232' : '#00ff88'};
            border-radius: 10px;
            font-size: 10px;
            font-weight: 600;
            color: ${expired ? '#ff3232' : '#00ff88'};
            display: inline-block;
          }
          
          .footer {
            margin-top: 24px;
            font-size: 9px;
            color: #444;
          }
          
          @media print {
            body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="m1">M1</span><span class="ssion">SSION™</span> QR CODE
          </div>
          <div class="type-badge">${typeInfo.icon} ${typeInfo.label}</div>
          
          <div class="qr-container">
            <img src="${qrDataUrl}" alt="QR Code" />
          </div>
          
          ${customText ? `
            <div class="custom-text">
              ${customText.toUpperCase().startsWith('M1') 
                ? `<span class="m1">M1</span><span class="rest">${customText.slice(2).toUpperCase()}</span>`
                : `<span class="rest">${customText.toUpperCase()}</span>`
              }
            </div>
          ` : ''}
          
          <div class="label">${label}</div>
          ${token ? `<div class="token">${token}</div>` : ''}
          
          ${expiresAt ? `
            <div class="expiry">
              ${expired ? '⚠️ SCADUTO' : `⏰ Scade: ${formatExpiry(expiresAt)}`}
            </div>
          ` : ''}
          
          <div class="footer">© 2025 M1SSION™ - NIYVORA KFT</div>
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

  const typeInfo = QR_TYPE_LABELS[type];
  const expired = isExpired(expiresAt);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          
          {/* Card */}
          <motion.div
            className="relative w-full max-w-sm"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-black border-2 border-gray-600 hover:border-gray-400 flex items-center justify-center transition-colors z-20"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Card Container */}
            <div 
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
                border: '3px solid #00E5FF',
                boxShadow: '0 0 60px rgba(0, 229, 255, 0.4), inset 0 0 30px rgba(0, 229, 255, 0.1)'
              }}
            >
              <div className="p-6 text-center">
                {/* Header */}
                <h2 
                  className="text-xl font-bold mb-3"
                  style={{ fontFamily: 'Orbitron, sans-serif', letterSpacing: '2px' }}
                >
                  <span style={{ color: '#00E5FF', textShadow: '0 0 15px rgba(0, 229, 255, 0.8)' }}>M1</span>
                  <span className="text-white">SSION™</span>
                  <span className="text-white opacity-70 text-sm ml-2">QR CODE</span>
                </h2>

                {/* Type Badge */}
                <div 
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold mb-5"
                  style={{
                    background: 'rgba(0, 229, 255, 0.15)',
                    border: '1px solid #00E5FF',
                    color: '#00E5FF'
                  }}
                >
                  <span>{typeInfo.icon}</span>
                  <span>{typeInfo.label}</span>
                </div>

                {/* QR Code */}
                <div 
                  className="bg-white rounded-2xl p-5 mx-auto w-fit mb-5"
                  style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}
                >
                  {qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt="QR Code" 
                      className="w-52 h-52"
                    />
                  ) : (
                    <div className="w-52 h-52 flex items-center justify-center text-gray-400">
                      Generazione...
                    </div>
                  )}
                </div>

                {/* Custom Text */}
                {customText && (
                  <div 
                    className="text-2xl font-black mb-2"
                    style={{ fontFamily: 'Orbitron, sans-serif', letterSpacing: '4px' }}
                  >
                    {customText.toUpperCase().startsWith('M1') ? (
                      <>
                        <span style={{ color: '#00E5FF', textShadow: '0 0 20px rgba(0, 229, 255, 0.8)' }}>M1</span>
                        <span className="text-white">{customText.slice(2).toUpperCase()}</span>
                      </>
                    ) : (
                      <span className="text-white">{customText.toUpperCase()}</span>
                    )}
                  </div>
                )}

                {/* Label */}
                <div 
                  className="text-sm font-semibold mb-1"
                  style={{ color: '#00E5FF', textShadow: '0 0 10px rgba(0, 229, 255, 0.5)' }}
                >
                  {label}
                </div>

                {/* Token */}
                {token && (
                  <div className="text-[10px] text-gray-500 font-mono break-all px-4">
                    {token}
                  </div>
                )}

                {/* Expiry */}
                {expiresAt && (
                  <div 
                    className={`mt-3 inline-block px-4 py-2 rounded-lg text-xs font-semibold ${
                      expired 
                        ? 'bg-red-500/20 border border-red-500 text-red-400' 
                        : 'bg-green-500/20 border border-green-500 text-green-400'
                    }`}
                  >
                    {expired ? '⚠️ SCADUTO' : `⏰ Scade: ${formatExpiry(expiresAt)}`}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-5 text-[9px] text-gray-600 tracking-wider">
                  © 2025 M1SSION™ - NIYVORA KFT
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 justify-center">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiato!' : 'Copia'}
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                Scarica
              </button>

              {showPrintButton && (
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{
                    background: 'linear-gradient(90deg, #00E5FF, #00FF88)',
                    color: '#000'
                  }}
                >
                  <Printer className="w-4 h-4" />
                  Stampa
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MissionQrCard;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
