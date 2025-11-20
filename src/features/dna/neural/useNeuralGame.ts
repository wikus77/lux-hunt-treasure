// @ts-nocheck
/**
 * © 2025 Joseph MULÉ – M1SSION™ – Neural Game Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NeuralGameState, NeuralLink } from './types';
import { generateNeuralGraph, checkLinkIntersection, generateLinkPath } from './NeuralGraph';
import { audioEngine } from './AudioEngine';

export function useNeuralGame() {
  const [gameState, setGameState] = useState<NeuralGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragPath, setDragPath] = useState<Array<[number, number, number]> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Initialize game
  useEffect(() => {
    initGame();
  }, []);

  const initGame = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      // Try to load existing unsolved session
      const { data: existingSessions } = await supabase
        .from('user_dna_neural_sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1);

      let sessionId: string;
      let seed: string;
      let moves = 0;
      
      if (existingSessions && existingSessions.length > 0) {
        // Resume existing session
        const session = existingSessions[0];
        sessionId = session.id;
        seed = session.seed;
        moves = session.moves || 0;
      } else {
        // Create new session
        seed = Math.random().toString(36).substring(2, 15);
        const { data: newSessionId, error } = await supabase.rpc('rpc_neural_start', {
          p_seed: seed,
          p_pairs: 6
        });
        
        if (error) throw error;
        if (!newSessionId) throw new Error('Failed to create session');
        sessionId = newSessionId as string;
      }

      // Generate nodes from seed
      const nodes = generateNeuralGraph(seed, 6);
      
      const state: NeuralGameState = {
        sessionId,
        seed,
        nodes,
        links: [],
        moves,
        startedAt: Date.now(),
        elapsedSeconds: 0,
        solved: false
      };

      setGameState(state);
      startTimeRef.current = Date.now();
    } catch (error) {
      console.error('Failed to init game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = useCallback((nodeId: string) => {
    if (!gameState) return;

    const node = gameState.nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (!selectedNode) {
      // First node selection
      setSelectedNode(nodeId);
      audioEngine.playSelect();
    } else if (selectedNode === nodeId) {
      // Deselect
      setSelectedNode(null);
      setDragPath(null);
    } else {
      // Try to connect
      const selectedNodeData = gameState.nodes.find(n => n.id === selectedNode);
      if (!selectedNodeData) return;

      // Check if they're a matching pair
      if (selectedNodeData.pairId !== node.pairId) {
        audioEngine.playError();
        setSelectedNode(null);
        setDragPath(null);
        return;
      }

      // Check if already connected
      const alreadyConnected = gameState.links.some(
        link => (link.from === selectedNode && link.to === nodeId) ||
                (link.from === nodeId && link.to === selectedNode)
      );

      if (alreadyConnected) {
        setSelectedNode(null);
        setDragPath(null);
        return;
      }

      // Generate path
      const path = generateLinkPath(selectedNodeData.position, node.position);

      // Check intersection
      const intersects = checkLinkIntersection(path, gameState.links);

      if (intersects) {
        audioEngine.playError();
        setDragPath(null);
        setTimeout(() => setSelectedNode(null), 200);
        return;
      }

      // Valid connection!
      const newLink: NeuralLink = {
        id: `link_${Date.now()}`,
        from: selectedNode,
        to: nodeId,
        color: selectedNodeData.color,
        points: path
      };

      const newLinks = [...gameState.links, newLink];
      const newMoves = gameState.moves + 1;

      // Calculate link length for database
      const dx = node.position[0] - selectedNodeData.position[0];
      const dy = node.position[1] - selectedNodeData.position[1];
      const dz = node.position[2] - selectedNodeData.position[2];
      const linkLength = Math.sqrt(dx*dx + dy*dy + dz*dz);
      
      // Save link to database
      const fromIndex = gameState.nodes.findIndex(n => n.id === selectedNode);
      const toIndex = gameState.nodes.findIndex(n => n.id === nodeId);
      
      // Fire and forget - save link to database
      (async () => {
        try {
          await supabase.rpc('rpc_neural_link', {
            p_session_id: gameState.sessionId,
            p_node_a: fromIndex,
            p_node_b: toIndex,
            p_length: linkLength
          });
        } catch (err) {
          console.error('Failed to save link:', err);
        }
      })();

      setGameState({
        ...gameState,
        links: newLinks,
        moves: newMoves
      });

      audioEngine.playConnect();

      // Check if solved
      const pairIds = new Set(gameState.nodes.map(n => n.pairId));
      const connectedPairs = new Set(newLinks.map(l => {
        const fromNode = gameState.nodes.find(n => n.id === l.from);
        return fromNode?.pairId;
      }));

      if (connectedPairs.size === pairIds.size) {
        // Victory!
        setTimeout(() => {
          audioEngine.playVictory();
          markSolved(newMoves);
        }, 300);
      }

      setSelectedNode(null);
      setDragPath(null);
    }
  }, [gameState, selectedNode]);

  const markSolved = async (finalMoves: number) => {
    if (!gameState) return;

    const duration = Date.now() - startTimeRef.current;
    const xpGain = Math.max(50, 150 - finalMoves * 5);

    try {
      await supabase.rpc('rpc_neural_complete', {
        p_session_id: gameState.sessionId,
        p_duration_ms: duration,
        p_xp_gain: xpGain
      });

      setGameState({
        ...gameState,
        solved: true
      });
    } catch (error) {
      console.error('Failed to mark solved:', error);
    }
  };

  const handleReset = useCallback(async () => {
    if (!gameState) return;

    // Create new session
    const seed = Math.random().toString(36).substring(2, 15);
    const { data: sessionId } = await supabase.rpc('rpc_neural_start', {
      p_seed: seed,
      p_pairs: 6
    });
    
    if (!sessionId) return;
    
    const nodes = generateNeuralGraph(seed, 6);
    
    setGameState({
      sessionId: sessionId as string,
      seed,
      nodes,
      links: [],
      moves: 0,
      startedAt: Date.now(),
      elapsedSeconds: 0,
      solved: false
    });
    
    setSelectedNode(null);
    setDragPath(null);
    audioEngine.playSelect();
    startTimeRef.current = Date.now();
  }, [gameState]);

  const handleUndo = useCallback(() => {
    if (!gameState || gameState.links.length === 0) return;

    const newLinks = gameState.links.slice(0, -1);
    setGameState({
      ...gameState,
      links: newLinks
    });
  }, [gameState]);

  return {
    gameState,
    isLoading,
    selectedNode,
    dragPath,
    handleNodeClick,
    handleReset,
    handleUndo,
    setDragPath
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
