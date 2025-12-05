/**
 * M1SSION™ POLICIES PAGE
 * Complete Legal Policies & Game Disclaimers
 * © 2025 NIYVORA KFT™ – Joseph MULÉ – All Rights Reserved
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  ArrowLeft, 
  Shield, 
  Ban, 
  Coins, 
  Gamepad2, 
  AlertTriangle, 
  Bot, 
  Scale, 
  RefreshCw,
  Globe,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

const Policies: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#131524] via-[#0F1419] to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => window.history.back()}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-orbitron font-bold text-white">Policies & Disclaimers</h1>
              <p className="text-white/70">M1SSION™ Legal Information</p>
            </div>
          </div>

          {/* SECTION 1: Anti-Gambling Disclaimer */}
          <Card className="bg-black/40 border-red-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Ban className="w-5 h-5 mr-2 text-red-400" />
                Anti-Gambling Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                <p className="text-red-300 font-semibold mb-2">⚠️ IMPORTANT NOTICE</p>
                <p className="text-white/80">
                  M1SSION™ is <strong>NOT</strong> a gambling application. This platform does not offer, 
                  facilitate, or promote any form of gambling, betting, wagering, or games of chance 
                  involving real money.
                </p>
              </div>
              
              <div className="space-y-2">
                <p><strong>This application does NOT:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                  <li>Accept real money bets or wagers</li>
                  <li>Offer cash prizes or monetary rewards</li>
                  <li>Provide any form of casino, sports betting, or lottery services</li>
                  <li>Allow conversion of virtual currencies to real money</li>
                  <li>Enable withdrawals or cash-outs of any kind</li>
                  <li>Simulate or encourage gambling behavior</li>
                </ul>
              </div>
              
              <p className="text-white/70 text-sm italic">
                Any mini-games within M1SSION™ (including "Pulse Breaker") are purely for entertainment 
                purposes and use only virtual, non-redeemable currencies with no real-world value.
              </p>
            </CardContent>
          </Card>

          {/* SECTION 2: Nature of the Game */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Gamepad2 className="w-5 h-5 mr-2 text-[#00D1FF]" />
                Nature of M1SSION™
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                M1SSION™ is an <strong>interactive entertainment application</strong> designed as an 
                immersive investigative simulation and treasure hunt experience.
              </p>
              
              <div className="space-y-2">
                <p><strong>Game Classification:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                  <li><strong>Simulation Game:</strong> Role-playing as an intelligence agent</li>
                  <li><strong>Puzzle/Mystery Game:</strong> Solving clues and investigating locations</li>
                  <li><strong>Location-Based Game:</strong> Using geolocation for interactive gameplay</li>
                  <li><strong>Entertainment Experience:</strong> Purely for fun and engagement</li>
                </ul>
              </div>
              
              <div className="bg-[#00D1FF]/10 p-3 rounded-lg border border-[#00D1FF]/20">
                <p className="text-[#00D1FF] text-sm">
                  M1SSION™ is designed to provide an engaging narrative experience. 
                  All game mechanics, outcomes, and rewards are part of the entertainment simulation 
                  and have no real-world economic implications.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3: Virtual Currencies */}
          <Card className="bg-black/40 border-yellow-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Coins className="w-5 h-5 mr-2 text-yellow-400" />
                Virtual Currencies (M1U & PE)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                M1SSION™ uses two types of <strong>virtual, in-app currencies</strong>:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/20">
                  <h4 className="text-yellow-400 font-semibold mb-2">M1U (M1 Units)</h4>
                  <p className="text-white/70 text-sm">
                    Virtual tokens used within the M1SSION™ ecosystem for in-app activities, 
                    rewards, and engagement features.
                  </p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                  <h4 className="text-purple-400 font-semibold mb-2">PE (Pulse Energy)</h4>
                  <p className="text-white/70 text-sm">
                    Virtual energy points used for specific game mechanics and 
                    community participation features.
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30">
                <p className="text-yellow-300 font-semibold mb-2">⚠️ CRITICAL DISCLAIMER</p>
                <ul className="list-disc list-inside space-y-1 text-white/80 text-sm">
                  <li>M1U and PE have <strong>NO monetary value</strong></li>
                  <li>They <strong>CANNOT be purchased</strong> with real money</li>
                  <li>They <strong>CANNOT be sold, exchanged, or converted</strong> to real currency</li>
                  <li>They <strong>CANNOT be withdrawn</strong> or transferred outside the app</li>
                  <li>They are <strong>NON-REFUNDABLE</strong> and <strong>NON-REDEEMABLE</strong></li>
                  <li>They exist <strong>ONLY</strong> within the M1SSION™ application</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4: No Real Transactions */}
          <Card className="bg-black/40 border-green-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-400" />
                No Real-Money Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                M1SSION™ does <strong>NOT</strong> process, handle, or facilitate any real-money 
                transactions related to in-game outcomes, virtual currency winnings, or game results.
              </p>
              
              <div className="space-y-2">
                <p><strong>What This Means:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                  <li>No deposits or real-money payments for gameplay</li>
                  <li>No withdrawals or payouts of any kind</li>
                  <li>No cash equivalents or gift card redemptions</li>
                  <li>No cryptocurrency exchanges or transfers</li>
                  <li>No third-party payment processing for game rewards</li>
                </ul>
              </div>
              
              <p className="text-white/70 text-sm">
                Any premium subscriptions or in-app purchases are for enhanced features only 
                and are completely separate from virtual currency systems or game outcomes.
              </p>
            </CardContent>
          </Card>

          {/* SECTION 5: Limitation of Liability */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Scale className="w-5 h-5 mr-2 text-[#00D1FF]" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                By using M1SSION™, you acknowledge and agree that:
              </p>
              
              <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                <li>
                  NIYVORA KFT™ and M1SSION™ are <strong>not liable</strong> for any direct, indirect, 
                  incidental, or consequential damages arising from your use of the application.
                </li>
                <li>
                  The application is provided <strong>"as is"</strong> without warranties of any kind, 
                  either express or implied.
                </li>
                <li>
                  Users are solely responsible for their own safety and actions while using 
                  location-based features.
                </li>
                <li>
                  We do not guarantee uninterrupted access, accuracy of content, or preservation 
                  of user data beyond our reasonable efforts.
                </li>
                <li>
                  Any third-party services integrated within the app are subject to their own 
                  terms and conditions.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* SECTION 6: Digital Risks */}
          <Card className="bg-black/40 border-orange-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
                Digital Risks & Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                Users acknowledge the following digital risks:
              </p>
              
              <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                <li>Internet connectivity issues may affect gameplay experience</li>
                <li>GPS accuracy may vary based on device and location</li>
                <li>Battery consumption may be higher when using location services</li>
                <li>Data usage may occur when using the application</li>
                <li>Screen time should be monitored, especially for younger users</li>
              </ul>
              
              <div className="bg-orange-900/20 p-3 rounded-lg border border-orange-500/20">
                <p className="text-orange-300 text-sm">
                  <strong>Physical Safety:</strong> When using location-based features, always be aware 
                  of your surroundings. Do not trespass on private property. Do not use the app 
                  while driving or in unsafe conditions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 7: AI Content (AION) */}
          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Bot className="w-5 h-5 mr-2 text-purple-400" />
                AI-Generated Content (AION)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                M1SSION™ incorporates AI-powered features, including the <strong>AION</strong> assistant 
                and various content generation systems.
              </p>
              
              <div className="space-y-2">
                <p><strong>AI Disclosure:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                  <li>Some content, clues, and narratives may be generated or enhanced by AI</li>
                  <li>AI responses are for entertainment and should not be considered factual advice</li>
                  <li>AI-generated content may occasionally contain inaccuracies or inconsistencies</li>
                  <li>We continuously improve AI systems but cannot guarantee perfection</li>
                </ul>
              </div>
              
              <p className="text-white/70 text-sm italic">
                AION and other AI features are designed to enhance the gaming experience and 
                should be understood as part of the entertainment simulation.
              </p>
            </CardContent>
          </Card>

          {/* SECTION 8: Policy Modifications */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <RefreshCw className="w-5 h-5 mr-2 text-[#00D1FF]" />
                Policy Modifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                NIYVORA KFT™ reserves the right to modify, update, or change these policies 
                at any time without prior notice.
              </p>
              
              <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                <li>Changes will be effective immediately upon posting in the application</li>
                <li>Continued use of the app constitutes acceptance of updated policies</li>
                <li>Major changes may be communicated via in-app notifications</li>
                <li>Users are encouraged to review policies periodically</li>
              </ul>
            </CardContent>
          </Card>

          {/* SECTION 9: Cookies & Security */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Lock className="w-5 h-5 mr-2 text-[#00D1FF]" />
                Cookies & Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                M1SSION™ uses cookies and similar technologies to enhance user experience. 
                For detailed information, please refer to our{' '}
                <a href="/cookie-policy" className="text-[#00D1FF] hover:underline">Cookie Policy</a>.
              </p>
              
              <div className="space-y-2">
                <p><strong>Security Measures:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                  <li>End-to-end encryption for sensitive data</li>
                  <li>Secure authentication protocols</li>
                  <li>Regular security audits and updates</li>
                  <li>GDPR and CCPA compliance</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 10: Regulatory Compliance */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Globe className="w-5 h-5 mr-2 text-[#00D1FF]" />
                Regulatory Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                M1SSION™ is designed to comply with applicable regulations in the jurisdictions 
                where it operates:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-[#00D1FF] font-semibold">European Union</h4>
                  <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                    <li>GDPR (Data Protection)</li>
                    <li>Digital Services Act (DSA)</li>
                    <li>Consumer Protection Directives</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[#00D1FF] font-semibold">United States</h4>
                  <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                    <li>CCPA (California Privacy)</li>
                    <li>COPPA (Children's Privacy)</li>
                    <li>FTC Guidelines</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <h4 className="text-[#00D1FF] font-semibold">App Store Compliance</h4>
                <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                  <li>Apple App Store Guidelines (Simulated Gambling Category)</li>
                  <li>Google Play Store Policies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="pt-6 border-t border-white/10 text-center text-white/60">
            <p>© 2025 M1SSION™ – All Rights Reserved</p>
            <p className="text-sm mt-1">NIYVORA KFT™ – Budapest, Hungary</p>
            <p className="text-xs mt-2 text-white/40">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Policies;

