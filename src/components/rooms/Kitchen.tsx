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

interface KitchenProps {
  happiness: number;
  hunger: number;
  cleanliness: number;
  energy: number;
  isInteracting: boolean;
  interactionType?: string;
  onFeed: () => void;
  disabled?: boolean;
  purchasedItems?: PurchasedItem[];
}

const Kitchen = ({ happiness, hunger, cleanliness, energy, isInteracting, interactionType, onFeed, disabled, purchasedItems }: KitchenProps) => {
  const foods = [
    { name: "Apple", emoji: "🍎", hungerReduction: 30 },
    { name: "Bread", emoji: "🍞", hungerReduction: 20 },
  ];

  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Kitchen</h2>
        <p className="text-muted-foreground text-sm">Feed your hungry pet!</p>
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

      <div className="bg-gradient-to-br from-pet-hungry/20 to-orange-400/20 rounded-3xl p-6 border-2 border-white/30">
        <h3 className="text-lg font-semibold text-center mb-4">Choose Food</h3>
        <div className="grid grid-cols-2 gap-3">
          {foods.map((food) => (
            <Button
              key={food.name}
              onClick={onFeed}
              disabled={disabled}
              className="h-20 rounded-2xl bg-gradient-to-br from-pet-hungry to-orange-400 text-white font-semibold hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">{food.emoji}</span>
                <span className="text-sm">{food.name}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Kitchen;