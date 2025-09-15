import { useState, useEffect } from "react";
import petImage from "@/assets/pet-character.png";

interface PetDisplayProps {
  happiness: number;
  hunger: number;
  cleanliness: number;
  energy: number;
  isInteracting: boolean;
  interactionType?: string;
}

const PetDisplay = ({ happiness, hunger, cleanliness, energy, isInteracting, interactionType }: PetDisplayProps) => {
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

  return (
    <div className={getContainerClass()}>
      {/* Mood indicator */}
      <div className="absolute top-4 right-4 text-2xl animate-pulse-gentle">
        {getMoodEmoji()}
      </div>
      
      {/* Interaction feedback */}
      {isInteracting && (
        <div className="absolute top-4 left-4 text-2xl animate-bounce-gentle">
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
      
      {/* Status effects */}
      {cleanliness < 30 && (
        <div className="absolute bottom-4 left-4 text-yellow-600">
          💨 Dirty
        </div>
      )}
      {energy < 30 && (
        <div className="absolute bottom-4 right-4 text-blue-600">
          😴 Tired
        </div>
      )}
    </div>
  );
};

export default PetDisplay;