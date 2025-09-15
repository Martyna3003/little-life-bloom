import { Coins } from "lucide-react";

interface CoinDisplayProps {
  coins: number;
  recentEarning?: number;
}

const CoinDisplay = ({ coins, recentEarning }: CoinDisplayProps) => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full px-6 py-3 border-4 border-white/30 shadow-lg">
        <div className="flex items-center gap-2 text-white">
          <Coins className="w-6 h-6 animate-float" />
          <span className="text-2xl font-bold">{coins}</span>
          {recentEarning && recentEarning > 0 && (
            <span className="text-sm bg-white/20 rounded-full px-2 py-1 animate-bounce-gentle">
              +{recentEarning}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoinDisplay;