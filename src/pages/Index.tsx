import PetDisplay from "@/components/PetDisplay";
import PetStats from "@/components/PetStats";
import ActionButtons from "@/components/ActionButtons";
import CoinDisplay from "@/components/CoinDisplay";
import { usePetState } from "@/hooks/usePetState";

const Index = () => {
  const { petState, isInteracting, interactionType, recentEarning, actions } = usePetState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <div className="container mx-auto max-w-md p-4 space-y-6">
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Virtual Pet
          </h1>
          <p className="text-muted-foreground">Take care of your digital companion!</p>
        </div>

        {/* Coins */}
        <CoinDisplay coins={petState.coins} recentEarning={recentEarning} />

        {/* Pet Display */}
        <PetDisplay
          happiness={petState.happiness}
          hunger={petState.hunger}
          cleanliness={petState.cleanliness}
          energy={petState.energy}
          isInteracting={isInteracting}
          interactionType={interactionType}
        />

        {/* Pet Stats */}
        <PetStats
          happiness={petState.happiness}
          hunger={petState.hunger}
          cleanliness={petState.cleanliness}
          energy={petState.energy}
        />

        {/* Action Buttons */}
        <ActionButtons
          onFeed={actions.feed}
          onClean={actions.clean}
          onSleep={actions.sleep}
          onPlay={actions.play}
          disabled={isInteracting}
        />
      </div>
    </div>
  );
};

export default Index;
