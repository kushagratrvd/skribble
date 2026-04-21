import { create } from 'zustand';
import type {
  PlayerData,
  RoomSettings,
  GamePhase,
  ChatMessage,
  DrawStroke,
  AvatarState,
} from '@skribbl/shared';
import { DEFAULT_ROOM_SETTINGS } from '@skribbl/shared';

interface GameStore {
  // Connection
  connected: boolean;
  setConnected: (connected: boolean) => void;

  // Player
  myId: string;
  myName: string;
  myAvatar: AvatarState;
  setMyInfo: (id: string, name: string, avatar: AvatarState) => void;

  // Room
  roomId: string;
  roomCode: string;
  players: PlayerData[];
  settings: RoomSettings;
  hostId: string;
  setRoom: (roomId: string, code: string, players: PlayerData[], settings: RoomSettings, hostId: string) => void;
  updatePlayers: (players: PlayerData[]) => void;
  addPlayer: (player: PlayerData) => void;
  removePlayer: (playerId: string, newHostId: string | null) => void;
  updateSettings: (settings: RoomSettings) => void;

  // Game
  phase: GamePhase;
  round: number;
  totalRounds: number;
  drawerId: string;
  drawerName: string;
  currentWord: string;
  hints: string;
  timeLeft: number;
  turnIndex: number;
  totalTurns: number;
  wordOptions: string[];
  roundEndWord: string;

  setPhase: (phase: GamePhase) => void;
  setGameState: (state: {
    phase: GamePhase;
    round: number;
    totalRounds: number;
    drawerId: string;
    drawerName: string;
    hints: string;
    timeLeft: number;
    turnIndex: number;
    totalTurns: number;
  }) => void;
  setTimeLeft: (time: number) => void;
  setHints: (hints: string) => void;
  setWordOptions: (words: string[]) => void;
  setCurrentWord: (word: string) => void;
  setRoundEndWord: (word: string) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;

  // Drawing
  strokes: DrawStroke[];
  setStrokes: (strokes: DrawStroke[]) => void;

  // Computed
  isHost: () => boolean;
  isDrawer: () => boolean;
  getMyPlayer: () => PlayerData | undefined;

  // Reset
  resetGame: () => void;
  resetAll: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Connection
  connected: false,
  setConnected: (connected) => set({ connected }),

  // Player
  myId: '',
  myName: '',
  myAvatar: { color: 0, eyes: 0, mouth: 0 },
  setMyInfo: (id, name, avatar) => set({ myId: id, myName: name, myAvatar: avatar }),

  // Room
  roomId: '',
  roomCode: '',
  players: [],
  settings: DEFAULT_ROOM_SETTINGS,
  hostId: '',
  setRoom: (roomId, code, players, settings, hostId) =>
    set({ roomId, roomCode: code, players, settings, hostId }),
  updatePlayers: (players) => set({ players }),
  addPlayer: (player) =>
    set((state) => ({
      players: [...state.players.filter((p) => p.id !== player.id), player],
    })),
  removePlayer: (playerId, newHostId) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
      hostId: newHostId || state.hostId,
    })),
  updateSettings: (settings) => set({ settings }),

  // Game
  phase: 'waiting',
  round: 0,
  totalRounds: 3,
  drawerId: '',
  drawerName: '',
  currentWord: '',
  hints: '',
  timeLeft: 0,
  turnIndex: 0,
  totalTurns: 0,
  wordOptions: [],
  roundEndWord: '',

  setPhase: (phase) => set({ phase }),
  setGameState: (state) =>
    set({
      phase: state.phase,
      round: state.round,
      totalRounds: state.totalRounds,
      drawerId: state.drawerId,
      drawerName: state.drawerName,
      hints: state.hints,
      timeLeft: state.timeLeft,
      turnIndex: state.turnIndex,
      totalTurns: state.totalTurns,
    }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setHints: (hints) => set({ hints }),
  setWordOptions: (words) => set({ wordOptions: words }),
  setCurrentWord: (word) => set({ currentWord: word }),
  setRoundEndWord: (word) => set({ roundEndWord: word }),

  // Chat
  messages: [],
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
  setMessages: (msgs) => set({ messages: msgs }),

  // Drawing
  strokes: [],
  setStrokes: (strokes) => set({ strokes }),

  // Computed
  isHost: () => get().myId === get().hostId,
  isDrawer: () => get().myId === get().drawerId,
  getMyPlayer: () => get().players.find((p) => p.id === get().myId),

  // Reset
  resetGame: () =>
    set({
      phase: 'waiting',
      round: 0,
      drawerId: '',
      drawerName: '',
      currentWord: '',
      hints: '',
      timeLeft: 0,
      turnIndex: 0,
      totalTurns: 0,
      wordOptions: [],
      roundEndWord: '',
      messages: [],
      strokes: [],
    }),
  resetAll: () =>
    set({
      connected: false,
      myId: '',
      myName: '',
      myAvatar: { color: 0, eyes: 0, mouth: 0 },
      roomId: '',
      roomCode: '',
      players: [],
      settings: DEFAULT_ROOM_SETTINGS,
      hostId: '',
      phase: 'waiting',
      round: 0,
      totalRounds: 3,
      drawerId: '',
      drawerName: '',
      currentWord: '',
      hints: '',
      timeLeft: 0,
      turnIndex: 0,
      totalTurns: 0,
      wordOptions: [],
      roundEndWord: '',
      messages: [],
      strokes: [],
    }),
}));