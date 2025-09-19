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

interface BathroomProps {
  happiness: number;
  hunger: number;
  cleanliness: number;
  energy: number;
  isInteracting: boolean;
  interactionType?: string;
  onClean: () => void;
  disabled?: boolean;
  purchasedItems?: PurchasedItem[];
}

const Bathroom = ({ happiness, hunger, cleanliness, energy, isInteracting, interactionType, onClean, disabled, purchasedItems }: BathroomProps) => {
  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Bathroom</h2>
        <p className="text-muted-foreground text-sm">Keep your pet clean and fresh!</p>
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

      <div className="bg-gradient-to-br from-accent/20 to-blue-400/20 rounded-3xl p-6 border-2 border-white/30">
        <h3 className="text-lg font-semibold text-center mb-4">Cleaning Station</h3>
        <div className="flex justify-center">
          <Button
            onClick={onClean}
            disabled={disabled}
            className="h-24 w-24 rounded-full bg-gradient-to-br from-accent to-blue-400 text-white font-semibold hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl">🚿</span>
              <span className="text-sm">Shower</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Bathroom;