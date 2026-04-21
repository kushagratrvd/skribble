import type { Server } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  RoomSettings,
} from '@skribbl/shared';
import { Room } from './Room.js';
import { nanoid } from 'nanoid';

type TypedIO = Server<ClientToServerEvents, ServerToClientEvents>;

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

class RoomManagerClass {
  private rooms: Map<string, Room> = new Map();
  private codeToId: Map<string, string> = new Map();

  createRoom(
    hostId: string,
    settings: Partial<RoomSettings>,
    io: TypedIO
  ): Room {
    const id = nanoid(12);
    let code = generateRoomCode();

    // Ensure unique code
    while (this.codeToId.has(code)) {
      code = generateRoomCode();
    }

    const room = new Room(id, code, hostId, settings, io);
    this.rooms.set(id, room);
    this.codeToId.set(code, id);

    return room;
  }

  getRoom(id: string): Room | null {
    return this.rooms.get(id) || null;
  }

  getRoomByCode(code: string): Room | null {
    const id = this.codeToId.get(code.toUpperCase());
    if (!id) return null;
    return this.rooms.get(id) || null;
  }

  deleteRoom(id: string): void {
    const room = this.rooms.get(id);
    if (room) {
      room.cleanup();
      this.codeToId.delete(room.code);
      this.rooms.delete(id);
    }
  }

  getPublicRooms(): Room[] {
    return Array.from(this.rooms.values()).filter(
      (r) =>
        !r.settings.isPrivate &&
        r.players.size < r.settings.maxPlayers &&
        (!r.game || r.game.phase === 'waiting')
    );
  }

  findRoomBySocketId(socketId: string): { room: Room; player: ReturnType<Room['getPlayerBySocketId']> } | null {
    for (const room of this.rooms.values()) {
      const player = room.getPlayerBySocketId(socketId);
      if (player) return { room, player };
    }
    return null;
  }

  getRoomCount(): number {
    return this.rooms.size;
  }
}

export const RoomManager = new RoomManagerClass();