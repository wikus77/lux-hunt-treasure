
export const NOTIFICATION_CATEGORIES = {
  LEADERBOARD: 'leaderboard_update',
  REWARDS: 'rewards',
  MISSION: 'mission_alert',
  BUZZ: 'buzz',
  MAP_BUZZ: 'map_buzz',
  WEEKLY: 'weekly_summary',
  GENERAL: 'general'
} as const;

export const getCategoryInfo = (type: string) => {
  switch (type) {
    case NOTIFICATION_CATEGORIES.LEADERBOARD:
      return {
        title: 'Aggiornamento Classifica',
        icon: '📊',
        color: 'text-green-400',
        borderColor: 'border-green-400/30'
      };
    case NOTIFICATION_CATEGORIES.REWARDS:
      return {
        title: 'Ricompense Sbloccate',
        icon: '🎁',
        color: 'text-yellow-400',
        borderColor: 'border-yellow-400/30'
      };
    case NOTIFICATION_CATEGORIES.MISSION:
      return {
        title: 'Avvisi Missione',
        icon: '⚠️',
        color: 'text-red-400',
        borderColor: 'border-red-400/30'
      };
    case NOTIFICATION_CATEGORIES.BUZZ:
      return {
        title: 'Buzz Notifications',
        icon: '⚡',
        color: 'text-blue-400',
        borderColor: 'border-blue-400/30'
      };
    case NOTIFICATION_CATEGORIES.MAP_BUZZ:
      return {
        title: 'Aggiornamenti Mappa',
        icon: '🗺️',
        color: 'text-purple-400',
        borderColor: 'border-purple-400/30'
      };
    case NOTIFICATION_CATEGORIES.WEEKLY:
      return {
        title: 'Riassunto Settimanale',
        icon: '📈',
        color: 'text-cyan-400',
        borderColor: 'border-cyan-400/30'
      };
    default:
      return {
        title: 'Generali',
        icon: '📋',
        color: 'text-gray-400',
        borderColor: 'border-gray-400/30'
      };
  }
};

export const groupNotificationsByCategory = (notifications: any[]) => {
  const grouped = notifications.reduce((acc, notification) => {
    const category = notification.type || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(notification);
    return acc;
  }, {} as Record<string, any[]>);
  
  return grouped;
};
