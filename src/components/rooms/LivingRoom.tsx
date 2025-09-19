import PetDisplay from "@/components/PetDisplay";
import PetStats from "@/components/PetStats";

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

interface LivingRoomProps {
  happiness: number;
  hunger: number;
  cleanliness: number;
  energy: number;
  isInteracting: boolean;
  interactionType?: string;
  purchasedItems?: PurchasedItem[];
}

const LivingRoom = ({ happiness, hunger, cleanliness, energy, isInteracting, interactionType, purchasedItems }: LivingRoomProps) => {
  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Living Room</h2>
        <p className="text-muted-foreground text-sm">Your pet is relaxing here</p>
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

      <PetStats
        happiness={happiness}
        hunger={hunger}
        cleanliness={cleanliness}
        energy={energy}
      />
    </div>
  );
};

export default LivingRoom;