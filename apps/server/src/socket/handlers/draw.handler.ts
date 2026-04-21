import type { Server, Socket } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents, DrawStroke } from '@skribbl/shared';
import { RoomManager } from '../../game/RoomManager.js';

type TypedIO = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerDrawHandlers(io: TypedIO, socket: TypedSocket): void {
  socket.on('draw_start', (data) => {
    const found = RoomManager.findRoomBySocketId(socket.id);
    if (!found || !found.player) return;

    const { room, player } = found;

    if (!player.isDrawing || !room.game || room.game.phase !== 'drawing') return;

    // Start a new stroke
    room.game.currentStroke = {
      points: [{ x: data.x, y: data.y }],
      color: data.color,
      size: data.size,
      tool: data.tool,
    };

    socket.to(room.id).emit('draw_start', data);
  });

  socket.on('draw_move', (data) => {
    const found = RoomManager.findRoomBySocketId(socket.id);
    if (!found || !found.player) return;

    const { room, player } = found;

    if (!player.isDrawing || !room.game || room.game.phase !== 'drawing') return;

    if (room.game.currentStroke) {
      room.game.currentStroke.points.push({ x: data.x, y: data.y });
    }

    socket.to(room.id).emit('draw_move', data);
  });

  socket.on('draw_end', () => {
    const found = RoomManager.findRoomBySocketId(socket.id);
    if (!found || !found.player) return;

    const { room, player } = found;

    if (!player.isDrawing || !room.game) return;

    if (room.game.currentStroke) {
      room.game.strokes.push(room.game.currentStroke);
      room.game.currentStroke = null;
    }

    socket.to(room.id).emit('draw_end');
  });

  socket.on('canvas_clear', () => {
    const found = RoomManager.findRoomBySocketId(socket.id);
    if (!found || !found.player) return;

    const { room, player } = found;

    if (!player.isDrawing || !room.game) return;

    room.game.strokes = [];
    room.game.currentStroke = null;

    socket.to(room.id).emit('canvas_clear');
  });

  socket.on('draw_undo', () => {
    const found = RoomManager.findRoomBySocketId(socket.id);
    if (!found || !found.player) return;

    const { room, player } = found;

    if (!player.isDrawing || !room.game) return;

    room.game.strokes.pop();

    io.to(room.id).emit('draw_undo', { strokes: room.game.strokes });
  });
}