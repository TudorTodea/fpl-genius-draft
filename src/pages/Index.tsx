import { useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { PlayerFilters } from '@/components/filters/PlayerFilters';
import { PlayerTable } from '@/components/table/PlayerTable';
import { TeamBuilder } from '@/components/teambuilder/TeamBuilder';
import { AIRecommender } from '@/components/ai/AIRecommender';
import { PlayerModal } from '@/components/player/PlayerModal';
import { useFPLStore } from '@/store/fplStore';
import { useFPLData } from '@/hooks/useFPLData';

const Index = () => {
  const { 
    selectedPlayer, 
    setSelectedPlayer,
  } = useFPLStore();

  const { loading, error, refetch } = useFPLData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading FPL data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-xl">⚠️</div>
          <h2 className="text-xl font-semibold">Failed to load FPL data</h2>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            <PlayerFilters />
            <PlayerTable />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <TeamBuilder />
            <AIRecommender />
          </div>
        </div>
      </div>

      {/* Player Modal */}
      <PlayerModal
        player={selectedPlayer}
        open={!!selectedPlayer}
        onOpenChange={(open) => !open && setSelectedPlayer(null)}
      />
    </div>
  );
};

export default Index;
