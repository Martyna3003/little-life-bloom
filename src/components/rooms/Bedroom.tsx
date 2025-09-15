import { Button } from "@/components/ui/button";
import PetDisplay from "@/components/PetDisplay";

interface BedroomProps {
  happiness: number;
  hunger: number;
  cleanliness: number;
  energy: number;
  isInteracting: boolean;
  interactionType?: string;
  onSleep: () => void;
  disabled?: boolean;
}

const Bedroom = ({ happiness, hunger, cleanliness, energy, isInteracting, interactionType, onSleep, disabled }: BedroomProps) => {
  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Bedroom</h2>
        <p className="text-muted-foreground text-sm">Let your pet rest and recover energy</p>
      </div>

      <PetDisplay
        happiness={happiness}
        hunger={hunger}
        cleanliness={cleanliness}
        energy={energy}
        isInteracting={isInteracting}
        interactionType={interactionType}
      />

      <div className="bg-gradient-to-br from-pet-tired/20 to-indigo-400/20 rounded-3xl p-6 border-2 border-white/30">
        <h3 className="text-lg font-semibold text-center mb-4">Sleep Station</h3>
        <div className="flex justify-center">
          <Button
            onClick={onSleep}
            disabled={disabled}
            className="h-24 w-24 rounded-full bg-gradient-to-br from-pet-tired to-indigo-400 text-white font-semibold hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl">💤</span>
              <span className="text-sm">Sleep</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Bedroom;