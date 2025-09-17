import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppError, handleError, handleSupabaseError, getUserFriendlyMessage } from "@/utils/errorHandler";

interface PetState {
  happiness: number;
  hunger: number;
  cleanliness: number;
  energy: number;
  coins: number;
  lastUpdateTime: number;
}

const INITIAL_STATE: PetState = {
  happiness: 75,
  hunger: 25,
  cleanliness: 85,
  energy: 80,
  coins: 10,
  lastUpdateTime: Date.now(),
};

// Decay rates per minute
const DECAY_RATES = {
  happiness: 0.5,
  hunger: 1.2,
  cleanliness: 0.8,
  energy: 0.6,
};

export const usePetStateWithAuth = () => {
  const { user } = useAuth();
  const [petState, setPetState] = useState<PetState>(INITIAL_STATE);
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionType, setInteractionType] = useState<string>("");
  const [recentEarning, setRecentEarning] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  // Load pet data from database or localStorage
  useEffect(() => {
    const loadPetData = async () => {
      setIsLoading(true);
      setError(null);
      
      if (user) {
        // Load from database
        try {
          const { data, error } = await supabase
            .from('pet_data')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            const appError = handleSupabaseError(error, 'loadPetData');
            setError(appError);
            console.error('Error loading pet data:', appError);
            
            // Fallback to localStorage
            const saved = localStorage.getItem("petState");
            if (saved) {
              setPetState(JSON.parse(saved));
            }
          } else if (data) {
            setPetState({
              happiness: data.happiness,
              hunger: data.hunger,
              cleanliness: data.cleanliness,
              energy: data.energy,
              coins: data.coins,
              lastUpdateTime: new Date(data.last_update_time).getTime(),
            });
          }
        } catch (err) {
          const appError = handleError(err, 'loadPetData');
          setError(appError);
          console.error('Error loading pet data:', appError);
          
          // Fallback to localStorage
          const saved = localStorage.getItem("petState");
          if (saved) {
            setPetState(JSON.parse(saved));
          }
        }
      } else {
        // Load from localStorage for guest users
        const saved = localStorage.getItem("petState");
        if (saved) {
          setPetState(JSON.parse(saved));
        }
      }
      
      setIsLoading(false);
    };

    loadPetData();
  }, [user]);

  // Save pet data to database or localStorage
  const savePetData = useCallback(async (newState: PetState) => {
    if (user) {
      // Save to database
      try {
        console.log('Attempting to save pet data to database...');
        const { error } = await supabase
          .from('pet_data')
          .update({
            happiness: newState.happiness,
            hunger: newState.hunger,
            cleanliness: newState.cleanliness,
            energy: newState.energy,
            coins: newState.coins,
            last_update_time: new Date(newState.lastUpdateTime).toISOString(),
          })
          .eq('user_id', user.id);

        if (error) {
          console.log('Supabase returned error:', error);
          const appError = handleSupabaseError(error, 'savePetData');
          setError(appError);
          console.error('Error saving pet data:', appError);
        } else {
          console.log('Successfully saved to database');
          // Clear error on successful save
          setError(null);
        }
      } catch (err) {
        console.log('Caught exception during save:', err);
        const appError = handleError(err, 'savePetData');
        setError(appError);
        console.error('Error saving pet data:', appError);
      }
    }
    
    // Always save to localStorage as backup
    localStorage.setItem("petState", JSON.stringify(newState));
  }, [user]);

  // Save state whenever it changes
  useEffect(() => {
    if (!isLoading) {
      savePetData(petState);
    }
  }, [petState, savePetData, isLoading]);

  // Automatic decay over time
  useEffect(() => {
    const interval = setInterval(() => {
      setPetState(prev => {
        const now = Date.now();
        const timeDiff = (now - prev.lastUpdateTime) / (1000 * 60); // minutes
        
        if (timeDiff < 0.1) return prev; // Don't decay too frequently
        
        return {
          ...prev,
          happiness: Math.max(0, prev.happiness - DECAY_RATES.happiness * timeDiff),
          hunger: Math.min(100, prev.hunger + DECAY_RATES.hunger * timeDiff),
          cleanliness: Math.max(0, prev.cleanliness - DECAY_RATES.cleanliness * timeDiff),
          energy: Math.max(0, prev.energy - DECAY_RATES.energy * timeDiff),
          lastUpdateTime: now,
        };
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const performAction = useCallback((type: string, updates: Partial<PetState>) => {
    setIsInteracting(true);
    setInteractionType(type);
    
    setPetState(prev => {
      const newState = {
        ...prev,
        ...updates,
        happiness: Math.min(100, Math.max(0, (updates.happiness ?? prev.happiness))),
        hunger: Math.min(100, Math.max(0, (updates.hunger ?? prev.hunger))),
        cleanliness: Math.min(100, Math.max(0, (updates.cleanliness ?? prev.cleanliness))),
        energy: Math.min(100, Math.max(0, (updates.energy ?? prev.energy))),
        coins: Math.max(0, (updates.coins ?? prev.coins)),
        lastUpdateTime: Date.now(),
      };

      // Calculate coin reward based on action effectiveness
      const avgStat = (newState.happiness + (100 - newState.hunger) + newState.cleanliness + newState.energy) / 4;
      
      if (avgStat > 70) {
        const coinReward = Math.floor(Math.random() * 3) + 1;
        setRecentEarning(coinReward);
        newState.coins += coinReward;
        
        setTimeout(() => setRecentEarning(0), 2000);
      }

      return newState;
    });

    setTimeout(() => {
      setIsInteracting(false);
      setInteractionType("");
    }, 1500);
  }, []);

  const feed = useCallback(() => {
    performAction("feed", {
      hunger: petState.hunger - 30,
      happiness: petState.happiness + 10,
    });
  }, [petState, performAction]);

  const clean = useCallback(() => {
    performAction("clean", {
      cleanliness: petState.cleanliness + 40,
      happiness: petState.happiness + 15,
    });
  }, [petState, performAction]);

  const sleep = useCallback(() => {
    performAction("sleep", {
      energy: petState.energy + 50,
      happiness: petState.happiness + 5,
    });
  }, [petState, performAction]);

  const play = useCallback(() => {
    if (petState.energy < 20) return; // Too tired to play
    
    performAction("play", {
      happiness: petState.happiness + 25,
      energy: petState.energy - 15,
    });
  }, [petState, performAction]);

  return {
    petState,
    isInteracting,
    interactionType,
    recentEarning,
    isLoading,
    error,
    errorMessage: error ? getUserFriendlyMessage(error) : null,
    actions: {
      feed,
      clean,
      sleep,
      play,
    },
  };
};
