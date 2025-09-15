import CoinDisplay from "@/components/CoinDisplay";
import RoomNavigation from "@/components/RoomNavigation";
import LivingRoom from "@/components/rooms/LivingRoom";
import Kitchen from "@/components/rooms/Kitchen";
import Bathroom from "@/components/rooms/Bathroom";
import GameRoom from "@/components/rooms/GameRoom";
import Bedroom from "@/components/rooms/Bedroom";
import Shop from "@/components/rooms/Shop";
import { usePetState } from "@/hooks/usePetState";
import { useRoomNavigation } from "@/hooks/useRoomNavigation";

const Index = () => {
  const { petState, isInteracting, interactionType, recentEarning, actions } = usePetState();
  const { currentRoom, navigateToRoom } = useRoomNavigation();

  const renderRoom = () => {
    const commonProps = {
      happiness: petState.happiness,
      hunger: petState.hunger,
      cleanliness: petState.cleanliness,
      energy: petState.energy,
      isInteracting,
      interactionType,
      disabled: isInteracting,
    };

    switch (currentRoom) {
      case 'kitchen':
        return <Kitchen {...commonProps} onFeed={actions.feed} />;
      case 'bathroom':
        return <Bathroom {...commonProps} onClean={actions.clean} />;
      case 'game':
        return <GameRoom {...commonProps} onPlay={actions.play} />;
      case 'bedroom':
        return <Bedroom {...commonProps} onSleep={actions.sleep} />;
      case 'shop':
        return <Shop coins={petState.coins} />;
      default:
        return <LivingRoom {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex flex-col">
      <div className="container mx-auto max-w-md flex flex-col h-screen">
        {/* Header */}
        <div className="text-center pt-4 pb-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Virtual Pet
          </h1>
          <p className="text-muted-foreground">Take care of your digital companion!</p>
        </div>

        {/* Coins */}
        <CoinDisplay coins={petState.coins} recentEarning={recentEarning} />

        {/* Current Room */}
        {renderRoom()}

        {/* Room Navigation */}
        <RoomNavigation currentRoom={currentRoom} onNavigate={navigateToRoom} />
      </div>
    </div>
  );
};

export default Index;
