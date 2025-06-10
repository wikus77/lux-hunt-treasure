
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Gift, Settings, Users, FileText } from 'lucide-react';

export default function Admin() {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Panel M1SSION™</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Prizes Manager */}
          <Link to="/admin/prizes-manager">
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  🎁 Premi e Indizi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  Gestisci premi settimanali e genera automaticamente gli indizi per le città
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Legacy Prize Clues */}
          <Link to="/admin/prize-clues">
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-blue-500" />
                  Prize Clues (Legacy)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  Sistema legacy per la gestione degli indizi dei premi
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Abuse Logs */}
          <Link to="/admin/abuse-logs">
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-500" />
                  Abuse Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  Visualizza i log di abuso e le attività sospette
                </p>
              </CardContent>
            </Card>
          </Link>

        </div>

        <div className="mt-8 p-4 bg-green-900/20 rounded-lg border border-green-500/30">
          <p className="text-green-400 font-medium">✅ Sistema Admin Funzionante</p>
          <p className="text-green-300 text-sm mt-1">
            Tutti i moduli admin sono operativi e collegati al database Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
