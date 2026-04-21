import type { Server, Socket } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents, ChatMessage } from '@skribbl/shared';
import { RoomManager } from '../../game/RoomManager.js';
import { nanoid } from 'nanoid';

type TypedIO = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerChatHandlers(io: TypedIO, socket: TypedSocket): void {
  socket.on('guess', (data) => {
    const found = RoomManager.findRoomBySocketId(socket.id);
    if (!found || !found.player) return;

    const { room, player } = found;

    if (!data.text || data.text.trim().length === 0) return;

    const text = data.text.trim();

    // If game is in drawing phase, check the guess
    if (
      room.game &&
      room.game.phase === 'drawing' &&
      !player.isDrawing &&
      !player.hasGuessed
    ) {
      const correct = room.game.checkGuess(player.id, text);

      if (!correct) {
        // Show the wrong guess as a chat message to everyone
        const msg: ChatMessage = {
          id: nanoid(8),
          playerId: player.id,
          playerName: player.name,
          text,
          isSystem: false,
          isCorrectGuess: false,
          timestamp: Date.now(),
        };
        if (room.game) room.game.messages.push(msg);
        io.to(room.id).emit('chat_message', msg);
      }
      // If correct, the Game.checkGuess already emitted the events
      return;
    }

    // If player already guessed or is drawing, don't reveal the word
    if (room.game && room.game.phase === 'drawing' && (player.hasGuessed || player.isDrawing)) {
      // Still send as chat but only show to other guessed players / drawer
      // For simplicity, we'll just block it
      return;
    }

    // If not in a game, just treat as chat
    const msg: ChatMessage = {
      id: nanoid(8),
      playerId: player.id,
      playerName: player.name,
      text,
      isSystem: false,
      isCorrectGuess: false,
      timestamp: Date.now(),
    };
    if (room.game) room.game.messages.push(msg);
    io.to(room.id).emit('chat_message', msg);
  });

  socket.on('chat', (data) => {
    const found = RoomManager.findRoomBySocketId(socket.id);
    if (!found || !found.player) return;

    const { room, player } = found;

    if (!data.text || data.text.trim().length === 0) return;

    // During drawing phase, drawer can't chat (might reveal word)
    if (
      room.game &&
      room.game.phase === 'drawing' &&
      player.isDrawing
    ) {
      return;
    }

    const msg: ChatMessage = {
      id: nanoid(8),
      playerId: player.id,
      playerName: player.name,
      text: data.text.trim().slice(0, 200),
      isSystem: false,
      isCorrectGuess: false,
      timestamp: Date.now(),
    };
    if (room.game) room.game.messages.push(msg);
    io.to(room.id).emit('chat_message', msg);
  });
}