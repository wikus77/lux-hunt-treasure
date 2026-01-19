/**
 * M1SSION™ Long Press Info Modal
 * Modal compatto per mostrare info rapide su long press
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';

export interface InfoItem {
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
}

interface LongPressInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  // Support either items array OR custom content
  items?: InfoItem[];
  content?: React.ReactNode;
  footer?: React.ReactNode;
}

export const LongPressInfoModal: React.FC<LongPressInfoModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  accentColor = '#00D1FF',
  items,
  content,
  footer
}) => {
  // Server-side rendering guard
  if (typeof document === 'undefined') return null;
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-2xl relative"
            style={{
              background: 'linear-gradient(145deg, rgba(10, 15, 30, 0.98), rgba(20, 30, 50, 0.95))',
              border: `1px solid ${accentColor}40`,
              boxShadow: `0 0 40px ${accentColor}30, 0 8px 32px rgba(0, 0, 0, 0.5)`,
            }}
          >
            {/* Glow top border */}
            <div 
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
              }}
            />

            {/* Header */}
            <div className="p-4 pb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                {icon && (
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${accentColor}20`,
                      border: `1px solid ${accentColor}40`,
                    }}
                  >
                    {icon}
                  </div>
                )}
                <div>
                  <h3 
                    className="text-lg font-bold text-white"
                    style={{ textShadow: `0 0 20px ${accentColor}50` }}
                  >
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-xs text-white/50">{subtitle}</p>
                  )}
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Content - Support both items array and custom content */}
            <div className="px-4 pb-4">
              {content ? (
                // Custom content mode
                <div>{content}</div>
              ) : items && items.length > 0 ? (
                // Items array mode
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between py-2 px-3 rounded-lg"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon && (
                          <span className="text-white/40">{item.icon}</span>
                        )}
                        <span className="text-sm text-white/60">{item.label}</span>
                      </div>
                      <span 
                        className="text-sm font-bold"
                        style={{ color: item.color || accentColor }}
                      >
                        {item.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                // No content fallback
                <p className="text-center text-white/40 text-sm">Nessuna informazione disponibile</p>
              )}
            </div>

            {/* Footer */}
            {footer && (
              <div 
                className="px-4 py-3 border-t"
                style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
              >
                {footer}
              </div>
            )}

            {/* Hint */}
            <div className="px-4 py-2 text-center">
              <p className="text-[10px] text-white/30 flex items-center justify-center gap-1">
                <Info className="w-3 h-3" />
                Tocca fuori per chiudere
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LongPressInfoModal;
