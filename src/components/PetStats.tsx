import { Progress } from "@/components/ui/progress";
import { Heart, Utensils, Sparkles, Battery } from "lucide-react";

interface PetStatsProps {
  happiness: number;
  hunger: number;
  cleanliness: number;
  energy: number;
}

const PetStats = ({ happiness, hunger, cleanliness, energy }: PetStatsProps) => {
  const stats = [
    { 
      name: "Happiness", 
      value: happiness, 
      icon: Heart, 
      color: "pet-happy",
      bgColor: "bg-green-100"
    },
    { 
      name: "Hunger", 
      value: 100 - hunger, 
      icon: Utensils, 
      color: "pet-hungry",
      bgColor: "bg-orange-100"
    },
    { 
      name: "Cleanliness", 
      value: cleanliness, 
      icon: Sparkles, 
      color: "accent",
      bgColor: "bg-blue-100"
    },
    { 
      name: "Energy", 
      value: energy, 
      icon: Battery, 
      color: "pet-tired",
      bgColor: "bg-purple-100"
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className={`${stat.bgColor} rounded-2xl p-4 border-2 border-white/50 backdrop-blur-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-5 h-5" style={{ color: `hsl(var(--${stat.color}))` }} />
              <span className="text-sm font-medium text-foreground/80">{stat.name}</span>
            </div>
            <Progress 
              value={stat.value} 
              className="h-3 bg-white/50"
            />
            <span className="text-xs text-foreground/60 mt-1 block">{Math.round(stat.value)}%</span>
          </div>
        );
      })}
    </div>
  );
};

export default PetStats;