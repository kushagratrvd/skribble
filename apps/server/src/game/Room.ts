import type { Server } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  RoomSettings,
  ChatMessage,
} from '@skribbl/shared';
import { DEFAULT_ROOM_SETTINGS } from '@skribbl/shared';
import { Player } from './Player.js';
import { Game } from './Game.js';
import { nanoid } from 'nanoid';

type TypedIO = Server<ClientToServerEvents, ServerToClientEvents>;

export class Room {
  public id: string;
  public code: string;
  public hostId: string;
  public players: Map<string, Player>;
  public settings: RoomSettings;
  public game: Game | null;
  public io: TypedIO;

  constructor(
    id: string,
    code: string,
    hostId: string,
    settings: Partial<RoomSettings>,
    io: TypedIO
  ) {
    this.id = id;
    this.code = code;
    this.hostId = hostId;
    this.players = new Map();
    this.settings = { ...DEFAULT_ROOM_SETTINGS, ...settings };
    this.game = null;
    this.io = io;
  }

  addPlayer(player: Player): boolean {
    if (this.players.size >= this.settings.maxPlayers) return false;
    this.players.set(player.id, player);
    return true;
  }

  removePlayer(playerId: string): Player | null {
    const player = this.players.get(playerId);
    if (!player) return null;

    this.players.delete(playerId);

    // If host left, assign new host
    if (this.hostId === playerId && this.players.size > 0) {
      const newHost = Array.from(this.players.values())[0];
      this.hostId = newHost.id;
      newHost.isHost = true;
    }

    return player;
  }

  getPlayerBySocketId(socketId: string): Player | null {
    for (const player of this.players.values()) {
      if (player.socketId === socketId) return player;
    }
    return null;
  }

  broadcast(event: string, data: unknown): void {
    this.io.to(this.id).emit(event as keyof ServerToClientEvents, data as never);
  }

  startGame(): void {
    if (this.players.size < 2) return;

    this.game = new Game(this, this.io);
    this.game.start();
  }

  updateSettings(newSettings: Partial<RoomSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  getPlayersData() {
    return Array.from(this.players.values()).map((p) => p.toData());
  }

  addSystemMessage(text: string): ChatMessage {
    const msg: ChatMessage = {
      id: nanoid(8),
      playerId: 'system',
      playerName: 'System',
      text,
      isSystem: true,
      isCorrectGuess: false,
      timestamp: Date.now(),
    };
    if (this.game) {
      this.game.messages.push(msg);
    }
    return msg;
  }

  isEmpty(): boolean {
    return this.players.size === 0;
  }

  cleanup(): void {
    if (this.game) {
      this.game.cleanup();
      this.game = null;
    }
  }
}