export interface AvatarState {
  color: number;
  eyes: number;
  mouth: number;
}

export interface PlayerData {
  id: string;
  socketId: string;
  name: string;
  score: number;
  isDrawing: boolean;
  hasGuessed: boolean;
  avatar: AvatarState;
  isHost: boolean;
}


export interface RoomSettings {
  maxPlayers: number;
  totalRounds: number;
  drawTime: number;
  wordCount: number;
  hintsEnabled: boolean;
  customWords: string[];
  isPrivate: boolean;
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  maxPlayers: 8,
  totalRounds: 3,
  drawTime: 80,
  wordCount: 3,
  hintsEnabled: true,
  customWords: [],
  isPrivate: false,
};

export type GamePhase =
  | 'waiting'
  | 'choosing'
  | 'drawing'
  | 'round_end'
  | 'game_over';

export interface GameStateData {
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
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  isSystem: boolean;
  isCorrectGuess: boolean;
  timestamp: number;
}

export interface DrawPoint {
  x: number;
  y: number;
}

export interface DrawStroke {
  points: DrawPoint[];
  color: string;
  size: number;
  tool: 'brush' | 'eraser';
}

export interface DrawStartPayload {
  x: number;
  y: number;
  color: string;
  size: number;
  tool: 'brush' | 'eraser';
}

export interface DrawMovePayload {
  x: number;
  y: number;
}

export interface RoundEndData {
  word: string;
  scores: Record<string, number>;
  players: PlayerData[];
}

export interface GameOverData {
  winner: PlayerData;
  leaderboard: PlayerData[];
}

export interface PublicRoomData {
  code: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  status: 'waiting' | 'playing';
  rounds: number;
  drawTime: number;
}

export interface GlobalLeaderboardEntry {
  playerName: string;
  totalWins: number;
  totalScore: number;
  gamesPlayed: number;
}

// ─── Socket Event Interfaces ────────────────────────────────

export interface ServerToClientEvents {
  room_created: (data: { roomId: string; code: string }) => void;
  room_joined: (data: {
    roomId: string;
    code: string;
    players: PlayerData[];
    settings: RoomSettings;
    hostId: string;
  }) => void;
  player_joined: (data: { player: PlayerData }) => void;
  player_left: (data: { playerId: string; newHostId: string | null }) => void;
  settings_updated: (data: { settings: RoomSettings }) => void;

  game_starting: (data: { countdown: number }) => void;
  choose_word: (data: { words: string[]; drawTime: number }) => void;
  round_start: (data: {
    drawerId: string;
    drawerName: string;
    round: number;
    totalRounds: number;
    turnIndex: number;
    totalTurns: number;
    hints: string;
    drawTime: number;
  }) => void;
  timer_tick: (data: { timeLeft: number }) => void;
  hint_reveal: (data: { hints: string }) => void;
  round_end: (data: RoundEndData) => void;
  game_over: (data: GameOverData) => void;
  game_state: (data: GameStateData & { players: PlayerData[]; settings: RoomSettings; hostId: string; messages: ChatMessage[]; strokes: DrawStroke[] }) => void;

  draw_start: (data: DrawStartPayload) => void;
  draw_move: (data: DrawMovePayload) => void;
  draw_end: () => void;
  canvas_clear: () => void;
  draw_undo: (data: { strokes: DrawStroke[] }) => void;

  chat_message: (data: ChatMessage) => void;
  guess_result: (data: {
    correct: boolean;
    playerId: string;
    playerName: string;
    points: number;
  }) => void;

  error_message: (data: { message: string }) => void;
  public_rooms_list: (data: { rooms: PublicRoomData[] }) => void;
  leaderboard_data: (data: { leaderboard: GlobalLeaderboardEntry[] }) => void;
  kicked_from_room: () => void;
}

export interface ClientToServerEvents {
  create_room: (data: {
    playerName: string;
    avatar: AvatarState;
    settings: Partial<RoomSettings>;
  }) => void;
  join_room: (data: {
    code: string;
    playerName: string;
    avatar: AvatarState;
  }) => void;
  leave_room: () => void;
  update_settings: (data: { settings: Partial<RoomSettings> }) => void;
  start_game: () => void;

  word_chosen: (data: { word: string }) => void;

  draw_start: (data: DrawStartPayload) => void;
  draw_move: (data: DrawMovePayload) => void;
  draw_end: () => void;
  canvas_clear: () => void;
  draw_undo: () => void;

  guess: (data: { text: string }) => void;
  chat: (data: { text: string }) => void;

  request_game_state: () => void;
  list_rooms: () => void;
  get_leaderboard: () => void;
  kick_player: (data: { playerId: string }) => void;
}