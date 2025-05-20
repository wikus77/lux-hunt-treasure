
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import ClueDetailView from '@/components/clues/ClueDetailView';
import { useClueManagement } from '@/hooks/useClueManagement';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { useIsMobile } from '@/hooks/use-mobile';

const Clues = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { clues, activeClue, setActiveClue, loading, error } = useClueManagement();
  
  // Set the active clue based on the URL parameter
  useEffect(() => {
    if (!loading && clues.length > 0) {
      if (id) {
        const selectedClue = clues.find(clue => clue.id === id);
        if (selectedClue) {
          setActiveClue(selectedClue);
        } else {
          // If the ID doesn't match any clue, default to the first one
          setActiveClue(clues[0]);
        }
      } else {
        // If no ID is provided, default to the first clue
        setActiveClue(clues[0]);
        // Update the URL to include the ID of the first clue
        if (clues[0]?.id) {
          navigate(`/clues/${clues[0].id}`, { replace: true });
        }
      }
    }
  }, [id, clues, loading, navigate, setActiveClue]);

  // Handle navigation between clues
  const handleNextClue = () => {
    if (!activeClue || clues.length === 0) return;
    
    const currentIndex = clues.findIndex(clue => clue === activeClue);
    if (currentIndex < clues.length - 1) {
      const nextClue = clues[currentIndex + 1];
      setActiveClue(nextClue);
      navigate(`/clues/${nextClue.id}`);
    }
  };

  const handlePreviousClue = () => {
    if (!activeClue || clues.length === 0) return;
    
    const currentIndex = clues.findIndex(clue => clue === activeClue);
    if (currentIndex > 0) {
      const prevClue = clues[currentIndex - 1];
      setActiveClue(prevClue);
      navigate(`/clues/${prevClue.id}`);
    }
  };

  return (
    <div className={`min-h-screen bg-black ${isMobile ? 'pt-[65px]' : 'pt-[80px]'}`}>
      <UnifiedHeader title="Clues" />
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Your Clues</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-destructive/20 text-destructive p-4 rounded-lg">
            <p>{error}</p>
          </div>
        ) : clues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg mb-4">You haven't received any clues yet.</p>
            <p className="text-muted-foreground">
              Clues will be sent based on your subscription plan. Check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Clue Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousClue}
                disabled={clues.findIndex(clue => clue === activeClue) <= 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground">
                {clues.findIndex(clue => clue === activeClue) + 1} of {clues.length}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextClue}
                disabled={clues.findIndex(clue => clue === activeClue) >= clues.length - 1}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {/* Clue Details */}
            {activeClue && (
              <ClueDetailView
                title={activeClue.title}
                description={activeClue.description}
                regionHint={activeClue.region_hint}
                cityHint={activeClue.city_hint}
                location={activeClue.location}
                week={activeClue.week}
                isFinalWeek={activeClue.is_final_week}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clues;
