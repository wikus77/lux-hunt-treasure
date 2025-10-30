/**
 * © 2025 Joseph MULÉ – M1SSION™ – Neural Game Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NeuralGameState, NeuralSession, NeuralLink } from './types';
import { generateNeuralGraph, checkLinkIntersection, generateLinkPath } from './NeuralGraph';
import { audioEngine } from './AudioEngine';

export function useNeuralGame() {
  const [gameState, setGameState] = useState<NeuralGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragPath, setDragPath] = useState<Array<[number, number, number]> | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Initialize game
  useEffect(() => {
    initGame();
  }, []);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!gameState) return;

    saveTimerRef.current = setInterval(() => {
      saveGameState();
    }, 5000);

    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
    };
  }, [gameState]);

  const initGame = async () => {
    try {
      setIsLoading(true);
      
      const { data: session, error } = await supabase.rpc('rpc_neural_start', {
        p_pairs: 6
      }) as { data: NeuralSession | null; error: any };

      if (error) throw error;
      if (!session) throw new Error('Failed to create session');

      // Check if we have saved state
      const savedState = session.last_state as any;
      
      let state: NeuralGameState;
      
      if (savedState && savedState.links && savedState.links.length > 0) {
        // Resume from saved state
        state = {
          sessionId: session.id,
          seed: session.seed,
          nodes: savedState.nodes || generateNeuralGraph(session.seed, session.pairs_count),
          links: savedState.links || [],
          moves: session.moves,
          startedAt: new Date(session.started_at).getTime(),
          elapsedSeconds: session.elapsed_seconds,
          solved: session.solved
        };
      } else {
        // New game
        const nodes = generateNeuralGraph(session.seed, session.pairs_count);
        state = {
          sessionId: session.id,
          seed: session.seed,
          nodes,
          links: [],
          moves: 0,
          startedAt: Date.now(),
          elapsedSeconds: 0,
          solved: false
        };
      }

      setGameState(state);
      startTimeRef.current = Date.now();
    } catch (error) {
      console.error('Failed to init game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGameState = async () => {
    if (!gameState) return;

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000) + gameState.elapsedSeconds;

    try {
      await supabase.rpc('rpc_neural_save', {
        p_session: gameState.sessionId,
        p_state: {
          nodes: gameState.nodes,
          links: gameState.links
        } as any,
        p_moves: gameState.moves,
        p_elapsed: elapsed
      });
    } catch (error) {
      console.error('Failed to save state:', error);
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
        // Flash red (handled by renderer)
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
          markSolved();
        }, 300);
      }

      setSelectedNode(null);
      setDragPath(null);
      
      // Immediate save
      saveGameState();
    }
  }, [gameState, selectedNode]);

  const markSolved = async () => {
    if (!gameState) return;

    try {
      await supabase.rpc('rpc_neural_complete', {
        p_session: gameState.sessionId
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

    setGameState({
      ...gameState,
      links: [],
      moves: 0,
      solved: false
    });

    await saveGameState();
  }, [gameState]);

  const handleUndo = useCallback(() => {
    if (!gameState || gameState.links.length === 0) return;

    const newLinks = gameState.links.slice(0, -1);
    setGameState({
      ...gameState,
      links: newLinks
    });

    saveGameState();
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
