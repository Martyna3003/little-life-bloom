import { useState, useEffect } from "react";
import petImage from "@/assets/pet-character.png";

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

interface PetDisplayProps {
  happiness: number;
  hunger: number;
  cleanliness: number;
  energy: number;
  isInteracting: boolean;
  interactionType?: string;
  purchasedItems?: PurchasedItem[];
}

const PetDisplay = ({ happiness, hunger, cleanliness, energy, isInteracting, interactionType, purchasedItems = [] }: PetDisplayProps) => {
  const [petMood, setPetMood] = useState("neutral");
  
  useEffect(() => {
    const avgStat = (happiness + (100 - hunger) + cleanliness + energy) / 4;
    
    if (avgStat >= 80) setPetMood("happy");
    else if (avgStat >= 60) setPetMood("content");
    else if (avgStat >= 40) setPetMood("okay");
    else if (avgStat >= 20) setPetMood("sad");
    else setPetMood("very-sad");
  }, [happiness, hunger, cleanliness, energy]);

  const getPetClass = () => {
    let baseClass = "w-48 h-48 object-contain transition-all duration-500 ";
    
    if (isInteracting) {
      baseClass += "animate-bounce-gentle ";
    } else {
      baseClass += "animate-float ";
    }
    
    // Add mood-based effects
    switch (petMood) {
      case "happy":
        baseClass += "brightness-110 saturate-110";
        break;
      case "sad":
      case "very-sad":
        baseClass += "brightness-75 saturate-75 grayscale-25";
        break;
      default:
        baseClass += "brightness-100 saturate-100";
    }
    
    return baseClass;
  };

  const getContainerClass = () => {
    let baseClass = "relative flex items-center justify-center h-64 rounded-3xl p-8 ";
    baseClass += "bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 ";
    baseClass += "border-4 border-white/30 backdrop-blur-sm ";
    
    if (petMood === "happy") {
      baseClass += "shadow-lg shadow-primary/20 ";
    }
    
    return baseClass;
  };

  const getMoodEmoji = () => {
    switch (petMood) {
      case "happy": return "✨";
      case "content": return "😊";
      case "okay": return "😐";
      case "sad": return "😞";
      case "very-sad": return "😢";
      default: return "🙂";
    }
  };

  const renderAccessories = () => {
    const accessories = purchasedItems.filter(item => 
      item.shop_item.category === 'accessories' && item.is_equipped
    );

    return accessories.map((item) => {
      const { item_id, shop_item } = item;
      const { emoji } = shop_item;

      // Position accessories based on item type
      const getAccessoryPosition = (itemId: string) => {
        switch (itemId) {
          case 'hat':
          case 'crown':
            return 'absolute top-2 left-1/2 transform -translate-x-1/2 text-3xl z-10';
          case 'bow':
            return 'absolute top-8 left-1/2 transform -translate-x-1/2 text-2xl z-10';
          case 'sunglasses':
            return 'absolute top-12 left-1/2 transform -translate-x-1/2 text-2xl z-10';
          case 'scarf':
            return 'absolute top-16 left-1/2 transform -translate-x-1/2 text-2xl z-10';
          default:
            return 'absolute top-4 left-1/2 transform -translate-x-1/2 text-2xl z-10';
        }
      };

      return (
        <div
          key={item.id}
          className={getAccessoryPosition(item_id)}
          style={{ 
            animation: isInteracting ? 'bounce-gentle 1s ease-in-out infinite' : 'float 3s ease-in-out infinite'
          }}
        >
          {emoji}
        </div>
      );
    });
  };

  const renderBackground = () => {
    const background = purchasedItems.find(item => 
      item.shop_item.category === 'backgrounds' && item.is_equipped
    );

    if (!background) return null;

    const { emoji } = background.shop_item;
    
    return (
      <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20 z-0">
        {emoji}
      </div>
    );
  };

  return (
    <div className={getContainerClass()}>
      {/* Background */}
      {renderBackground()}
      
      {/* Mood indicator */}
      <div className="absolute top-4 right-4 text-2xl animate-pulse-gentle z-20">
        {getMoodEmoji()}
      </div>
      
      {/* Interaction feedback */}
      {isInteracting && (
        <div className="absolute top-4 left-4 text-2xl animate-bounce-gentle z-20">
          {interactionType === "feed" && "🍎"}
          {interactionType === "clean" && "🚿"}
          {interactionType === "sleep" && "💤"}
          {interactionType === "play" && "🎾"}
        </div>
      )}
      
      {/* Pet character */}
      <img 
        src={petImage} 
        alt="Virtual Pet" 
        className={getPetClass()}
      />
      
      {/* Accessories */}
      {renderAccessories()}
      
      {/* Status effects */}
      {cleanliness < 30 && (
        <div className="absolute bottom-4 left-4 text-yellow-600 z-20">
          💨 Dirty
        </div>
      )}
      {energy < 30 && (
        <div className="absolute bottom-4 right-4 text-blue-600 z-20">
          😴 Tired
        </div>
      )}
    </div>
  );
};

export default PetDisplay;