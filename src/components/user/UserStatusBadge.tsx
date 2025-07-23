/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * M1SSION™ User Status Badge
 * Displays real-time user plan status and permissions
 */

import React from 'react';
import { useUserSyncContext } from './UserSyncProvider';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Star, Zap, Users, Clock } from 'lucide-react';

const UserStatusBadge: React.FC = () => {
  const { syncState, hasEarlyAccess, hasPremiumFeatures, unreadNotifications } = useUserSyncContext();

  const getPlanIcon = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'silver':
        return <Shield className="w-4 h-4" />;
      case 'gold':
        return <Star className="w-4 h-4" />;
      case 'black':
        return <Crown className="w-4 h-4" />;
      case 'titanium':
        return <Zap className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'silver':
        return 'bg-gradient-to-r from-slate-400 to-slate-600 text-white';
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
      case 'black':
        return 'bg-gradient-to-r from-gray-800 to-black text-white border border-white/20';
      case 'titanium':
        return 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/25';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-700 text-white';
    }
  };

  const formatPlanName = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
  };

  if (syncState.isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />
        <div className="w-16 h-6 bg-gray-300 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Plan Badge */}
      <Badge 
        className={`${getPlanColor(syncState.plan)} flex items-center space-x-1 px-3 py-1 font-bold shadow-md`}
      >
        {getPlanIcon(syncState.plan)}
        <span>{formatPlanName(syncState.plan)}</span>
      </Badge>

      {/* Early Access Badge */}
      {hasEarlyAccess && (
        <Badge variant="outline" className="flex items-center space-x-1 bg-orange-500/10 border-orange-500/30 text-orange-400">
          <Clock className="w-3 h-3" />
          <span className="text-xs">{syncState.earlyAccessHours}h</span>
        </Badge>
      )}

      {/* Premium Features Badge */}
      {hasPremiumFeatures && (
        <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-400">
          <span className="text-xs">PREMIUM</span>
        </Badge>
      )}

      {/* Notifications Badge */}
      {unreadNotifications > 0 && (
        <Badge variant="destructive" className="bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
          {unreadNotifications > 99 ? '99+' : unreadNotifications}
        </Badge>
      )}
    </div>
  );
};

export default UserStatusBadge;