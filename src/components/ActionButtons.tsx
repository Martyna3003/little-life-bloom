import { Button } from "@/components/ui/button";
import { Utensils, Sparkles, Moon, Gamepad2 } from "lucide-react";

interface ActionButtonsProps {
  onFeed: () => void;
  onClean: () => void;
  onSleep: () => void;
  onPlay: () => void;
  disabled?: boolean;
}

const ActionButtons = ({ onFeed, onClean, onSleep, onPlay, disabled }: ActionButtonsProps) => {
  const buttons = [
    {
      action: onFeed,
      icon: Utensils,
      label: "Feed",
      gradient: "from-pet-hungry to-orange-400",
      emoji: "🍎"
    },
    {
      action: onClean,
      icon: Sparkles,
      label: "Clean", 
      gradient: "from-accent to-blue-400",
      emoji: "🚿"
    },
    {
      action: onSleep,
      icon: Moon,
      label: "Sleep",
      gradient: "from-pet-tired to-indigo-400", 
      emoji: "💤"
    },
    {
      action: onPlay,
      icon: Gamepad2,
      label: "Play",
      gradient: "from-pet-happy to-green-400",
      emoji: "🎾"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <Button
            key={button.label}
            onClick={button.action}
            disabled={disabled}
            className={`
              relative overflow-hidden h-20 rounded-2xl border-2 border-white/30
              bg-gradient-to-br ${button.gradient}
              text-white font-semibold text-lg
              hover:scale-105 hover:shadow-lg
              active:scale-95
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{button.emoji}</span>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm">{button.label}</span>
            </div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 -top-4 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-y-12 opacity-0 hover:opacity-100 transition-opacity duration-300 animate-pulse" />
          </Button>
        );
      })}
    </div>
  );
};

export default ActionButtons;