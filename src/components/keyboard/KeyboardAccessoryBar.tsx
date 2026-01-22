/**
 * M1SSION™ Keyboard Accessory Bar
 * iMessage-style accessory bar that docks above iOS keyboard
 * Safe for App Store - uses web APIs only
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Image, Mic, Paperclip, Sticker, X } from 'lucide-react';
import { useKeyboardDock } from '@/hooks/useKeyboardDock';

// Action sheet items
const ACCESSORY_ACTIONS = [
  { id: 'camera', icon: Camera, label: 'Fotocamera', color: '#FF9500' },
  { id: 'photo', icon: Image, label: 'Foto', color: '#34C759' },
  { id: 'sticker', icon: Sticker, label: 'Adesivi', color: '#AF52DE' },
  { id: 'audio', icon: Mic, label: 'Audio', color: '#FF3B30' },
  { id: 'file', icon: Paperclip, label: 'Allegato', color: '#007AFF' },
];

interface KeyboardAccessoryBarProps {
  onAction?: (actionId: string) => void;
}

/**
 * iMessage-style keyboard accessory bar
 * - Shows "+" button that opens action sheet
 * - Docks above iOS keyboard using visualViewport
 * - Only visible when chat input is focused
 */
export const KeyboardAccessoryBar: React.FC<KeyboardAccessoryBarProps> = ({ onAction }) => {
  const { isOpen, dockBottom, isChatInputFocused } = useKeyboardDock();
  const [showActions, setShowActions] = useState(false);

  const handleActionClick = useCallback((actionId: string) => {
    console.log(`[KeyboardAccessoryBar] Action: ${actionId}`);
    
    // Dispatch custom event for parent components to handle
    const event = new CustomEvent('m1_keyboard_action', {
      detail: { actionId },
      bubbles: true,
    });
    document.dispatchEvent(event);
    
    // Callback for direct handler
    onAction?.(actionId);
    
    // Close action sheet
    setShowActions(false);
  }, [onAction]);

  const toggleActions = useCallback(() => {
    setShowActions(prev => !prev);
  }, []);

  // Don't render if keyboard is not open or no chat input is focused
  if (!isOpen || !isChatInputFocused) {
    return null;
  }

  // Render via portal to escape any parent transforms
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Action sheet overlay */}
          {showActions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70000]"
              style={{ background: 'rgba(0,0,0,0.4)' }}
              onClick={() => setShowActions(false)}
            />
          )}

          {/* Action sheet */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed left-0 right-0 z-[70001] px-3 pb-2"
                style={{
                  bottom: `${dockBottom + 52}px`, // Above accessory bar
                }}
              >
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(30, 30, 30, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <span className="text-white/70 text-sm font-medium">Aggiungi</span>
                    <button
                      onClick={() => setShowActions(false)}
                      className="p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-white/60" />
                    </button>
                  </div>

                  {/* Actions grid */}
                  <div className="grid grid-cols-5 gap-2 p-3">
                    {ACCESSORY_ACTIONS.map(action => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleActionClick(action.id)}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ background: action.color }}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-white/80 text-[10px] font-medium">
                            {action.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Accessory bar */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed left-0 right-0 z-[70000]"
            style={{
              bottom: `${dockBottom}px`,
              height: '48px',
            }}
          >
            <div
              className="h-full flex items-center px-2"
              style={{
                background: 'rgba(20, 20, 20, 0.95)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(0, 212, 255, 0.2)',
              }}
            >
              {/* Plus button */}
              <motion.button
                onClick={toggleActions}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: showActions
                    ? 'linear-gradient(135deg, #FF3B30, #FF9500)'
                    : 'linear-gradient(135deg, #00D4FF, #007AFF)',
                  boxShadow: '0 2px 8px rgba(0, 212, 255, 0.3)',
                }}
              >
                <motion.div
                  animate={{ rotate: showActions ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="w-5 h-5 text-white" />
                </motion.div>
              </motion.button>

              {/* Quick actions (visible when not expanded) */}
              {!showActions && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1 ml-2"
                >
                  {ACCESSORY_ACTIONS.slice(0, 3).map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(action.id)}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        title={action.label}
                      >
                        <Icon className="w-5 h-5" style={{ color: action.color }} />
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* M1SSION branding */}
              <span className="text-[10px] text-cyan-500/40 font-medium mr-2">
                M1SSION
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default KeyboardAccessoryBar;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
