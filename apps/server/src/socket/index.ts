import type { Server } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents } from '@skribbl/shared';
import { registerRoomHandlers } from './handlers/room.handler.js';
import { registerGameHandlers } from './handlers/game.handler.js';
import { registerDrawHandlers } from './handlers/draw.handler.js';
import { registerChatHandlers } from './handlers/chat.handler.js';
import { RoomManager } from '../game/RoomManager.js';

type TypedIO = Server<ClientToServerEvents, ServerToClientEvents>;

export function registerSocketHandlers(io: TypedIO): void {
  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
    registerDrawHandlers(io, socket);
    registerChatHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);

      const found = RoomManager.findRoomBySocketId(socket.id);
      if (!found || !found.player) return;

      const { room, player } = found;
      const removedPlayer = room.removePlayer(player.id);

      if (room.isEmpty()) {
        RoomManager.deleteRoom(room.id);
        console.log(`[Room] Deleted empty room: ${room.code}`);
        return;
      }

      if (removedPlayer) {
        const systemMsg = room.addSystemMessage(
          `${removedPlayer.name} left the game`
        );
        io.to(room.id).emit('chat_message', systemMsg);
        io.to(room.id).emit('player_left', {
          playerId: removedPlayer.id,
          newHostId:
            room.hostId !== removedPlayer.id ? null : room.hostId,
        });
      }

      // If the disconnected player was the current drawer, end the turn
      if (
        room.game &&
        room.game.phase === 'drawing' &&
        player.isDrawing
      ) {
        room.game.endTurn();
      }

      // If only one player left, end the game
      if (room.game && room.players.size < 2) {
        room.game.end();
      }
    });
  });
}