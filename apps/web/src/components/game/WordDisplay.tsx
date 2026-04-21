import { useGameStore } from '../../store/gameStore';

export default function WordDisplay() {
  const hints = useGameStore((s) => s.hints);
  const phase = useGameStore((s) => s.phase);
  const currentWord = useGameStore((s) => s.currentWord);
  const myId = useGameStore((s) => s.myId);
  const drawerId = useGameStore((s) => s.drawerId);

  const isDrawer = myId === drawerId;

  if (phase === 'waiting' || phase === 'game_over') return null;

  const displayText = isDrawer && currentWord ? currentWord : hints;

  if (!displayText) {
    return (
      <div className="text-white/50 text-lg font-mono animate-pulse">
        Waiting...
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1">
      {displayText.split('').map((char, i) => {
        if (char === ' ') {
          return <span key={i} className="w-4" />;
        }
        if (char === '_') {
          return (
            <span
              key={i}
              className="text-black font-mono font-bold"
              style={{ fontSize: '24px', lineHeight: '24px', letterSpacing: '4px' }}
            >
              _
            </span>
          );
        }
        return (
          <span
            key={i}
            className="text-black font-mono font-bold"
            style={{ fontSize: '24px', lineHeight: '24px', letterSpacing: '4px' }}
          >
            {char}
          </span>
        );
      })}
      {/* Word length indicator */}
      {hints && (
        <span className="ml-1 text-gray-500 text-sm font-bold" style={{ transform: 'translateY(-2px)' }}>
          {hints.replace(/ /g, '').length}
        </span>
      )}
    </div>
  );
}