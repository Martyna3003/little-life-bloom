import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface ShopProps {
  coins: number;
  shopItems: ShopItem[];
  purchasedItems: PurchasedItem[];
  isLoading: boolean;
  onPurchase?: (itemId: string) => Promise<boolean>;
  onDebug?: () => void;
}

const Shop = ({ coins, shopItems, purchasedItems, isLoading, onPurchase, onDebug }: ShopProps) => {
  const handlePurchase = async (item: ShopItem) => {
    if (coins >= item.cost && onPurchase) {
      await onPurchase(item.item_id);
    }
  };

  const isItemOwned = (itemId: string) => {
    return purchasedItems.some(purchased => purchased.item_id === itemId);
  };

  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Shop</h2>
        <p className="text-muted-foreground text-sm">Spend your coins on cool items!</p>
        {onDebug && (
          <Button 
            onClick={onDebug} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Debug Shop ({shopItems.length} items)
          </Button>
        )}
      </div>

      <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl p-4 border-2 border-white/30">
        <div className="flex items-center justify-center gap-2 text-xl font-bold">
          <span>💰</span>
          <span>{coins} coins</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {shopItems.map((item) => {
          const canAfford = coins >= item.cost;
          const isOwned = isItemOwned(item.item_id);
          
          return (
            <div key={item.id} className="bg-white/30 rounded-2xl p-4 border border-white/50">
              <div className="text-center mb-3">
                <div className="text-4xl mb-2">{item.emoji}</div>
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                <Badge variant={isOwned ? "outline" : canAfford ? "default" : "secondary"} className="mb-2">
                  {isOwned ? 'Owned' : `${item.cost} coins`}
                </Badge>
              </div>
              
              <Button
                onClick={() => handlePurchase(item)}
                disabled={!canAfford || isOwned || isLoading}
                variant={isOwned ? "outline" : canAfford ? "default" : "secondary"}
                size="sm"
                className="w-full"
              >
                {isLoading ? 'Loading...' : isOwned ? 'Owned' : canAfford ? 'Buy' : 'Too Expensive'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Shop;