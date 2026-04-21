import { useGameStore } from '../../store/gameStore';
import { Avatar } from '../lobby/Avatar';

export default function Scoreboard() {
  const players = useGameStore((s) => s.players);

  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-3">
      <h3 className="text-white font-bold text-xl text-center mb-4">
        🏆 Final Scores
      </h3>
      {sorted.map((player, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        const medal = medals[index] || `#${index + 1}`;

        return (
          <div
            key={player.id}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              index === 0
                ? 'bg-accent-yellow/20 border border-accent-yellow/30'
                : index === 1
                ? 'bg-gray-300/10 border border-gray-300/20'
                : index === 2
                ? 'bg-orange-600/20 border border-orange-600/30'
                : 'bg-white/5'
            }`}
          >
            <span className="text-2xl w-10 text-center">{medal}</span>
            <div className="w-10 h-10 relative">
              <Avatar avatar={player.avatar} size={40} />
            </div>
            <span className="text-white font-bold flex-1 text-lg">
              {player.name}
            </span>
            <span className="text-white font-mono font-bold text-xl">
              {player.score}
              <span className="text-white/40 text-sm ml-1">pts</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}