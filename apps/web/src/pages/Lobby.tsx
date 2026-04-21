import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGameStore } from '../store/gameStore';
import { useSocket } from '../hooks/useSocket';
import { emitStartGame } from '../socket/events';
import { copyToClipboard } from '../lib/utils';
import PlayerList from '../components/lobby/PlayerList';
import RoomSettings from '../components/lobby/RoomSettings';
import ChatBox from '../components/chat/ChatBox';
import GuessInput from '../components/chat/GuessInput';
import Button from '../components/ui/Button';

export default function Lobby() {
  useSocket();
  const navigate = useNavigate();
  const { roomCode } = useParams<{ roomCode: string }>();

  const storeRoomCode = useGameStore((s) => s.roomCode);
  const players = useGameStore((s) => s.players);
  const myId = useGameStore((s) => s.myId);
  const hostId = useGameStore((s) => s.hostId);
  const phase = useGameStore((s) => s.phase);

  const isHost = myId === hostId;

  useEffect(() => {
    if (!storeRoomCode && !roomCode) {
      navigate('/');
    }
  }, [storeRoomCode, roomCode, navigate]);

  useEffect(() => {
    if (phase === 'choosing' || phase === 'drawing') {
      navigate(`/game/${storeRoomCode || roomCode}`);
    }
  }, [phase, navigate, storeRoomCode, roomCode]);

  const handleCopyCode = () => {
    const code = storeRoomCode || roomCode || '';
    const link = `${window.location.origin}/?join=${code}`;
    copyToClipboard(link).then(() => {
      toast.success('Invite link copied to clipboard!');
    });
  };

  const handleStart = () => {
    if (players.length < 2) {
      toast.error('Need at least 2 players to start!');
      return;
    }
    emitStartGame();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">Game Lobby</h1>
          <div className="flex items-center justify-center gap-3">
            <span className="text-white/50">Room Code:</span>
            <span className="font-mono text-2xl font-bold text-accent-yellow tracking-widest">
              {storeRoomCode || roomCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="text-accent-blue hover:text-blue-400 text-sm underline"
            >
              📋 Copy Link
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Player List */}
          <div className="card overflow-hidden">
            <PlayerList />
          </div>

          {/* Settings */}
          <div className="card overflow-hidden">
            <RoomSettings />
          </div>

          {/* Chat */}
          <div className="card flex flex-col h-80 md:h-auto overflow-hidden">
            <div className="p-3 border-b border-white/10">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                Chat
              </h3>
            </div>
            <ChatBox />
            <GuessInput />
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center mt-6">
          {isHost ? (
            <Button
              onClick={handleStart}
              disabled={players.length < 2}
              size="lg"
            >
              🚀 Start Game! ({players.length} players)
            </Button>
          ) : (
            <p className="text-white/50 text-lg animate-pulse">
              Waiting for host to start the game...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}