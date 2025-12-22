/**
 * M1SSION™ QR OPS Panel
 * Pannello completo per operazioni QR avanzate
 * Integra Generator Form + Batch Generator
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Layers, Package, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrGeneratorForm } from './QrGeneratorForm';
import { QrBatchGenerator } from './QrBatchGenerator';

type TabType = 'single' | 'batch';

interface QrOpsPanelProps {
  onBack?: () => void;
}

export const QrOpsPanel: React.FC<QrOpsPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('single');

  const tabs = [
    { id: 'single' as TabType, label: 'Singolo', icon: <QrCode className="w-4 h-4" /> },
    { id: 'batch' as TabType, label: 'Batch', icon: <Package className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #00D1FF 0%, #7209b7 100%)',
              boxShadow: '0 0 30px rgba(0, 209, 255, 0.4)'
            }}
          >
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 
              className="text-2xl font-bold"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                background: 'linear-gradient(90deg, #00D1FF, #7209b7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              M1SSION™ QR OPS
            </h1>
            <p className="text-gray-400 text-sm">Generatore avanzato QR codes</p>
          </div>
        </div>

        {onBack && (
          <button 
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Indietro
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-black/30 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-black/40 border-gray-800">
            <CardContent className="p-6">
              {activeTab === 'single' && <QrGeneratorForm />}
              {activeTab === 'batch' && <QrBatchGenerator />}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Info Footer */}
      <div className="text-center text-xs text-gray-600">
        <p>🔒 Tutti i QR puntano esclusivamente a m1ssion.eu</p>
        <p className="mt-1">© 2025 M1SSION™ - NIYVORA KFT</p>
      </div>
    </div>
  );
};

export default QrOpsPanel;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™


