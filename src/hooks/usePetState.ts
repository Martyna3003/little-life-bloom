import { useState, useEffect, useCallback } from "react";

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

export const usePetState = () => {
  const [petState, setPetState] = useState<PetState>(() => {
    const saved = localStorage.getItem("petState");
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionType, setInteractionType] = useState<string>("");
  const [recentEarning, setRecentEarning] = useState(0);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem("petState", JSON.stringify(petState));
  }, [petState]);

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
    
    setPetState(prev => ({
      ...prev,
      ...updates,
      happiness: Math.min(100, Math.max(0, (updates.happiness ?? prev.happiness))),
      hunger: Math.min(100, Math.max(0, (updates.hunger ?? prev.hunger))),
      cleanliness: Math.min(100, Math.max(0, (updates.cleanliness ?? prev.cleanliness))),
      energy: Math.min(100, Math.max(0, (updates.energy ?? prev.energy))),
      coins: Math.max(0, (updates.coins ?? prev.coins)),
      lastUpdateTime: Date.now(),
    }));

    // Calculate coin reward based on action effectiveness
    const avgStat = ((updates.happiness ?? petState.happiness) + 
                    (100 - (updates.hunger ?? petState.hunger)) + 
                    (updates.cleanliness ?? petState.cleanliness) + 
                    (updates.energy ?? petState.energy)) / 4;
    
    if (avgStat > 70) {
      const coinReward = Math.floor(Math.random() * 3) + 1;
      setRecentEarning(coinReward);
      setPetState(prev => ({ ...prev, coins: prev.coins + coinReward }));
      
      setTimeout(() => setRecentEarning(0), 2000);
    }

    setTimeout(() => {
      setIsInteracting(false);
      setInteractionType("");
    }, 1500);
  }, [petState]);

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
    actions: {
      feed,
      clean,
      sleep,
      play,
    },
  };
};