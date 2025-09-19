import { Button } from "@/components/ui/button";
import PetDisplay from "@/components/PetDisplay";

interface PurchasedItem {
  id: string;
  item_id: string;
  purchased_at: string;
  is_equipped: boolean;
  shop_item: {
    id: string;
    name: string;
    emoji: string;
    cost: number;
    description: string;
    category: string;
  };
}

interface GameRoomProps {
  happiness: number;
  hunger: number;
  cleanliness: number;
  energy: number;
  isInteracting: boolean;
  interactionType?: string;
  onPlay: () => void;
  disabled?: boolean;
  purchasedItems?: PurchasedItem[];
}

const GameRoom = ({ happiness, hunger, cleanliness, energy, isInteracting, interactionType, onPlay, disabled, purchasedItems }: GameRoomProps) => {
  const canPlay = energy >= 20;
  
  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Game Room</h2>
        <p className="text-muted-foreground text-sm">Play games to earn coins!</p>
      </div>

      <PetDisplay
        happiness={happiness}
        hunger={hunger}
        cleanliness={cleanliness}
        energy={energy}
        isInteracting={isInteracting}
        interactionType={interactionType}
        purchasedItems={purchasedItems}
      />

      <div className="bg-gradient-to-br from-pet-happy/20 to-green-400/20 rounded-3xl p-6 border-2 border-white/30">
        <h3 className="text-lg font-semibold text-center mb-4">Mini Games</h3>
        
        {!canPlay && (
          <div className="text-center mb-4 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
            <p className="text-sm text-yellow-800">Your pet is too tired to play! Let them rest first.</p>
          </div>
        )}
        
        <div className="flex justify-center">
          <Button
            onClick={onPlay}
            disabled={disabled || !canPlay}
            className="h-24 w-32 rounded-2xl bg-gradient-to-br from-pet-happy to-green-400 text-white font-semibold hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl">🎾</span>
              <span className="text-sm">Ball Game</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;