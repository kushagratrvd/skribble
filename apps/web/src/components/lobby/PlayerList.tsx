import { useGameStore } from '../../store/gameStore';
import { Avatar } from './Avatar';
import crownIcon from '../../assets/crown.gif';

interface PlayerListProps {
  compact?: boolean;
}

export default function PlayerList({ compact = false }: PlayerListProps) {
  const players = useGameStore((s) => s.players);
  const hostId = useGameStore((s) => s.hostId);
  const drawerId = useGameStore((s) => s.drawerId);
  const myId = useGameStore((s) => s.myId);
  const phase = useGameStore((s) => s.phase);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className={compact ? '' : ''} style={{ borderRadius: '3px', overflow: 'hidden' }}>
      {sortedPlayers.map((player, index) => (
        <div
          key={player.id}
          className="group flex items-center relative cursor-pointer"
          style={{
            height: '48px',
            backgroundColor: player.hasGuessed && phase === 'drawing'
              ? (index % 2 === 0 ? '#5bdd4a' : '#48c737')
              : (index % 2 === 0 ? '#fff' : '#ececec'),
            color: '#000',
          }}
        >
          {/* Rank */}
          <span
            className="font-bold text-sm absolute left-1.5 top-1"
            style={{ fontSize: '1.1em' }}
          >
            #{index + 1}
          </span>

          {/* Player Info (centered) */}
          <div className="flex-1 text-center flex flex-col justify-center">
            <span
              className="font-bold text-sm truncate"
              style={{
                color: player.id === myId
                  ? (player.hasGuessed ? '#0048b5' : '#4998ff')
                  : '#000',
              }}
            >
              {player.name}
              {player.id === myId ? ' (You)' : ''}
            </span>
            <span className="text-xs" style={{ fontSize: '0.9em' }}>
              {player.score} points
            </span>
          </div>

          {/* Action Zone (Left Side - Under Rank) */}
          <div className="absolute left-1 top-[22px] flex flex-col items-center gap-1 z-10">
            {/* Kick Button (only visible to host, for other players) */}
            {myId === hostId && player.id !== myId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  import('../../socket/events').then((m) => m.emitKickPlayer(player.id));
                }}
                className="text-red-700 hover:text-red-900 bg-red-100 hover:bg-red-200 rounded-full w-5 h-5 flex items-center justify-center font-bold border border-red-300 shadow-sm transition-colors"
                title="Kick Player"
                style={{ fontSize: '11px', lineHeight: '10px', paddingBottom: '2px' }}
              >
                x
              </button>
            )}
          </div>

          {/* Avatar Area */}
          <div className="absolute right-0 top-0 w-12 h-12 flex-shrink-0 flex items-center" style={{ transition: 'transform 0.1s ease-in-out' }}>
            <Avatar avatar={player.avatar} size={48} />
            {/* Crown for host */}
            {player.id === hostId && (
              <img
                src={crownIcon}
                alt="Host"
                className="absolute crisp"
                style={{
                  width: '50%',
                  height: '50%',
                  left: '-5%',
                  top: '-22%',
                  zIndex: 2,
                }}
              />
            )}
            {/* Drawing indicator */}
            {player.isDrawing && (
              <span
                className="absolute text-lg"
                style={{
                  right: '30px',
                  top: '3px',
                  zIndex: 2,
                  animation: 'iconDrawing 1s ease infinite',
                }}
              >
                ✏️
              </span>
            )}
          </div>
        </div>
      ))}

      <style>{`
        @keyframes iconDrawing {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
      `}</style>
    </div>
  );
}