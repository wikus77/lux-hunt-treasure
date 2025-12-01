// FILE MODIFICATO — BY JOSEPH MULE
// With Chat/Messages Tab Integration - STATIC LAYOUT
import React, { useState } from 'react';
import { Bell, MessageCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useBuzzSound } from '@/hooks/useBuzzSound';
import { usePWAHardwareStub } from '@/hooks/usePWAHardwareStub';
import { useDynamicIslandSafety } from "@/hooks/useDynamicIslandSafety";
import { useNotificationsDynamicIsland } from '@/hooks/useNotificationsDynamicIsland';
import { useNotificationsAutoReload } from '@/hooks/useNotificationsAutoReload';
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { NotificationsHeader } from '@/components/notifications/NotificationsHeader';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChatList } from '@/components/chat/ChatList';
import { ChatView } from '@/components/chat/ChatView';
import { NewChatModal } from '@/components/chat/NewChatModal';
import { NewGroupModal } from '@/components/chat/NewGroupModal';
import { useChat } from '@/hooks/useChat';

const Notifications = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const { notifications, markAsRead, deleteNotification, markAllAsRead, reloadNotifications } = useNotifications();
  const { playSound } = useBuzzSound();
  const { triggerHaptic } = usePWAHardwareStub();
  
  // Chat state
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    name: string;
    avatar: string | null;
  } | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const { totalUnreadCount: chatUnreadCount } = useChat();
  
  // Custom hooks for managing notifications behavior
  const { updateDynamicIslandOnRead, closeDynamicIsland } = useNotificationsDynamicIsland(notifications);
  
  useDynamicIslandSafety();
  useNotificationsAutoReload(reloadNotifications);

  const handleMarkAsRead = async (id: string) => {
    await triggerHaptic('tick');
    markAsRead(id);
    playSound();
    updateDynamicIslandOnRead(id);
  };

  const handleDeleteNotification = async (id: string) => {
    await triggerHaptic('selection');
    deleteNotification(id);
    playSound();
  };

  const handleMarkAllAsRead = async () => {
    await triggerHaptic('success');
    markAllAsRead();
    playSound();
    closeDynamicIsland();
  };

  const handleManualReload = () => {
    console.log('🔄 NOTIFICATIONS: Manual reload button pressed');
    reloadNotifications();
  };

  // Chat handlers
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation({
      id: conversationId,
      name: 'Chat',
      avatar: null
    });
  };

  const handleChatCreated = (conversationId: string, recipientName: string, recipientAvatar: string | null) => {
    setSelectedConversation({
      id: conversationId,
      name: recipientName,
      avatar: recipientAvatar
    });
  };

  const handleGroupCreated = (conversationId: string, groupName: string) => {
    setSelectedConversation({
      id: conversationId,
      name: groupName,
      avatar: null
    });
  };

  // Count unread notifications
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // If viewing a chat conversation
  if (selectedConversation) {
    return (
      <div 
        className="w-full m1-app-bg"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
        }}
      >
        <div className="m1-grain" />
        <UnifiedHeader />
        
        <ChatView
          conversationId={selectedConversation.id}
          recipientName={selectedConversation.name}
          recipientAvatar={selectedConversation.avatar}
          onBack={() => setSelectedConversation(null)}
        />
        
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10000 }}>
          <BottomNavigation />
        </div>
      </div>
    );
  }

  // Main notifications/messages page - COMPLETELY STATIC
  return (
    <div 
      className="w-full m1-app-bg"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="m1-grain" />
      
      {/* Header - Fixed */}
      <UnifiedHeader />
      
      {/* Content Area - Takes remaining space */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px) + 10px)',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          paddingLeft: '12px',
          paddingRight: '12px',
        }}
      >
        <div className="w-full max-w-3xl mx-auto flex flex-col h-full overflow-hidden">
          {/* Tabs */}
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as 'notifications' | 'messages')}
            className="flex flex-col h-full overflow-hidden"
          >
            {/* Tab Buttons - Fixed */}
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-900/50 border border-cyan-500/20 rounded-xl p-1 flex-shrink-0">
              <TabsTrigger 
                value="notifications"
                className="relative flex items-center justify-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 rounded-lg py-3 transition-all"
              >
                <Bell className="w-5 h-5" />
                <span className="font-semibold">Notifiche</span>
                {unreadNotificationsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center bg-cyan-500 text-white text-xs">
                    {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="messages"
                className="relative flex items-center justify-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 rounded-lg py-3 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">Messaggi</span>
                {chatUnreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center bg-purple-500 text-white text-xs">
                    {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Tab Content - Scrollable */}
            <TabsContent 
              value="notifications" 
              className="flex-1 overflow-y-auto mt-0"
              style={{ minHeight: 0 }}
            >
              <NotificationsHeader
                filter={filter}
                onFilterChange={setFilter}
                onMarkAllAsRead={handleMarkAllAsRead}
                onManualReload={handleManualReload}
              />
              
              <NotificationsList
                notifications={notifications}
                filter={filter}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDeleteNotification}
                onReload={handleManualReload}
              />
            </TabsContent>

            <TabsContent 
              value="messages" 
              className="flex-1 overflow-y-auto mt-0"
              style={{ minHeight: 0 }}
            >
              <ChatList
                onSelectConversation={handleSelectConversation}
                onNewChat={() => setShowNewChatModal(true)}
                onNewGroup={() => setShowNewGroupModal(true)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Bottom Navigation - Fixed */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 10000,
        }}
      >
        <BottomNavigation />
      </div>

      {/* Modals */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={handleChatCreated}
      />

      <NewGroupModal
        isOpen={showNewGroupModal}
        onClose={() => setShowNewGroupModal(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
};

export default Notifications;
