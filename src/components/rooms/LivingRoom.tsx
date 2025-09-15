import PetDisplay from "@/components/PetDisplay";
import PetStats from "@/components/PetStats";

interface LivingRoomProps {
  happiness: number;
  hunger: number;
  cleanliness: number;
  energy: number;
  isInteracting: boolean;
  interactionType?: string;
}

const LivingRoom = ({ happiness, hunger, cleanliness, energy, isInteracting, interactionType }: LivingRoomProps) => {
  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Living Room</h2>
        <p className="text-muted-foreground text-sm">Your pet is relaxing here</p>
      </div>

      <PetDisplay
        happiness={happiness}
        hunger={hunger}
        cleanliness={cleanliness}
        energy={energy}
        isInteracting={isInteracting}
        interactionType={interactionType}
      />

      <PetStats
        happiness={happiness}
        hunger={hunger}
        cleanliness={cleanliness}
        energy={energy}
      />
    </div>
  );
};

export default LivingRoom;