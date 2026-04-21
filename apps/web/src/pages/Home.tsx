import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { emitCreateRoom, emitJoinRoom, emitListRooms, emitGetLeaderboard } from '../socket/events';
import { usePlayerStore } from '../store/playerStore';
import AvatarCustomizer from '../components/lobby/AvatarCustomizer';
import AvatarRow from '../components/lobby/AvatarRow';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import logo from '../assets/main-logo.gif';
import type { PublicRoomData, GlobalLeaderboardEntry } from '@skribbl/shared';

export default function Home() {
  const socket = useSocket();

  const { savedName, savedAvatar, setSavedName, setSavedAvatar } =
    usePlayerStore();

  const [name, setName] = useState(savedName);
  const [avatar, setAvatar] = useState(savedAvatar);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Tabs for the right panel
  const [activeTab, setActiveTab] = useState<'rooms' | 'leaderboard'>('rooms');
  
  // Public Rooms State
  const [publicRooms, setPublicRooms] = useState<PublicRoomData[]>([]);
  const [leaderboard, setLeaderboard] = useState<GlobalLeaderboardEntry[]>([]);
  const [isPrivateCreate, setIsPrivateCreate] = useState(true);

  useEffect(() => {
    if (!socket) return;
    
    // Listen for room list
    const handlePublicRooms = (data: { rooms: PublicRoomData[] }) => {
      setPublicRooms(data.rooms);
    };
    
    // Listen for leaderboard data
    const handleLeaderboard = (data: { leaderboard: GlobalLeaderboardEntry[] }) => {
      setLeaderboard(data.leaderboard);
    };
    
    socket.on('public_rooms_list', handlePublicRooms);
    socket.on('leaderboard_data', handleLeaderboard);
    
    // Fetch initial data
    let interval: any;
    const fetchData = () => {
      emitListRooms();
      emitGetLeaderboard();
    };

    if (socket.connected) {
      fetchData();
      interval = setInterval(fetchData, 3000);
    } else {
      socket.on('connect', () => {
        fetchData();
        interval = setInterval(fetchData, 3000);
      });
    }

    return () => {
      socket.off('public_rooms_list', handlePublicRooms);
      socket.off('leaderboard_data', handleLeaderboard);
      socket.off('connect');
      if (interval) clearInterval(interval);
    };
  }, [socket]);

  const handlePlay = () => {
    if (!name.trim()) return;
    setSavedName(name.trim());
    setSavedAvatar(avatar);
    
    // Join a random public room if available
    const availableRooms = publicRooms.filter(r => r.playerCount < r.maxPlayers);
    if (availableRooms.length > 0) {
      const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
      emitJoinRoom(randomRoom.code, name.trim(), avatar);
    } else {
      // Create a public room if none available
      emitCreateRoom(name.trim(), avatar, { isPrivate: false });
    }
  };

  const handleCreateRoom = () => {
    if (!name.trim()) return;
    setSavedName(name.trim());
    setSavedAvatar(avatar);
    setShowCreateModal(false);
    emitCreateRoom(name.trim(), avatar, { isPrivate: isPrivateCreate });
  };

  const handleJoin = () => {
    if (!name.trim() || !joinCode.trim()) return;
    setSavedName(name.trim());
    setSavedAvatar(avatar);
    setShowJoinModal(false);
    emitJoinRoom(joinCode.trim(), name.trim(), avatar);
  };

  const handleJoinSpecificRoom = (code: string) => {
    if (!name.trim()) {
      alert("Please enter a name first!");
      return;
    }
    setSavedName(name.trim());
    setSavedAvatar(avatar);
    emitJoinRoom(code, name.trim(), avatar);
  };

  return (
    <div id="home" className="min-h-screen flex flex-col xl:flex-row items-center justify-center p-4 gap-8">
      
      {/* Left Column: Avatar & Logo */}
      <div className="flex flex-col items-center">
        {/* Logo + Avatar Row */}
        <div className="text-center mt-6 mb-10">
          <img
            src={logo}
            alt="skribbl.io"
            className="h-auto mx-auto mb-2 crisp"
            style={{ filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,0.25))' }}
          />
          <AvatarRow count={8} size={48} />
        </div>

        {/* Main Panel */}
        <div className="card w-full max-w-[400px] p-4">
          {/* Name Input */}
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={20}
            style={{ height: '34px', fontWeight: 700 }}
          />

          {/* Avatar Customizer */}
          <AvatarCustomizer avatar={avatar} onChange={setAvatar} />

          {/* Play Button */}
          <Button
            onClick={handlePlay}
            disabled={!name.trim()}
            className="w-full text-2xl"
            size="lg"
            style={{ height: '54px' }}
          >
            Play!
          </Button>

          {/* Create Room */}
          <Button
            variant="secondary"
            onClick={() => setShowCreateModal(true)}
            disabled={!name.trim()}
            className="w-full text-lg mt-2.5"
            style={{ height: '40px' }}
          >
            Create Room
          </Button>

          {/* Join Room */}
          <Button
            variant="ghost"
            onClick={() => setShowJoinModal(true)}
            disabled={!name.trim()}
            className="w-full text-lg mt-2.5"
            style={{ height: '40px' }}
          >
            🔗 Join Room
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-center mt-6" style={{ color: '#677af9' }}>
          Built with React, Socket.IO, and TypeScript
        </p>
      </div>

      {/* Right Column: Public Rooms & Leaderboard Tabs */}
      <div className="w-full max-w-[450px] shrink-0 self-stretch xl:self-center mt-8 xl:mt-0">
        <div className="card p-0 h-full min-h-[450px] max-h-[600px] flex flex-col overflow-hidden" style={{
          backgroundColor: 'rgba(12, 44, 150, 0.75)',
          backdropFilter: 'blur(4px)',
          borderRadius: '10px',
        }}>
          {/* Tab Header */}
          <div className="flex bg-black/20 border-b border-white/10">
            <button 
              onClick={() => setActiveTab('rooms')}
              className={`flex-1 py-3 font-extrabold transition-all ${activeTab === 'rooms' ? 'text-white bg-white/10' : 'text-white/40 hover:text-white/60'}`}
              style={{ fontSize: '1.1em' }}
            >
              Public Rooms
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 py-3 font-extrabold transition-all ${activeTab === 'leaderboard' ? 'text-white bg-white/10' : 'text-white/40 hover:text-white/60'}`}
              style={{ fontSize: '1.1em' }}
            >
              🏆 Hall of Fame
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {activeTab === 'rooms' ? (
              publicRooms.length === 0 ? (
                <div className="text-center text-white/50 py-12 font-bold">
                  No public rooms found.<br/>Be the first to create one!
                </div>
              ) : (
                publicRooms.map((room, idx) => (
                  <div 
                    key={room.code} 
                    className="flex items-center justify-between p-3 rounded shadow-sm"
                    style={{ 
                      backgroundColor: idx % 2 === 0 ? '#fff' : '#ececec',
                      border: '2px solid rgba(0,0,0,0.1)' 
                    }}
                  >
                    <div className="flex flex-col min-w-0">
                       <span className="font-bold text-gray-900 truncate" style={{ fontSize: '1.1em' }}>
                         {room.hostName}'s Room
                       </span>
                       <span className="text-xs text-gray-600 font-bold">
                         {room.rounds} Rounds • {room.drawTime}s Draw
                       </span>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <span 
                        className="font-bold text-sm px-2 py-0.5 rounded backdrop-blur-sm"
                        style={{ 
                          backgroundColor: room.playerCount >= room.maxPlayers ? '#ffcccc' : '#ccffcc',
                          color: room.playerCount >= room.maxPlayers ? '#cc0000' : '#006600',
                          border: '1px solid rgba(0,0,0,0.1)'
                        }}
                      >
                        {room.playerCount} / {room.maxPlayers}
                      </span>
                      <Button 
                        onClick={() => handleJoinSpecificRoom(room.code)}
                        disabled={room.playerCount >= room.maxPlayers || !name.trim()}
                        className="text-sm px-4"
                        style={{ height: '32px' }}
                      >
                        Join
                      </Button>
                    </div>
                  </div>
                ))
              )
            ) : (
              leaderboard.length === 0 ? (
                <div className="text-center text-white/50 py-12 font-bold">
                  No heroes recorded yet.<br/>Win a game to claim your spot!
                </div>
              ) : (
                leaderboard.map((entry, idx) => (
                  <div 
                    key={entry.playerName} 
                    className="flex items-center gap-4 p-3 rounded shadow-sm"
                    style={{ 
                      backgroundColor: idx % 2 === 0 ? '#fff' : '#ececec',
                      border: idx === 0 ? '2px solid #ffd700' : '2px solid rgba(0,0,0,0.1)'
                    }}
                  >
                    <span className="w-8 text-2xl text-center">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate" style={{ fontSize: '1.1em' }}>
                        {entry.playerName}
                      </p>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">
                        {entry.totalWins} Wins • {entry.gamesPlayed} Matches
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="font-mono font-bold text-lg text-primary-600">
                         {entry.totalScore.toLocaleString()}
                       </p>
                       <p className="text-[10px] font-extrabold text-gray-400 -mt-1 uppercase">Total Pts</p>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>

      {/* Join Room Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Join a Room"
      >
        <div className="space-y-4">
          <Input
            label="Room Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter room code..."
            maxLength={6}
          />
          <Button
            onClick={handleJoin}
            disabled={!joinCode.trim()}
            className="w-full"
          >
            Join Room
          </Button>
        </div>
      </Modal>

      {/* Create Private Room Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Room"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <span className="text-white font-bold">Room Visibility</span>
            <div className="flex gap-2 bg-white/10 p-1 rounded-lg border border-white/5">
              <button
                className={`px-3 py-1 text-sm font-bold rounded ${isPrivateCreate ? 'bg-primary-500 text-white shadow' : 'text-white/50 hover:text-white'}`}
                onClick={() => setIsPrivateCreate(true)}
              >
                Private
              </button>
              <button
                className={`px-3 py-1 text-sm font-bold rounded ${!isPrivateCreate ? 'bg-accent-green text-white shadow' : 'text-white/50 hover:text-white'}`}
                onClick={() => setIsPrivateCreate(false)}
              >
                Public
              </button>
            </div>
          </div>
          
          <p className="text-white/70 text-sm text-center">
            {isPrivateCreate 
              ? "Create a private room and share the code with your friends!"
              : "Create a public room that anyone can join from the home page!"}
          </p>
          <Button onClick={handleCreateRoom} className="w-full">
            Create Room
          </Button>
        </div>
      </Modal>
    </div>
  );
}