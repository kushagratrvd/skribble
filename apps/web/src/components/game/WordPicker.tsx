import { useGameStore } from '../../store/gameStore';
import { emitWordChosen } from '../../socket/events';

export default function WordPicker() {
  const wordOptions = useGameStore((s) => s.wordOptions);
  const phase = useGameStore((s) => s.phase);
  const myId = useGameStore((s) => s.myId);
  const drawerId = useGameStore((s) => s.drawerId);

  const isDrawer = myId === drawerId;
  const isVisible = phase === 'choosing' && isDrawer && wordOptions.length > 0;

  if (!isVisible) return null;

  const handlePick = (word: string) => {
    emitWordChosen(word);
    useGameStore.getState().setWordOptions([]);
    useGameStore.getState().setCurrentWord(word);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-primary-700 border border-primary-500/50 rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 animate-bounce-in">
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          ✏️ Choose a Word!
        </h2>
        <p className="text-white/50 text-sm text-center mb-6">
          Pick a word to draw for the other players
        </p>
        <div className="flex flex-col gap-3">
          {wordOptions.map((word) => (
            <button
              key={word}
              onClick={() => handlePick(word)}
              className="w-full py-4 px-6 bg-primary-600 hover:bg-accent-blue text-white text-xl font-bold rounded-xl border border-primary-500/50 hover:border-accent-blue transition-all transform hover:scale-105 active:scale-95"
            >
              {word}
            </button>
          ))}
        </div>
        <p className="text-white/30 text-xs text-center mt-4">
          A word will be auto-selected if you don&apos;t choose in time
        </p>
      </div>
    </div>
  );
}