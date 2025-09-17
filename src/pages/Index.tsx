import CoinDisplay from "@/components/CoinDisplay";
import RoomNavigation from "@/components/RoomNavigation";
import LivingRoom from "@/components/rooms/LivingRoom";
import Kitchen from "@/components/rooms/Kitchen";
import Bathroom from "@/components/rooms/Bathroom";
import GameRoom from "@/components/rooms/GameRoom";
import Bedroom from "@/components/rooms/Bedroom";
import Shop from "@/components/rooms/Shop";
import { Header } from "@/components/Header";
import { usePetStateWithAuth } from "@/hooks/usePetStateWithAuth";
import { useRoomNavigation } from "@/hooks/useRoomNavigation";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { petState, isInteracting, interactionType, recentEarning, isLoading, error, errorMessage, actions } = usePetStateWithAuth();
  const { currentRoom, navigateToRoom } = useRoomNavigation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your pet...</p>
        </div>
      </div>
    );
  }

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
        <Header 
          title="My Virtual Pet" 
          subtitle="Take care of your digital companion!" 
        />

        {/* Error Display */}
        {error && (
          <div className="mx-4 mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
              <p className="text-sm text-destructive font-medium">
                {errorMessage}
              </p>
            </div>
            {error.severity === 'high' && (
              <p className="text-xs text-muted-foreground mt-1">
                Kod błędu: {error.code}
              </p>
            )}
          </div>
        )}

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
