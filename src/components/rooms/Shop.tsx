import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ShopProps {
  coins: number;
  onPurchase?: (item: string, cost: number) => void;
}

const Shop = ({ coins, onPurchase }: ShopProps) => {
  const items = [
    { id: 'hat', name: 'Party Hat', emoji: '🎩', cost: 15, description: 'A stylish hat for your pet' },
    { id: 'bow', name: 'Bow Tie', emoji: '🎀', cost: 12, description: 'Elegant bow tie' },
    { id: 'sunglasses', name: 'Cool Shades', emoji: '🕶️', cost: 20, description: 'Super cool sunglasses' },
    { id: 'background', name: 'Beach Scene', emoji: '🏖️', cost: 25, description: 'Tropical background' },
  ];

  const handlePurchase = (item: typeof items[0]) => {
    if (coins >= item.cost && onPurchase) {
      onPurchase(item.id, item.cost);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Shop</h2>
        <p className="text-muted-foreground text-sm">Spend your coins on cool items!</p>
      </div>

      <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl p-4 border-2 border-white/30">
        <div className="flex items-center justify-center gap-2 text-xl font-bold">
          <span>💰</span>
          <span>{coins} coins</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const canAfford = coins >= item.cost;
          
          return (
            <div key={item.id} className="bg-white/30 rounded-2xl p-4 border border-white/50">
              <div className="text-center mb-3">
                <div className="text-4xl mb-2">{item.emoji}</div>
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                <Badge variant={canAfford ? "default" : "secondary"} className="mb-2">
                  {item.cost} coins
                </Badge>
              </div>
              
              <Button
                onClick={() => handlePurchase(item)}
                disabled={!canAfford}
                variant={canAfford ? "default" : "secondary"}
                size="sm"
                className="w-full"
              >
                {canAfford ? 'Buy' : 'Too Expensive'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Shop;