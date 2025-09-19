import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppError, handleError, handleSupabaseError, getUserFriendlyMessage } from "@/utils/errorHandler";
import { validatePetState, validateBeforeSave, logValidationErrors } from "@/utils/validation";
import { useDebounce } from "./useDebounce";
import { useOptimisticUpdate } from "./useOptimisticUpdate";
import { useBatchUpdates } from "./useBatchUpdates";

interface PetState {
  happiness: number;
  hunger: number;
  cleanliness: number;
  energy: number;
  coins: number;
  lastUpdateTime: number;
}

interface ShopItem {
  id: string;
  item_id: string;
  name: string;
  emoji: string;
  cost: number;
  description: string;
  category: string;
}

interface PurchasedItem {
  id: string;
  item_id: string;
  purchased_at: string;
  is_equipped: boolean;
  shop_item: ShopItem;
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
  
  // Tymczasowy tryb offline - używa tylko localStorage
  const OFFLINE_MODE = false; // Wyłączony - używa prawdziwej bazy danych
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionType, setInteractionType] = useState<string>("");
  const [recentEarning, setRecentEarning] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItem[]>([]);
  const [isLoadingShop, setIsLoadingShop] = useState(false);

  // Performance optimizations
  const debouncedPetState = useDebounce(petState, 500); // Debounce for 500ms
  const optimisticUpdate = useOptimisticUpdate(petState);
  const batchUpdates = useBatchUpdates<PetState>(3, 1000); // Batch 3 updates, max 1s delay
  
  // Immediate save for coins to prevent loss on refresh
  const [lastCoinValue, setLastCoinValue] = useState(petState.coins);

  // Load pet data from database or localStorage
  useEffect(() => {
    const loadPetData = async () => {
      setIsLoading(true);
      setError(null);
      
      // Test Supabase connection first
      console.log('Testing Supabase connection in loadPetData...');
      try {
        const { data: testData, error: testError } = await supabase
          .from('pet_data')
          .select('count')
          .limit(1);
        
        if (testError) {
          console.error('Supabase connection failed in loadPetData:', testError);
          setError(new AppError('Błąd połączenia z bazą danych: ' + testError.message, 'SUPABASE_CONNECTION_ERROR', 'high'));
          // Fallback to localStorage
          const saved = localStorage.getItem("petState");
          if (saved) {
            setPetState(JSON.parse(saved));
          }
          setIsLoading(false);
          return;
        }
        console.log('Supabase connection successful in loadPetData');
      } catch (err) {
        console.error('Supabase connection exception in loadPetData:', err);
        setError(new AppError('Błąd połączenia z bazą danych: ' + (err as Error).message, 'SUPABASE_CONNECTION_EXCEPTION', 'high'));
        // Fallback to localStorage
        const saved = localStorage.getItem("petState");
        if (saved) {
          setPetState(JSON.parse(saved));
        }
        setIsLoading(false);
        return;
      }
      
      if (user) {
        // Load from database
        try {
          console.log('Loading pet data for user:', user.id);
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
            // Validate data from database
            const validation = validatePetState({
              happiness: data.happiness,
              hunger: data.hunger,
              cleanliness: data.cleanliness,
              energy: data.energy,
              coins: data.coins,
              lastUpdateTime: new Date(data.last_update_time).getTime(),
            });

            if (validation.isValid && validation.sanitizedData) {
              setPetState(validation.sanitizedData);
            } else {
              logValidationErrors(validation.errors, 'loadPetData');
              // Use sanitized data even if there were validation warnings
              if (validation.sanitizedData) {
                setPetState(validation.sanitizedData);
              }
            }
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

  // Load shop items
  useEffect(() => {
    const loadShopItems = async () => {
      try {
        console.log('Loading shop items...');
        
        if (OFFLINE_MODE) {
          console.log('OFFLINE MODE: Using mock shop items');
          const mockShopItems = [
            { id: '1', item_id: 'hat', name: 'Party Hat', emoji: '🎩', cost: 15, description: 'A stylish hat for your pet', category: 'accessories' },
            { id: '2', item_id: 'bow', name: 'Bow Tie', emoji: '🎀', cost: 12, description: 'Elegant bow tie', category: 'accessories' },
            { id: '3', item_id: 'sunglasses', name: 'Cool Shades', emoji: '🕶️', cost: 20, description: 'Super cool sunglasses', category: 'accessories' },
            { id: '4', item_id: 'background_beach', name: 'Beach Scene', emoji: '🏖️', cost: 25, description: 'Tropical background', category: 'backgrounds' },
            { id: '5', item_id: 'crown', name: 'Royal Crown', emoji: '👑', cost: 50, description: 'Fit for a royal pet', category: 'accessories' },
            { id: '6', item_id: 'scarf', name: 'Cozy Scarf', emoji: '🧣', cost: 18, description: 'Warm and stylish', category: 'accessories' },
            { id: '7', item_id: 'background_space', name: 'Space Scene', emoji: '🚀', cost: 30, description: 'Out of this world!', category: 'backgrounds' },
            { id: '8', item_id: 'background_forest', name: 'Forest Scene', emoji: '🌲', cost: 22, description: 'Nature background', category: 'backgrounds' }
          ];
          setShopItems(mockShopItems);
          return;
        }
        
        // Test connection first
        console.log('Testing Supabase connection...');
        const { data: testData, error: testError } = await supabase
          .from('shop_items')
          .select('count')
          .limit(1);
        
        if (testError) {
          console.error('Supabase connection failed:', testError);
          console.log('Error details:', {
            message: testError.message,
            details: testError.details,
            hint: testError.hint,
            code: testError.code
          });
          setError(new AppError('Błąd połączenia z bazą danych: ' + testError.message, 'SUPABASE_CONNECTION_ERROR', 'high'));
          return;
        }
        
        console.log('Supabase connection successful');
        
        const { data, error } = await supabase
          .from('shop_items')
          .select('*')
          .eq('is_active', true)
          .order('category', { ascending: true })
          .order('cost', { ascending: true });

        console.log('Shop items response:', { data, error });

        if (error) {
          console.error('Error loading shop items:', error);
          setError(new AppError('Błąd ładowania przedmiotów sklepu: ' + error.message, 'SHOP_LOAD_ERROR', 'medium'));
        } else {
          console.log('Loaded shop items:', data?.length || 0, 'items');
          
          // If no shop items exist, try to initialize them
          if (!data || data.length === 0) {
            console.log('No shop items found, attempting to initialize...');
            try {
              // Try RPC function first
              const { error: initError } = await supabase.rpc('initialize_shop_items');
              if (initError) {
                console.error('RPC function failed, trying manual initialization:', initError);
                
                // Fallback: manual initialization
                const shopItemsData = [
                  { item_id: 'hat', name: 'Party Hat', emoji: '🎩', cost: 15, description: 'A stylish hat for your pet', category: 'accessories' },
                  { item_id: 'bow', name: 'Bow Tie', emoji: '🎀', cost: 12, description: 'Elegant bow tie', category: 'accessories' },
                  { item_id: 'sunglasses', name: 'Cool Shades', emoji: '🕶️', cost: 20, description: 'Super cool sunglasses', category: 'accessories' },
                  { item_id: 'background_beach', name: 'Beach Scene', emoji: '🏖️', cost: 25, description: 'Tropical background', category: 'backgrounds' },
                  { item_id: 'crown', name: 'Royal Crown', emoji: '👑', cost: 50, description: 'Fit for a royal pet', category: 'accessories' },
                  { item_id: 'scarf', name: 'Cozy Scarf', emoji: '🧣', cost: 18, description: 'Warm and stylish', category: 'accessories' },
                  { item_id: 'background_space', name: 'Space Scene', emoji: '🚀', cost: 30, description: 'Out of this world!', category: 'backgrounds' },
                  { item_id: 'background_forest', name: 'Forest Scene', emoji: '🌲', cost: 22, description: 'Nature background', category: 'backgrounds' }
                ];

                // Insert items one by one
                for (const item of shopItemsData) {
                  const { error: insertError } = await supabase
                    .from('shop_items')
                    .insert({
                      item_id: item.item_id,
                      name: item.name,
                      emoji: item.emoji,
                      cost: item.cost,
                      description: item.description,
                      category: item.category,
                      is_active: true
                    });
                  
                  if (insertError) {
                    console.error('Error inserting item:', item.item_id, insertError);
                  } else {
                    console.log('Successfully inserted item:', item.item_id);
                  }
                }

                // Reload shop items after manual initialization
                const { data: newData, error: reloadError } = await supabase
                  .from('shop_items')
                  .select('*')
                  .eq('is_active', true)
                  .order('category', { ascending: true })
                  .order('cost', { ascending: true });
                
                if (!reloadError && newData) {
                  console.log('Reloaded shop items after manual init:', newData.length, 'items');
                  setShopItems(newData);
                }
              } else {
                console.log('Shop items initialized successfully via RPC');
                // Reload shop items after initialization
                const { data: newData, error: reloadError } = await supabase
                  .from('shop_items')
                  .select('*')
                  .eq('is_active', true)
                  .order('category', { ascending: true })
                  .order('cost', { ascending: true });
                
                if (!reloadError && newData) {
                  console.log('Reloaded shop items:', newData.length, 'items');
                  setShopItems(newData);
                }
              }
            } catch (initErr) {
              console.error('Error initializing shop items:', initErr);
            }
          } else {
            setShopItems(data);
          }
        }
      } catch (err) {
        console.error('Error loading shop items:', err);
        setError(new AppError('Błąd ładowania sklepu: ' + (err as Error).message, 'SHOP_LOAD_EXCEPTION', 'high'));
      }
    };

    loadShopItems();
  }, []);

  // Load purchased items - simplified approach
  useEffect(() => {
    const loadPurchasedItems = async () => {
      if (!user) return;

      try {
        console.log('Loading purchased items for user:', user.id);
        
        // For now, just use localStorage to track purchased items
        const localPurchased = localStorage.getItem(`purchased_items_${user.id}`);
        if (localPurchased) {
          const parsedItems = JSON.parse(localPurchased);
          console.log('Loaded purchased items from localStorage:', parsedItems.length, 'items');
          setPurchasedItems(parsedItems);
        } else {
          console.log('No purchased items found in localStorage');
          setPurchasedItems([]);
        }
      } catch (err) {
        console.error('Error loading purchased items:', err);
        setPurchasedItems([]);
      }
    };

    loadPurchasedItems();
  }, [user]);

  // Save pet data to database (optimized version)
  const savePetDataToDatabase = useCallback(async (newState: PetState) => {
    // Validate data before saving
    const validation = validateBeforeSave(newState, 'pet');
    
    if (!validation.isValid) {
      logValidationErrors(validation.errors, 'savePetData');
      const appError = new AppError(
        'Nieprawidłowe dane zwierzątka',
        'VALIDATION_ERROR',
        'medium',
        { validationErrors: validation.errors }
      );
      setError(appError);
      return;
    }

    // Use sanitized data
    const sanitizedState = validation.sanitizedData || newState;

    if (user) {
      // Save to database
      try {
        console.log('Attempting to save pet data to database...');
        
        // Test connection first
        const { data: testData, error: testError } = await supabase
          .from('pet_data')
          .select('count')
          .limit(1);
        
        if (testError) {
          console.error('Supabase connection failed in savePetData:', testError);
          setError(new AppError('Błąd połączenia z bazą danych podczas zapisywania: ' + testError.message, 'SUPABASE_SAVE_CONNECTION_ERROR', 'high'));
          // Still save to localStorage as backup
          localStorage.setItem("petState", JSON.stringify(sanitizedState));
          return;
        }
        
        const { error } = await supabase
          .from('pet_data')
          .update({
            happiness: sanitizedState.happiness,
            hunger: sanitizedState.hunger,
            cleanliness: sanitizedState.cleanliness,
            energy: sanitizedState.energy,
            coins: sanitizedState.coins,
            last_update_time: new Date(sanitizedState.lastUpdateTime).toISOString(),
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
    
    // Always save sanitized data to localStorage as backup
    localStorage.setItem("petState", JSON.stringify(sanitizedState));
  }, [user]);

  // Legacy savePetData for backward compatibility
  const savePetData = useCallback(async (newState: PetState) => {
    await savePetDataToDatabase(newState);
  }, [savePetDataToDatabase]);

  // Setup batch processor
  useEffect(() => {
    batchUpdates.setBatchProcessor(async (updates) => {
      console.log('Processing batch:', updates.length, 'updates');
      if (user && updates.length > 0) {
        // Use the latest update
        const latestUpdate = updates[updates.length - 1];
        console.log('Saving latest update:', latestUpdate.data);
        await savePetDataToDatabase(latestUpdate.data);
        console.log('Batch processed successfully');
      }
    });
  }, [user, batchUpdates]);

  // Immediate save for coins when they change
  useEffect(() => {
    if (!isLoading && petState.coins !== lastCoinValue) {
      console.log('Coins changed, saving immediately:', petState.coins);
      setLastCoinValue(petState.coins);
      // Save coins immediately to prevent loss on refresh
      savePetDataToDatabase(petState);
    }
  }, [petState.coins, isLoading, lastCoinValue, savePetDataToDatabase]);

  // Save state with debounce and batching (excluding coins)
  useEffect(() => {
    if (!isLoading && debouncedPetState !== petState) {
      // Only batch non-coin changes
      const { coins, ...otherState } = debouncedPetState;
      const currentStateWithoutCoins = { ...petState, coins: petState.coins };
      
      if (JSON.stringify(otherState) !== JSON.stringify({ ...currentStateWithoutCoins, coins: undefined })) {
        console.log('Adding to batch:', debouncedPetState);
        // Add to batch for processing
        batchUpdates.addToBatch('pet-state', debouncedPetState);
      }
    }
  }, [debouncedPetState, isLoading, batchUpdates, petState]);

  // Clear pending updates when they're processed
  useEffect(() => {
    if (batchUpdates.pendingUpdates === 0) {
      // Updates have been processed
    }
  }, [batchUpdates.pendingUpdates]);

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
    
    // Optimistic update - show change immediately
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

  const purchaseItem = useCallback(async (itemId: string) => {
    console.log('🛒 PURCHASE STARTED for item:', itemId);
    console.log('🛒 User:', user ? 'authenticated' : 'not authenticated');
    console.log('🛒 Current coins:', petState.coins);
    console.log('🛒 OFFLINE_MODE:', OFFLINE_MODE);
    
    if (!user) {
      console.log('🛒 ERROR: User not authenticated');
      setError(new AppError('Musisz być zalogowany, aby kupować przedmioty', 'AUTH_REQUIRED', 'medium'));
      return false;
    }

    setIsLoadingShop(true);
    setError(null);

    try {
      console.log('🛒 Attempting to purchase item:', itemId);
      
      if (OFFLINE_MODE) {
        console.log('OFFLINE MODE: Simulating purchase');
        // Find the item
        const item = shopItems.find(si => si.item_id === itemId);
        if (!item) {
          setError(new AppError('Przedmiot nie został znaleziony', 'ITEM_NOT_FOUND', 'medium'));
          return false;
        }
        
        if (petState.coins < item.cost) {
          setError(new AppError('Nie masz wystarczająco monet', 'INSUFFICIENT_COINS', 'medium'));
          return false;
        }
        
        // Simulate purchase
        const newCoins = petState.coins - item.cost;
        setPetState(prev => ({
          ...prev,
          coins: newCoins,
          lastUpdateTime: Date.now()
        }));
        
        // Add to purchased items (simulated)
        const newPurchasedItem = {
          id: Date.now().toString(),
          item_id: itemId,
          purchased_at: new Date().toISOString(),
          is_equipped: false,
          shop_item: item
        };
        
        setPurchasedItems(prev => [...prev, newPurchasedItem]);
        console.log('OFFLINE MODE: Purchase successful');
        return true;
      }
      
      // First, get the item details
      const { data: itemData, error: itemError } = await supabase
        .from('shop_items')
        .select('*')
        .eq('item_id', itemId)
        .eq('is_active', true)
        .single();

      if (itemError || !itemData) {
        setError(new AppError('Przedmiot nie został znaleziony', 'ITEM_NOT_FOUND', 'medium'));
        return false;
      }

      // Check if user already owns this item (using localStorage)
      console.log('🛒 Checking if user already owns item...');
      const localPurchased = localStorage.getItem(`purchased_items_${user.id}`);
      const currentPurchased = localPurchased ? JSON.parse(localPurchased) : [];
      const alreadyOwned = currentPurchased.some((item: any) => item.item_id === itemId);
      console.log('🛒 Currently owned items:', currentPurchased.length);
      console.log('🛒 Already owns this item?', alreadyOwned);
      
      if (alreadyOwned) {
        console.log('🛒 ERROR: Already owns item');
        setError(new AppError('Już posiadasz ten przedmiot', 'ITEM_ALREADY_OWNED', 'medium'));
        return false;
      }

      // Check if user has enough coins
      console.log('🛒 Checking coins:', petState.coins, 'vs cost:', itemData.cost);
      if (petState.coins < itemData.cost) {
        console.log('🛒 ERROR: Insufficient coins');
        setError(new AppError('Nie masz wystarczająco monet', 'INSUFFICIENT_COINS', 'medium'));
        return false;
      }

      // Manual purchase only (no RPC function)
      console.log('🛒 MANUAL PURCHASE: Starting purchase for item:', itemId);
      
      const newCoins = petState.coins - itemData.cost;
      
      // Update coins
      console.log('🛒 MANUAL: Updating coins from', petState.coins, 'to', newCoins);
      const { error: updateError } = await supabase
        .from('pet_data')
        .update({ 
          coins: newCoins, 
          last_update_time: new Date().toISOString() 
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.log('🛒 MANUAL: Error updating coins:', updateError);
        const appError = handleSupabaseError(updateError, 'purchaseItem');
        setError(appError);
        console.error('Error updating coins:', appError);
        return false;
      }

      // Add purchased item to localStorage (simplified approach)
      console.log('🛒 MANUAL: Adding purchased item to localStorage:', itemId, 'for user:', user.id);
      
      const newPurchasedItem = {
        id: Date.now().toString(),
        item_id: itemId,
        purchased_at: new Date().toISOString(),
        is_equipped: false,
        shop_item: itemData
      };
      
      // Update localStorage
      const localPurchasedData = localStorage.getItem(`purchased_items_${user.id}`);
      const currentPurchasedData = localPurchasedData ? JSON.parse(localPurchasedData) : [];
      const updatedPurchasedData = [...currentPurchasedData, newPurchasedItem];
      localStorage.setItem(`purchased_items_${user.id}`, JSON.stringify(updatedPurchasedData));
      
      console.log('🛒 MANUAL: Purchase saved to localStorage successfully');

      console.log('🛒 MANUAL: Purchase successful, updating coins to:', newCoins);
      // Update pet state with new coin amount
      setPetState(prev => ({
        ...prev,
        coins: newCoins,
        lastUpdateTime: Date.now()
      }));

      // Update purchased items state from localStorage
      console.log('🛒 MANUAL: Updating purchased items state...');
      const localPurchasedData2 = localStorage.getItem(`purchased_items_${user.id}`);
      const currentPurchasedData2 = localPurchasedData2 ? JSON.parse(localPurchasedData2) : [];
      setPurchasedItems(currentPurchasedData2);
      console.log('🛒 MANUAL: Updated purchased items state:', currentPurchasedData2.length, 'items');
      console.log('🛒 MANUAL: SUCCESS - Purchase completed!');

      return true;
    } catch (err) {
      const appError = handleError(err, 'purchaseItem');
      setError(appError);
      console.error('Error purchasing item:', appError);
      return false;
    } finally {
      console.log('Purchase process completed, setting loading to false');
      setIsLoadingShop(false);
    }
  }, [user]);

  // Debug function to test shop items
  const debugShopItems = useCallback(async () => {
    console.log('=== DEBUG SHOP ITEMS ===');
    console.log('Current shopItems:', shopItems);
    console.log('ShopItems length:', shopItems.length);
    console.log('User:', user ? 'authenticated' : 'not authenticated');
    
    // Test basic Supabase connection
    console.log('Testing basic Supabase connection...');
    try {
      const { data: testData, error: testError } = await supabase
        .from('shop_items')
        .select('count')
        .limit(1);
      
      console.log('Basic connection test:', { testData, testError });
      
      if (testError) {
        console.error('Supabase connection failed:', testError);
        console.log('Error details:', {
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
          code: testError.code
        });
        return;
      }
    } catch (err) {
      console.error('Supabase connection exception:', err);
      return;
    }
    
    if (user) {
      console.log('Testing shop items query...');
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .eq('is_active', true);
      
      console.log('Direct query result:', { data, error });
      
      console.log('Testing RPC function...');
      const { data: rpcData, error: rpcError } = await supabase.rpc('initialize_shop_items');
      console.log('RPC result:', { rpcData, rpcError });
    }
    console.log('=== END DEBUG ===');
  }, [shopItems, user]);

  return {
    petState,
    isInteracting,
    interactionType,
    recentEarning,
    isLoading,
    error,
    errorMessage: error ? getUserFriendlyMessage(error) : null,
    isUpdating: batchUpdates.isUpdating,
    pendingUpdates: batchUpdates.pendingUpdates,
    showSyncMessage: batchUpdates.showSyncMessage,
    shopItems,
    purchasedItems,
    isLoadingShop,
    debugShopItems,
    actions: {
      feed,
      clean,
      sleep,
      play,
      purchaseItem,
    },
  };
};
