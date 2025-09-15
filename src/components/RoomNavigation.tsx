import { Button } from "@/components/ui/button";
import { Home, ChefHat, Bath, Gamepad2, Bed, ShoppingBag } from "lucide-react";
import { RoomType } from "@/hooks/useRoomNavigation";

interface RoomNavigationProps {
  currentRoom: RoomType;
  onNavigate: (room: RoomType) => void;
}

const RoomNavigation = ({ currentRoom, onNavigate }: RoomNavigationProps) => {
  const rooms = [
    { id: 'living' as RoomType, icon: Home, label: 'Living', color: 'from-primary/20 to-secondary/20' },
    { id: 'kitchen' as RoomType, icon: ChefHat, label: 'Kitchen', color: 'from-pet-hungry/30 to-orange-400/30' },
    { id: 'bathroom' as RoomType, icon: Bath, label: 'Bath', color: 'from-accent/30 to-blue-400/30' },
    { id: 'game' as RoomType, icon: Gamepad2, label: 'Games', color: 'from-pet-happy/30 to-green-400/30' },
    { id: 'bedroom' as RoomType, icon: Bed, label: 'Sleep', color: 'from-pet-tired/30 to-indigo-400/30' },
    { id: 'shop' as RoomType, icon: ShoppingBag, label: 'Shop', color: 'from-yellow-400/30 to-orange-400/30' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm border-t-2 border-white/30 p-2">
      <div className="flex justify-center gap-1 max-w-md mx-auto">
        {rooms.map((room) => {
          const Icon = room.icon;
          const isActive = currentRoom === room.id;
          
          return (
            <Button
              key={room.id}
              onClick={() => onNavigate(room.id)}
              variant="ghost"
              className={`
                flex-1 h-16 rounded-xl transition-all duration-200
                ${isActive 
                  ? `bg-gradient-to-br ${room.color} border-2 border-white/50 shadow-lg scale-105` 
                  : 'bg-white/30 hover:bg-white/50 border border-white/30'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1">
                <Icon className={`w-5 h-5 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
                <span className={`text-xs ${isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                  {room.label}
                </span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default RoomNavigation;