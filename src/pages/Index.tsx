import { useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { PlayerFilters } from '@/components/filters/PlayerFilters';
import { PlayerTable } from '@/components/table/PlayerTable';
import { TeamBuilder } from '@/components/teambuilder/TeamBuilder';
import { AIRecommender } from '@/components/ai/AIRecommender';
import { PlayerModal } from '@/components/player/PlayerModal';
import { useFPLStore } from '@/store/fplStore';
import { mockPlayers } from '@/data/mockPlayers';

const Index = () => {
  const { 
    setPlayers, 
    filteredPlayers, 
    selectedPlayer, 
    setSelectedPlayer,
    filters,
    searchQuery 
  } = useFPLStore();

  useEffect(() => {
    // Initialize with mock data
    setPlayers(mockPlayers);
  }, [setPlayers]);

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
