import type { Server, Socket } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents } from '@skribbl/shared';
import { RoomManager } from '../../game/RoomManager.js';

type TypedIO = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerGameHandlers(io: TypedIO, socket: TypedSocket): void {
  socket.on('start_game', () => {
    const found = RoomManager.findRoomBySocketId(socket.id);
    if (!found || !found.player) return;

    const { room, player } = found;

    if (room.hostId !== player.id) {
      socket.emit('error_message', {
        message: 'Only the host can start the game',
      });
      return;
    }

    if (room.players.size < 2) {
      socket.emit('error_message', {
        message: 'Need at least 2 players to start',
      });
      return;
    }

    if (room.game && room.game.phase !== 'waiting' && room.game.phase !== 'game_over') {
      socket.emit('error_message', { message: 'Game is already in progress' });
      return;
    }

    room.startGame();
    console.log(`[Game] Started in room ${room.code}`);
  });

  socket.on('word_chosen', (data) => {
    const found = RoomManager.findRoomBySocketId(socket.id);
    if (!found || !found.player) return;

    const { room, player } = found;

    if (
      !room.game ||
      room.game.phase !== 'choosing' ||
      !player.isDrawing
    ) {
      return;
    }

    room.game.chooseWord(data.word);
    console.log(`[Game] Word chosen in room ${room.code}: ${data.word}`);
  });

  socket.on('request_game_state', () => {
    const found = RoomManager.findRoomBySocketId(socket.id);
    if (!found || !found.player) return;

    const { room, player } = found;
    if (!room.game) return;

    const drawer = Array.from(room.players.values()).find((p) => p.isDrawing);

    socket.emit('game_state', {
      phase: room.game.phase,
      round: room.game.currentRound,
      totalRounds: room.game.totalRounds,
      drawerId: drawer?.id || '',
      drawerName: drawer?.name || '',
      currentWord: player.isDrawing ? room.game.currentWord : '',
      hints: room.game.getHintsForPlayer(player.id),
      timeLeft: room.game.timeLeft,
      turnIndex: room.game.turnIndex,
      totalTurns: room.game.turnOrder.length,
      players: room.getPlayersData(),
      settings: room.settings,
      hostId: room.hostId,
      messages: room.game.messages,
      strokes: room.game.strokes,
    });
  });
}