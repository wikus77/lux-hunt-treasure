/**
 * Tactical Tic-Tac-Toe — 3×3 grid (tap to select). WKWebView-safe (buttons).
 * © 2025 Joseph MULÉ – M1SSION™
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { TttBoard } from './ticTacToeTypes';
import { displayMark, isCellSelectable } from './ticTacToeLogic';

export interface TicTacToeBoardProps {
  board: TttBoard;
  selectedIndex: number | null;
  disabled: boolean;
  highlightIndex?: number | null;
  shakeKey?: number;
  onSelect: (index: number) => void;
}

export const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({
  board,
  selectedIndex,
  disabled,
  highlightIndex = null,
  shakeKey = 0,
  onSelect,
}) => {
  return (
    <motion.div
      key={shakeKey}
      animate={shakeKey > 0 ? { x: [0, -6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.45 }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
        width: '100%',
        maxWidth: 280,
        margin: '0 auto',
      }}
    >
      {board.map((cell, i) => {
        const selectable = !disabled && isCellSelectable(board, i);
        const isSel = selectedIndex === i;
        const isHi = highlightIndex === i;
        return (
          <button
            key={i}
            type="button"
            disabled={!selectable}
            onClick={() => selectable && onSelect(i)}
            style={{
              aspectRatio: '1',
              borderRadius: 14,
              border: `2px solid ${
                isHi
                  ? 'rgba(0, 255, 136, 0.85)'
                  : isSel
                    ? 'rgba(0, 209, 255, 0.95)'
                    : 'rgba(0, 209, 255, 0.35)'
              }`,
              background: isSel
                ? 'linear-gradient(145deg, rgba(0, 209, 255, 0.22), rgba(0, 209, 255, 0.06))'
                : 'rgba(255,255,255,0.06)',
              boxShadow: isSel
                ? '0 0 18px rgba(0, 209, 255, 0.45), inset 0 0 12px rgba(0, 209, 255, 0.12)'
                : isHi
                  ? '0 0 16px rgba(0, 255, 136, 0.35)'
                  : 'none',
              color: cell === 'X' ? '#00D1FF' : cell === 'O' ? 'rgba(255, 120, 160, 0.95)' : 'transparent',
              fontSize: 32,
              fontWeight: 800,
              cursor: selectable ? 'pointer' : 'default',
              opacity: selectable || cell !== null ? 1 : 0.55,
            }}
          >
            {displayMark(cell)}
          </button>
        );
      })}
    </motion.div>
  );
};
