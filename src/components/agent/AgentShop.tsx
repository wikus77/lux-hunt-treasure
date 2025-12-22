/**
 * AGENT SHOP - Purchase and equip agents with M1U
 * BASE (FREE) / SPECIAL (50 M1U) / PREMIUM (100 M1U)
 * Enhanced lighting and model centering
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Check, ShoppingCart, Loader2, AlertCircle, Lock, Eye, X, RotateCcw, Crown, Zap, User } from 'lucide-react';
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { 
  getAgentsByCategory,
  getAgentById,
  CATEGORY_STYLES,
  CATEGORY_LABELS,
  RARITY_STYLES,
  AgentCategory,
  AgentDefinition
} from './agentCatalog';
import { AgentUnlockModal } from './AgentUnlockModal';

interface AgentShopProps {
  ownedAgents: string[];
  selectedAgentId: string;
  agentCode: string;
  onAgentPurchased: (agentId: string) => void;
  onAgentSelected: (agentId: string) => void;
}

// Enhanced Agent Model with better centering
function AgentModel({ glbPath }: { glbPath: string }) {
  const { scene } = useGLTF(glbPath);
  
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Consistent height scaling
    const targetHeight = 2.2;
    const scaleFactor = targetHeight / size.y;
    clone.scale.setScalar(scaleFactor);
    
    const scaledBox = new THREE.Box3().setFromObject(clone);
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    
    clone.position.x = -scaledCenter.x;
    clone.position.z = -scaledCenter.z;
    clone.position.y = -scaledBox.min.y;
    
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    return clone;
  }, [scene]);
  
  return <primitive object={clonedScene} />;
}

function AgentPreviewPanel({ 
  agent, onClose, onPurchase, onSelect, isPurchasing, isOwned, isSelected, canAfford, balance
}: { 
  agent: AgentDefinition; onClose: () => void; onPurchase: () => void; onSelect: () => void;
  isPurchasing: boolean; isOwned: boolean; isSelected: boolean; canAfford: boolean; balance: number;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const rarityStyle = RARITY_STYLES[agent.rarity];
  const categoryStyle = CATEGORY_STYLES[agent.category];
  
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="mb-4 rounded-2xl overflow-hidden border border-cyan-500/30"
      style={{ background: 'linear-gradient(180deg, #0a1628 0%, #061020 100%)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-orbitron text-white">Preview</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryStyle.text} ${categoryStyle.bg}`}>
            {CATEGORY_LABELS[agent.category]}
          </span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>
      
      <div className="relative h-[280px]" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #040812 100%)' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        )}
        <Canvas 
          camera={{ position: [0, 1, 4], fov: 40 }} 
          gl={{ antialias: true, alpha: true, toneMappingExposure: 1.4, toneMapping: THREE.ACESFilmicToneMapping }}
          onCreated={() => setIsLoading(false)} 
          style={{ opacity: isLoading ? 0.3 : 1, transition: 'opacity 0.3s' }}
        >
          {/* Enhanced lighting */}
          <ambientLight intensity={1.2} color="#ffffff" />
          <directionalLight position={[3, 4, 3]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[-3, 2, 2]} intensity={0.8} color="#e0f0ff" />
          <directionalLight position={[0, 3, -4]} intensity={0.6} color="#00d4ff" />
          <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" distance={10} />
          
          <Suspense fallback={null}><AgentModel glbPath={agent.glbPath} /></Suspense>
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            autoRotate={true} 
            autoRotateSpeed={1.5} 
            minDistance={2} 
            maxDistance={6}
            target={[0, 0.8, 0]}
          />
        </Canvas>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60">
          <RotateCcw className="w-3 h-3 text-white/50" />
          <span className="text-[10px] text-white/50">Auto-rotating</span>
        </div>
      </div>
      
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-orbitron font-medium text-white text-sm">{agent.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${rarityStyle.text} ${rarityStyle.bg}`}>{agent.rarity}</span>
              <span className="text-[10px] text-white/40">{agent.gender === 'ANY' ? 'All genders' : agent.gender}</span>
            </div>
          </div>
          {agent.priceM1U > 0 && !isOwned && (
            <div className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className={`text-lg font-bold font-orbitron ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>{agent.priceM1U}</span>
            </div>
          )}
          {agent.priceM1U === 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 rounded-full border border-green-500/40">
              <Check className="w-4 h-4 text-green-400" /><span className="text-sm font-bold text-green-400">FREE</span>
            </div>
          )}
        </div>
        <button onClick={isOwned ? onSelect : onPurchase}
          disabled={isPurchasing || (isOwned && isSelected) || (!isOwned && agent.priceM1U > 0 && !canAfford)}
          className={`w-full py-3 rounded-xl font-orbitron text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            isSelected ? 'bg-green-500/20 border border-green-500/40 text-green-400 cursor-default'
            : isOwned ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600'
            : agent.priceM1U === 0 ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600'
            : canAfford ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-600 hover:to-orange-600'
            : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}>
          {isPurchasing ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
          : isSelected ? <><Check className="w-4 h-4" />Currently Active</>
          : isOwned ? <><Zap className="w-4 h-4" />Deploy Agent</>
          : agent.priceM1U === 0 ? <><User className="w-4 h-4" />Select Agent (FREE)</>
          : canAfford ? <><Crown className="w-4 h-4" />Unlock for {agent.priceM1U} M1U</>
          : <><Lock className="w-4 h-4" />Need {agent.priceM1U - balance} more M1U</>}
        </button>
      </div>
    </motion.div>
  );
}

