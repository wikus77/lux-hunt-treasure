
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
        color: 'text-green-400'
      };
    case NOTIFICATION_CATEGORIES.REWARDS:
      return {
        title: 'Ricompense Sbloccate',
        color: 'text-yellow-400'
      };
    case NOTIFICATION_CATEGORIES.MISSION:
      return {
        title: 'Avvisi Missione',
        color: 'text-red-400'
      };
    case NOTIFICATION_CATEGORIES.BUZZ:
      return {
        title: 'Buzz Notifications',
        color: 'text-blue-400'
      };
    case NOTIFICATION_CATEGORIES.MAP_BUZZ:
      return {
        title: 'Aggiornamenti Mappa',
        color: 'text-purple-400'
      };
    case NOTIFICATION_CATEGORIES.WEEKLY:
      return {
        title: 'Riassunto Settimanale',
        color: 'text-cyan-400'
      };
    default:
      return {
        title: 'Generali',
        color: 'text-gray-400'
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
