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
  return (
    // 🔧 FIX v2: Outer container blocks iOS bounce scroll
    <div
      style={{
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative',
        overscrollBehavior: 'none',
      }}
    >
    <div 
      className="w-full px-3" 
      style={{ 
        paddingTop: '3vh',
        height: '100dvh',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 0,
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
      }}
    >
        <div className="w-full max-w-3xl mx-auto">
          {/* Tabs - Alzati del 7% */}
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as 'notifications' | 'messages')}
            className="w-full"
          >
            {/* Tab Buttons - posizione alzata */}
            <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border border-cyan-500/20 rounded-xl p-1" style={{ marginBottom: '7vh' }}>
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
    </div>
  );
};

export default Notifications;
