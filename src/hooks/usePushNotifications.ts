// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
export const usePushNotifications = () => {
  return {
    requestPermission: async () => {
      console.log('Push notifications not implemented');
      return 'denied';
    },
    isSupported: false,
    permission: 'denied' as const
  };
};