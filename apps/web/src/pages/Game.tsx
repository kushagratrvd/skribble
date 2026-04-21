import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';
import { emitStartGame } from '../socket/events';
import DrawingCanvas from '../components/canvas/DrawingCanvas';
import PlayerList from '../components/lobby/PlayerList';
import ChatBox from '../components/chat/ChatBox';
import GuessInput from '../components/chat/GuessInput';
import WordDisplay from '../components/game/WordDisplay';
import Timer from '../components/game/Timer';
import WordPicker from '../components/game/WordPicker';
import Scoreboard from '../components/game/Scoreboard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

import settingsGif from '../assets/settings.gif';

export default function Game() {
  useSocket();
  const navigate = useNavigate();

  const phase = useGameStore((s) => s.phase);
  const round = useGameStore((s) => s.round);
  const totalRounds = useGameStore((s) => s.totalRounds);
  const drawerId = useGameStore((s) => s.drawerId);
  const drawerName = useGameStore((s) => s.drawerName);
  const myId = useGameStore((s) => s.myId);
  const hostId = useGameStore((s) => s.hostId);
  const roomCode = useGameStore((s) => s.roomCode);
  const roundEndWord = useGameStore((s) => s.roundEndWord);
  const players = useGameStore((s) => s.players);

  const isDrawer = myId === drawerId;
  const isHost = myId === hostId;

  useEffect(() => {
    if (!roomCode) {
      navigate('/');
    }
  }, [roomCode, navigate]);

  const handlePlayAgain = () => {
    useGameStore.getState().resetGame();
    emitStartGame();
  };

  const handleBackToLobby = () => {
    useGameStore.getState().resetGame();
    navigate(`/lobby/${roomCode}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Word Picker Overlay */}
      <WordPicker />

      {/* Round End Modal */}
      <Modal
        isOpen={phase === 'round_end'}
        closeable={false}
        title="⏰ Round Over!"
      >
        <div className="text-center space-y-4">
          <p className="text-white/70">The word was:</p>
          <p className="text-3xl font-bold text-accent-yellow">
            {roundEndWord}
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {[...players]
              .sort((a, b) => b.score - a.score)
              .map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2"
                >
                  <span className="text-white font-medium">{p.name}</span>
                  <span className="text-accent-green font-mono font-bold">
                    {p.score} pts
                  </span>
                </div>
              ))}
          </div>
          <p className="text-white/30 text-sm animate-pulse">
            Next round starting soon...
          </p>
        </div>
      </Modal>

      {/* Game Over Modal */}
      <Modal
        isOpen={phase === 'game_over'}
        closeable={false}
        title="🎉 Game Over!"
      >
        <div className="space-y-4">
          <Scoreboard />
          <div className="flex gap-3 mt-6">
            {isHost && (
              <Button 
                onClick={handlePlayAgain} 
                className="flex-1"
                disabled={players.length < 2}
              >
                {players.length < 2 ? 'Waiting for players...' : '🔄 Play Again'}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleBackToLobby}
              className="flex-1"
            >
              ← Back to Lobby
            </Button>
          </div>
          {!isHost && (
            <p className="text-white/30 text-xs text-center">
              Waiting for host to start a new game...
            </p>
          )}
        </div>
      </Modal>

      {/* Top Bar (Matches original Skribbl.io UI) */}
      <div 
        className="bg-white rounded-t-sm flex items-center justify-between shadow-sm relative z-10" 
        style={{ 
          maxWidth: '800px', 
          width: '100%',
          margin: '16px auto 0', 
          height: '64px',
          border: '2px solid rgba(0,0,0,0.1)'
        }}
      >
        {/* Left Side: Clock and Round Text */}
        <div className="flex items-center gap-2 h-full absolute left-0" style={{ transform: 'translateX(-28px)' }}>
          <Timer />
          <span className="font-bold text-black" style={{ fontSize: '1.4em', marginLeft: '-10px' }}>
            Round {round} of {totalRounds}
          </span>
        </div>

        {/* Center: Word Display */}
        <div className="flex flex-col justify-center items-center flex-1 h-full pt-1">
          <span 
            className="text-black font-bold uppercase tracking-widest" 
            style={{ fontSize: '0.7em', marginBottom: '-2px' }}
          >
            {isDrawer ? 'DRAW THIS' : 'GUESS THIS'}
          </span>
          <WordDisplay />
        </div>

        {/* Right Side: Settings Gear */}
        <div className="absolute right-2 top-0 h-full flex items-center">
          <img 
            src={settingsGif} 
            alt="Settings" 
            className="w-8 h-8 crisp cursor-pointer hover:scale-110 transition-transform" 
            title="Room Settings (Host only)"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="max-w-7xl mx-auto w-full flex gap-4 p-4">
          {/* Left Sidebar — Player List */}
          <div className="w-56 flex-shrink-0 card overflow-y-auto max-h-[calc(100vh-140px)]">
            <PlayerList compact />
          </div>

          {/* Center — Canvas */}
          <div className="flex-1 flex items-start justify-center">
            <DrawingCanvas isDrawer={isDrawer && phase === 'drawing'} />
          </div>

          {/* Right Sidebar — Chat */}
          <div className="w-72 flex-shrink-0 card flex flex-col max-h-[calc(100vh-140px)]">
            <div className="p-3 border-b border-white/10">
              <h3 className="text-white font-bold text-sm">💬 Chat</h3>
            </div>
            <ChatBox />
            <GuessInput />
          </div>
        </div>
      </div>
    </div>
  );
}