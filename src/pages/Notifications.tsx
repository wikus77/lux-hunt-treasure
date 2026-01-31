// FILE MODIFICATO — BY JOSEPH MULE
// With Chat/Messages Tab Integration - STATIC LAYOUT
import React, { useState, useEffect } from 'react';
import { Bell, MessageCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useBuzzSound } from '@/hooks/useBuzzSound';
import { usePWAHardwareStub } from '@/hooks/usePWAHardwareStub';
import { useDynamicIslandSafety } from "@/hooks/useDynamicIslandSafety";
import { useNotificationsDynamicIsland } from '@/hooks/useNotificationsDynamicIsland';
import { useNotificationsAutoReload } from '@/hooks/useNotificationsAutoReload';
// Header e BottomNav gestiti da GlobalLayout
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

  // 🔧 P0 FIX 31/01/2026: REMOVED html/body manipulation + inline styles
  // REASON: LeaderboardPage pattern - theme applied via container className="sn-page" only
  // CSS rules with :has(.sn-page) or .sn-page selectors handle overlay hiding
  // This ensures deterministic behavior without race conditions during navigation

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

  // If viewing a chat conversation - NO header/nav, GlobalLayout li gestisce
  if (selectedConversation) {
    return (
      <div className="w-full">
        <ChatView
          conversationId={selectedConversation.id}
          recipientName={selectedConversation.name}
          recipientAvatar={selectedConversation.avatar}
          onBack={() => setSelectedConversation(null)}
        />
      </div>
    );
  }

  // Main notifications/messages page - GlobalLayout gestisce Header e BottomNav
  // 🔧 FIX v6 (22/01/2026): AION-LIKE SCROLL UNDER HEADER
  // 🎨 SOFT NATIVE: Apple-like design update
  return (
    <div 
      className="w-full px-3 sn-page" 
      style={{ 
        position: 'relative',
        zIndex: 0,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)',
      }}
    >
        {/* 🔧 FIX v6: First content offset for AION-like scroll under header */}
        <div className="w-full max-w-3xl mx-auto m1-first-content-offset">
          {/* Tabs - 🎨 SOFT NATIVE: Pill-style tabs */}
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as 'notifications' | 'messages')}
            className="w-full sn-notification-tabs"
          >
            {/* Tab Buttons - 🎨 SOFT NATIVE: Clean pill design */}
            <TabsList className="grid w-full grid-cols-2 sn-tabs-container" style={{ marginBottom: '24px' }}>
              <TabsTrigger 
                value="notifications"
                className={`relative flex items-center justify-center gap-2 sn-tab ${activeTab === 'notifications' ? 'sn-tab-active' : ''}`}
              >
                <Bell className="w-4 h-4" />
                <span className="font-medium">Notifiche</span>
                {unreadNotificationsCount > 0 && (
                  <span className="sn-badge ml-1">
                    {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="messages"
                className={`relative flex items-center justify-center gap-2 sn-tab ${activeTab === 'messages' ? 'sn-tab-active' : ''}`}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">Messaggi</span>
                {chatUnreadCount > 0 && (
                  <span className="sn-badge ml-1" style={{ background: '#AF52DE' }}>
                    {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="notifications" className="mt-0">
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

            <TabsContent value="messages" className="mt-0">
              <ChatList
                onSelectConversation={handleSelectConversation}
                onNewChat={() => setShowNewChatModal(true)}
                onNewGroup={() => setShowNewGroupModal(true)}
              />
            </TabsContent>
          </Tabs>
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
