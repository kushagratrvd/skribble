import { useState, useRef } from 'react';
import { emitGuess } from '../../socket/events';
import { useGameStore } from '../../store/gameStore';

export default function GuessInput() {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const phase = useGameStore((s) => s.phase);
  const myId = useGameStore((s) => s.myId);
  const drawerId = useGameStore((s) => s.drawerId);
  const players = useGameStore((s) => s.players);

  const myPlayer = players.find((p) => p.id === myId);
  const isDrawer = myId === drawerId;
  const hasGuessed = myPlayer?.hasGuessed || false;
  const isDisabled =
    isDrawer || hasGuessed || phase !== 'drawing';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isDisabled) return;

    emitGuess(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  let placeholder = 'Type your guess...';
  if (isDrawer) placeholder = "You're drawing!";
  if (hasGuessed) placeholder = 'You already guessed correctly!';
  if (phase !== 'drawing') placeholder = 'Waiting for next round...';

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-white/10">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={isDisabled}
          className="flex-1 bg-primary-800 border border-primary-500/50 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-accent-blue disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-400"
          maxLength={100}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isDisabled || !text.trim()}
          className="bg-accent-blue hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </form>
  );
}