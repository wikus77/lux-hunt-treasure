export const prizesData = [
  {
    id: 'ferrari-experience',
    title: 'Esperienza Ferrari',
    description: 'Guida una Ferrari F8 Tributo per un giorno intero con istruttore professionale',
    location: 'Modena, IT',
    deadline: '15 Gen',
    type: 'experience' as const,
    status: 'active' as const
  },
  {
    id: 'rolex-watch',
    title: 'Rolex Submariner',
    description: 'Orologio Rolex Submariner Date con cinturino in acciaio inossidabile',
    location: 'Milano, IT',
    deadline: '20 Gen',
    type: 'physical' as const,
    status: 'active' as const
  },
  {
    id: 'crypto-wallet',
    title: '5 Bitcoin',
    description: 'Wallet crypto contenente 5 Bitcoin trasferibili istantaneamente',
    location: 'Online',
    deadline: '25 Gen',
    type: 'digital' as const,
    status: 'active' as const
  },
  {
    id: 'vip-weekend',
    title: 'Weekend VIP Monaco',
    description: 'Weekend di lusso a Monaco con hotel 5 stelle e accesso esclusivo al Casinò',
    location: 'Monaco',
    deadline: '30 Gen',
    type: 'experience' as const,
    status: 'locked' as const
  },
  {
    id: 'iphone-pro',
    title: 'iPhone 15 Pro Max',
    description: 'Ultimo modello iPhone 15 Pro Max 1TB con custodia in titanio',
    location: 'Roma, IT',
    deadline: '10 Gen',
    type: 'physical' as const,
    status: 'completed' as const
  }
];