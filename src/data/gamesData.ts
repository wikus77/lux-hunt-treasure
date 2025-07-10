export const gamesData = [
  {
    id: 'puzzle-master',
    title: 'Puzzle Master',
    description: 'Risolvi puzzle logici in tempo limitato',
    difficulty: 'medium' as const,
    points: 500,
    status: 'available' as const,
    icon: '🧩'
  },
  {
    id: 'speed-tap',
    title: 'Speed Tap',
    description: 'Tocca i target il più velocemente possibile',
    difficulty: 'easy' as const,
    points: 200,
    status: 'completed' as const,
    icon: '⚡'
  },
  {
    id: 'memory-matrix',
    title: 'Memory Matrix',
    description: 'Memorizza sequenze di colori e forme',
    difficulty: 'hard' as const,
    points: 1000,
    status: 'available' as const,
    icon: '🧠'
  },
  {
    id: 'reflex-test',
    title: 'Reflex Test',
    description: 'Testa i tuoi riflessi con stimoli visivi',
    difficulty: 'easy' as const,
    points: 300,
    status: 'available' as const,
    icon: '👁️'
  },
  {
    id: 'code-breaker',
    title: 'Code Breaker',
    description: 'Decifra codici segreti utilizzando indizi',
    difficulty: 'hard' as const,
    points: 1200,
    status: 'locked' as const,
    icon: '🔓'
  },
  {
    id: 'pattern-match',
    title: 'Pattern Match',
    description: 'Trova i pattern nascosti nelle immagini',
    difficulty: 'medium' as const,
    points: 600,
    status: 'completed' as const,
    icon: '🎯'
  }
];