const CATEGORY_ICONS: Record<AgentCategory, React.ReactNode> = {
  BASE: <User className="w-4 h-4" />, SPECIAL: <Zap className="w-4 h-4" />, PREMIUM: <Crown className="w-4 h-4" />,
};
const CATEGORY_ORDER: AgentCategory[] = ['BASE', 'SPECIAL', 'PREMIUM'];

export function AgentShop({ ownedAgents, selectedAgentId, agentCode, onAgentPurchased, onAgentSelected }: AgentShopProps) {
  const { user } = useAuth();
  const { unitsData, isLoading: m1uLoading, refetch: refetchM1U } = useM1UnitsRealtime(user?.id);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<AgentCategory>('BASE');
  const [previewAgentId, setPreviewAgentId] = useState<string | null>(null);
  
  // Unlock modal state
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockedAgent, setUnlockedAgent] = useState<AgentDefinition | null>(null);
  
  const balance = unitsData?.balance || 0;
  const currentAgents = useMemo(() => getAgentsByCategory(activeCategory), [activeCategory]);

  const handlePurchase = async (agent: AgentDefinition) => {
    if (!user?.id) return;
    
    // If already owned or free, just select and show modal
    if (ownedAgents.includes(agent.id) || agent.priceM1U === 0) {
      onAgentSelected(agent.id);
      setUnlockedAgent(agent);
      setUnlockModalOpen(true);
      setPreviewAgentId(null);
      return;
    }
    
    if (balance < agent.priceM1U) {
      toast.error(`Not enough M1U. Need ${agent.priceM1U} M1U but have ${balance}.`);
      return;
    }
    
    setPurchasing(agent.id);
    try {
      const newBalance = balance - agent.priceM1U;
      const { error } = await supabase.from('profiles').update({ m1_units: newBalance, updated_at: new Date().toISOString() }).eq('id', user.id);
      if (error) throw error;
      window.dispatchEvent(new CustomEvent('m1u-spent', { detail: { amount: agent.priceM1U, newBalance, reason: 'agent_purchase' } }));
      
      onAgentPurchased(agent.id);
      await refetchM1U();
      
      // Show unlock modal instead of just toast
      setUnlockedAgent(agent);
      setUnlockModalOpen(true);
      setPreviewAgentId(null);
      
    } catch (error: any) {
      console.error('[AgentShop] Purchase error:', error);
      toast.error('Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const handleUnlockModalConfirm = () => {
    if (unlockedAgent) {
      onAgentSelected(unlockedAgent.id);
      // Emit event for other components to update
      window.dispatchEvent(new CustomEvent('agent-customization-updated'));
    }
    setUnlockModalOpen(false);
    setUnlockedAgent(null);
    toast.success('Agent deployed!', { duration: 1500 });
  };

  const handleUnlockModalClose = () => {
    setUnlockModalOpen(false);
    setUnlockedAgent(null);
  };

  const handlePreview = (agent: AgentDefinition) => setPreviewAgentId(prevId => prevId === agent.id ? null : agent.id);
  const previewAgent = previewAgentId ? getAgentById(previewAgentId) : null;

  return (
    <div className="p-4 space-y-5">
      {/* Unlock Modal */}
      <AgentUnlockModal
        isOpen={unlockModalOpen}
        agent={unlockedAgent}
        agentCode={agentCode}
        onClose={handleUnlockModalClose}
        onConfirmSetActive={handleUnlockModalConfirm}
      />
      
      <motion.div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-4 border border-cyan-500/20"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: '#1a1a1a', boxShadow: '0 0 12px rgba(255, 215, 0, 0.5)' }}>M1</div>
            <span className="text-sm text-white/60">Your Balance</span>
          </div>
          {m1uLoading ? <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" /> : (
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-bold font-orbitron text-white">{balance.toLocaleString('it-IT')}</span>
              <span className="text-sm text-white/50">M1U</span>
            </div>
          )}
        </div>
      </motion.div>
      
      <AnimatePresence>
        {previewAgent && (
          <AgentPreviewPanel agent={previewAgent} onClose={() => setPreviewAgentId(null)}
            onPurchase={() => handlePurchase(previewAgent)}
            onSelect={() => { handlePurchase(previewAgent); }}
            isPurchasing={purchasing === previewAgent.id} isOwned={ownedAgents.includes(previewAgent.id) || previewAgent.priceM1U === 0}
            isSelected={selectedAgentId === previewAgent.id} canAfford={balance >= previewAgent.priceM1U} balance={balance} />
        )}
      </AnimatePresence>
      
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORY_ORDER.map((category) => {
          const agents = getAgentsByCategory(category);
          const categoryStyle = CATEGORY_STYLES[category];
          return (
            <button key={category} onClick={() => setActiveCategory(category)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeCategory === category ? `bg-gradient-to-r ${categoryStyle.bg} ${categoryStyle.text} border ${categoryStyle.border}`
                : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/10'}`}>
              {CATEGORY_ICONS[category]}<span>{CATEGORY_LABELS[category]}</span><span className="text-[10px] opacity-60">({agents.length})</span>
            </button>
          );
        })}
      </div>
      
      <div className="flex items-center justify-center gap-4 text-[11px]">
        <div className="flex items-center gap-1.5 text-gray-400"><User className="w-3 h-3" /><span>Agents: FREE</span></div>
        <div className="w-px h-3 bg-white/20" />
        <div className="flex items-center gap-1.5 text-cyan-400"><Zap className="w-3 h-3" /><span>Special: 50 M1U</span></div>
        <div className="w-px h-3 bg-white/20" />
        <div className="flex items-center gap-1.5 text-yellow-400"><Crown className="w-3 h-3" /><span>Premium: 100 M1U</span></div>
      </div>
      
      <div className="space-y-3">
        {currentAgents.map((agent, index) => {
          const isOwned = ownedAgents.includes(agent.id) || agent.priceM1U === 0;
          const isSelected = selectedAgentId === agent.id;
          const canAfford = balance >= agent.priceM1U;
          const rarityStyle = RARITY_STYLES[agent.rarity];
          const categoryStyle = CATEGORY_STYLES[agent.category];
          const isPreviewing = previewAgentId === agent.id;
          
          return (
            <motion.div key={agent.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
              className={`relative p-3 rounded-xl border bg-gradient-to-r ${rarityStyle.bg} ${rarityStyle.border} ${isPreviewing ? 'ring-2 ring-cyan-400/50' : ''} ${isSelected ? 'ring-2 ring-green-400/50' : ''}`}>
              <div className="flex items-center gap-3">
                <button onClick={() => handlePreview(agent)}
                  className={`relative w-14 h-14 rounded-lg bg-gradient-to-br ${categoryStyle.bg} border ${isPreviewing ? 'border-cyan-400 ring-2 ring-cyan-400/30' : categoryStyle.border} flex items-center justify-center flex-shrink-0 transition-all hover:scale-105`}>
                  <span className="text-2xl">{categoryStyle.icon}</span>
                  <div className={`absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center transition-opacity ${isPreviewing ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
                    <Eye className="w-5 h-5 text-cyan-400" />
                  </div>
                  {isSelected && <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-medium text-white text-sm truncate">{agent.name}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${rarityStyle.text} bg-white/5`}>{agent.rarity}</span>
                  </div>
                  <p className="text-[10px] text-white/40">{agent.gender === 'ANY' ? 'Any gender' : agent.gender}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {isSelected ? <span className="text-xs text-green-400 font-medium flex items-center gap-1"><Check className="w-3 h-3" />Active Agent</span>
                    : isOwned ? <span className="text-xs text-cyan-400 font-medium">Ready to deploy</span>
                    : agent.priceM1U === 0 ? <span className="text-xs text-green-400 font-bold">FREE</span>
                    : <div className="flex items-center gap-1"><Coins className="w-3 h-3 text-yellow-400" /><span className={`text-xs font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>{agent.priceM1U} M1U</span>{!canAfford && <Lock className="w-3 h-3 text-red-400/60" />}</div>}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  {isSelected ? <div className="px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/40"><span className="flex items-center gap-1 text-xs text-green-400 font-medium"><Check className="w-3 h-3" />Active</span></div>
                  : isOwned ? <button onClick={() => handlePurchase(agent)}
                      className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 transition-colors">
                      <span className="flex items-center gap-1 text-xs font-medium"><Zap className="w-3 h-3" />Deploy</span></button>
                  : <button onClick={() => handlePurchase(agent)} disabled={purchasing === agent.id || (agent.priceM1U > 0 && !canAfford)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                        agent.priceM1U === 0 ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600'
                        : canAfford ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-600 hover:to-orange-600'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'}`}>
                      {purchasing === agent.id ? <Loader2 className="w-3 h-3 animate-spin" /> : agent.priceM1U === 0 ? <User className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
                      {purchasing === agent.id ? '...' : agent.priceM1U === 0 ? 'Select' : 'Buy'}
                    </button>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {ownedAgents.length > 0 && (
        <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-xl p-3 border border-green-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Your Collection</span>
            <span className="text-sm font-bold text-green-400">{ownedAgents.length + 8} agents</span>
          </div>
        </div>
      )}
      
      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-xs text-white/60">All BASE agents are free. Special and Premium agents unlock permanently once purchased!</p>
        </div>
      </div>
    </div>
  );
}
