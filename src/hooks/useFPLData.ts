import { useEffect, useState } from 'react';
import { fplApi } from '@/services/fplApi';
import { transformFPLPlayer } from '@/utils/fplDataTransformer';
import { Player } from '@/types/player';
import { useFPLStore } from '@/store/fplStore';

interface FPLDataState {
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useFPLData() {
  const [state, setState] = useState<FPLDataState>({
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const { setPlayers, setCurrentGameweek } = useFPLStore();

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('Fetching FPL data...');
      const [bootstrapData, fixtures] = await Promise.all([
        fplApi.getBootstrapStatic(),
        fplApi.getFixtures(),
      ]);

      console.log('FPL Bootstrap data:', bootstrapData);
      console.log('FPL Fixtures:', fixtures);

      // Find current gameweek
      const currentGW = bootstrapData.events.find(event => event.is_current)?.id || 1;
      setCurrentGameweek(currentGW);

      // Transform players
      const transformedPlayers: Player[] = bootstrapData.elements.map(player => 
        transformFPLPlayer(player, bootstrapData.teams, bootstrapData.element_types, fixtures)
      );

      console.log('Transformed players:', transformedPlayers.slice(0, 3));
      setPlayers(transformedPlayers);

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        lastUpdated: new Date() 
      }));

    } catch (error) {
      console.error('Error fetching FPL data:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      }));
    }
  };

  const refetch = () => {
    fplApi.clearCache();
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    ...state,
    refetch,
  };
}