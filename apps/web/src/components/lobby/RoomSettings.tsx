import { useGameStore } from '../../store/gameStore';
import { emitUpdateSettings } from '../../socket/events';
import type { RoomSettings as RoomSettingsType } from '@skribbl/shared';

export default function RoomSettings() {
  const settings = useGameStore((s) => s.settings);
  const myId = useGameStore((s) => s.myId);
  const hostId = useGameStore((s) => s.hostId);
  const isHost = myId === hostId;

  const handleChange = (key: keyof RoomSettingsType, value: number | boolean | string[]) => {
    if (!isHost) return;
    emitUpdateSettings({ [key]: value });
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-white font-bold text-sm uppercase tracking-wider">
        Room Settings
      </h3>

      {/* Max Players */}
      <div>
        <label className="text-white/70 text-sm block mb-1">
          Max Players
        </label>
        <select
          value={settings.maxPlayers}
          onChange={(e) => handleChange('maxPlayers', parseInt(e.target.value))}
          disabled={!isHost}
          className="w-full bg-primary-800 border border-primary-500/50 text-white rounded-lg px-3 py-2 text-sm outline-none disabled:opacity-50"
        >
          {[2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
            <option key={n} value={n}>
              {n} players
            </option>
          ))}
        </select>
      </div>

      {/* Rounds */}
      <div>
        <label className="text-white/70 text-sm block mb-1">Rounds</label>
        <select
          value={settings.totalRounds}
          onChange={(e) => handleChange('totalRounds', parseInt(e.target.value))}
          disabled={!isHost}
          className="w-full bg-primary-800 border border-primary-500/50 text-white rounded-lg px-3 py-2 text-sm outline-none disabled:opacity-50"
        >
          {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'round' : 'rounds'}
            </option>
          ))}
        </select>
      </div>

      {/* Draw Time */}
      <div>
        <label className="text-white/70 text-sm block mb-1">
          Draw Time (seconds)
        </label>
        <select
          value={settings.drawTime}
          onChange={(e) => handleChange('drawTime', parseInt(e.target.value))}
          disabled={!isHost}
          className="w-full bg-primary-800 border border-primary-500/50 text-white rounded-lg px-3 py-2 text-sm outline-none disabled:opacity-50"
        >
          {[30, 45, 60, 80, 100, 120, 150, 180].map((n) => (
            <option key={n} value={n}>
              {n} seconds
            </option>
          ))}
        </select>
      </div>

      {/* Word Count */}
      <div>
        <label className="text-white/70 text-sm block mb-1">
          Word Choices
        </label>
        <select
          value={settings.wordCount}
          onChange={(e) => handleChange('wordCount', parseInt(e.target.value))}
          disabled={!isHost}
          className="w-full bg-primary-800 border border-primary-500/50 text-white rounded-lg px-3 py-2 text-sm outline-none disabled:opacity-50"
        >
          {[2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} words
            </option>
          ))}
        </select>
      </div>

      {/* Hints */}
      <div className="flex items-center gap-3">
        <label className="text-white/70 text-sm">Enable Hints</label>
        <button
          onClick={() => handleChange('hintsEnabled', !settings.hintsEnabled)}
          disabled={!isHost}
          className={`w-12 h-6 rounded-full transition-all relative ${
            settings.hintsEnabled ? 'bg-accent-green' : 'bg-primary-500'
          } disabled:opacity-50`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
              settings.hintsEnabled ? 'left-6' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* Custom Words */}
      <div>
        <label className="text-white/70 text-sm block mb-1">
          Custom Words (comma-separated)
        </label>
        <textarea
          value={settings.customWords.join(', ')}
          onChange={(e) => {
            const words = e.target.value
              .split(',')
              .map((w) => w.trim())
              .filter((w) => w.length > 0);
            handleChange('customWords', words);
          }}
          disabled={!isHost}
          placeholder="Enter custom words..."
          rows={3}
          className="w-full bg-primary-800 border border-primary-500/50 text-white rounded-lg px-3 py-2 text-sm outline-none resize-none disabled:opacity-50 placeholder-gray-400"
        />
      </div>

      {!isHost && (
        <p className="text-white/30 text-xs text-center italic">
          Only the host can change settings
        </p>
      )}
    </div>
  );
}