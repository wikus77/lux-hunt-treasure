// © 2025 Joseph MULÉ – M1SSION™ – Push Center Unificato
"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Send, Bug, Database, FileText, Bell } from 'lucide-react';
import ActivateTab from './sections/ActivateTab';
import SendTab from './sections/SendTab';
import DebugTab from './sections/DebugTab';
import SubscriptionsTab from './sections/SubscriptionsTab';
import LogsTab from './sections/LogsTab';

export default function PushCenterCard() {
  const [activeTab, setActiveTab] = useState('activate');

  return (
    <Card className="glass-card p-6 border border-[#4361ee]/30">
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent">
          📡 Push Center
        </h2>
        <p className="text-gray-400 text-sm mt-2">
          Invio notifiche push (Web Push + FCM) • Debug E2E • Subscriptions • Logs
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="activate" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Attiva</span>
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex items-center gap-2">
            <Bug className="w-4 h-4" />
            <span className="hidden sm:inline">Debug</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Subs</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activate" className="space-y-4">
          <ActivateTab />
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <SendTab />
        </TabsContent>

        <TabsContent value="debug" className="space-y-4">
          <DebugTab />
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <SubscriptionsTab />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <LogsTab />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
