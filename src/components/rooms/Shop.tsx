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
  console.log('🛍️ SHOP: Component rendered with:', {
    coins,
    shopItemsLength: shopItems.length,
    purchasedItemsLength: purchasedItems.length,
    purchasedItems,
    isLoading,
    hasOnPurchase: !!onPurchase
  });
  const handlePurchase = async (item: ShopItem) => {
    console.log('🛍️ SHOP: Purchase button clicked for item:', item.item_id);
    console.log('🛍️ SHOP: Current coins:', coins);
    console.log('🛍️ SHOP: Item cost:', item.cost);
    console.log('🛍️ SHOP: Can afford?', coins >= item.cost);
    console.log('🛍️ SHOP: onPurchase function exists?', !!onPurchase);
    
    if (coins >= item.cost && onPurchase) {
      console.log('🛍️ SHOP: Calling onPurchase function...');
      const result = await onPurchase(item.item_id);
      console.log('🛍️ SHOP: Purchase result:', result);
    } else {
      console.log('🛍️ SHOP: Purchase blocked - insufficient coins or no purchase function');
    }
  };

  const isItemOwned = (itemId: string) => {
    console.log('🛍️ SHOP: Checking if item is owned:', itemId);
    console.log('🛍️ SHOP: Current purchasedItems:', purchasedItems);
    console.log('🛍️ SHOP: PurchasedItems length:', purchasedItems.length);
    const owned = purchasedItems.some(purchased => purchased.item_id === itemId);
    console.log('🛍️ SHOP: Is owned?', owned);
    return owned;
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
            Debug Shop ({shopItems.length} items, {purchasedItems.length} owned)
          </Button>
        )}
        <div className="text-xs text-muted-foreground mt-2">
          Debug Info: {purchasedItems.length} purchased items loaded
          {purchasedItems.length > 0 && (
            <div className="mt-1">
              Owned: {purchasedItems.map(item => item.item_id).join(', ')}
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Current coins: {coins}
        </div>
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
          
          console.log('🛍️ SHOP: Rendering item:', item.item_id, {
            canAfford,
            isOwned,
            cost: item.cost,
            coins
          });
          
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
              <div className="text-xs text-muted-foreground mt-1">
                Debug: {isOwned ? 'OWNED' : canAfford ? 'CAN BUY' : 'TOO EXPENSIVE'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Shop;