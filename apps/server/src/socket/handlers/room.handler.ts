import type { Server, Socket } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents } from '@skribbl/shared';
import { RoomManager } from '../../game/RoomManager.js';
import { Player } from '../../game/Player.js';
import { nanoid } from 'nanoid';
import { HistoryManager } from '../../game/HistoryManager.js';

type TypedIO = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerRoomHandlers(io: TypedIO, socket: TypedSocket): void {
  socket.on('create_room', (data) => {
    const { playerName, avatar, settings } = data;

    if (!playerName || playerName.trim().length === 0) {
      socket.emit('error_message', { message: 'Player name is required' });
      return;
    }

    const playerId = nanoid(12);
    const room = RoomManager.createRoom(playerId, settings, io);

    const player = new Player(
      playerId,
      socket.id,
      playerName.trim().slice(0, 20),
      avatar,
      true
    );

    room.addPlayer(player);
    socket.join(room.id);

    // Store player info on socket for easy lookup
    (socket as Socket & { playerId?: string; roomId?: string }).playerId = playerId;
    (socket as Socket & { playerId?: string; roomId?: string }).roomId = room.id;

    socket.emit('room_created', { roomId: room.id, code: room.code });
    socket.emit('room_joined', {
      roomId: room.id,
      code: room.code,
      players: room.getPlayersData(),
      settings: room.settings,
      hostId: room.hostId,
    });

    console.log(
      `[Room] Created: ${room.code} by ${playerName} (${playerId})`
    );
  });

  socket.on('join_room', (data) => {
    const { code, playerName, avatar } = data;

    if (!playerName || playerName.trim().length === 0) {
      socket.emit('error_message', { message: 'Player name is required' });
      return;
    }

    if (!code || code.trim().length === 0) {
      socket.emit('error_message', { message: 'Room code is required' });
      return;
    }

    const room = RoomManager.getRoomByCode(code.trim().toUpperCase());
    if (!room) {
      socket.emit('error_message', { message: 'Room not found' });
      return;
    }

    if (room.players.size >= room.settings.maxPlayers) {
      socket.emit('error_message', { message: 'Room is full' });
      return;
    }

    const playerId = nanoid(12);
    const player = new Player(
      playerId,
      socket.id,
      playerName.trim().slice(0, 20),
      avatar,
      false
    );

    const added = room.addPlayer(player);
    if (!added) {
      socket.emit('error_message', { message: 'Could not join room' });
      return;
    }

    socket.join(room.id);
    (socket as Socket & { playerId?: string; roomId?: string }).playerId = playerId;
    (socket as Socket & { playerId?: string; roomId?: string }).roomId = room.id;

    socket.emit('room_joined', {
      roomId: room.id,
      code: room.code,
      players: room.getPlayersData(),
      settings: room.settings,
      hostId: room.hostId,
    });

    // Notify everyone else
    socket.to(room.id).emit('player_joined', { player: player.toData() });

    const systemMsg = room.addSystemMessage(
      `${playerName.trim()} joined the game`
    );
    io.to(room.id).emit('chat_message', systemMsg);

    // If game is in progress, send current state
    if (room.game && room.game.phase !== 'waiting') {
      socket.emit('game_state', {
        phase: room.game.phase,
        round: room.game.currentRound,
        totalRounds: room.game.totalRounds,
        drawerId: Array.from(room.players.values()).find((p) => p.isDrawing)?.id || '',
        drawerName: Array.from(room.players.values()).find((p) => p.isDrawing)?.name || '',
        currentWord: '',
        hints: room.game.getHintsForPlayer(playerId),
        timeLeft: room.game.timeLeft,
        turnIndex: room.game.turnIndex,
        totalTurns: room.game.turnOrder.length,
        players: room.getPlayersData(),
        settings: room.settings,
        hostId: room.hostId,
        messages: room.game.messages,
        strokes: room.game.strokes,
      });
    }

    console.log(
      `[Room] ${playerName} joined ${room.code} (${room.players.size} players)`
    );
  });

  socket.on('leave_room', () => {
    const found = RoomManager.findRoomBySocketId(socket.id);
    if (!found || !found.player) return;

    const { room, player } = found;
    const removedPlayer = room.removePlayer(player.id);

    socket.leave(room.id);

    if (room.isEmpty()) {
      RoomManager.deleteRoom(room.id);
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

    if (
      room.game &&
      room.game.phase === 'drawing' &&
      player.isDrawing
    ) {
      room.game.endTurn();
    }
  });

  socket.on('update_settings', (data) => {
    const found = RoomManager.findRoomBySocketId(socket.id);
    if (!found || !found.player) return;

    const { room, player } = found;

    if (room.hostId !== player.id) {
      socket.emit('error_message', {
        message: 'Only the host can update settings',
      });
      return;
    }

    room.updateSettings(data.settings);
    io.to(room.id).emit('settings_updated', { settings: room.settings });
  });

  socket.on('list_rooms', () => {
    const publicRooms = RoomManager.getPublicRooms().map(room => ({
      code: room.code,
      hostName: room.players.get(room.hostId)?.name || 'Unknown',
      playerCount: room.players.size,
      maxPlayers: room.settings.maxPlayers,
      status: (room.game && room.game.phase !== 'waiting' ? 'playing' : 'waiting') as 'playing' | 'waiting',
      rounds: room.settings.totalRounds,
      drawTime: room.settings.drawTime
    }));
    socket.emit('public_rooms_list', { rooms: publicRooms });
  });

  socket.on('get_leaderboard', async () => {
    const leaderboard = await HistoryManager.getTopPlayers();
    socket.emit('leaderboard_data', { leaderboard });
  });

  socket.on('kick_player', (data) => {
    const found = RoomManager.findRoomBySocketId(socket.id);
    if (!found || !found.player) return;
    const { room, player } = found;

    // Only host can kick
    if (room.hostId !== player.id) return;

    // Cannot kick yourself
    if (data.playerId === player.id) return;

    const targetPlayer = room.players.get(data.playerId);
    if (!targetPlayer) return;

    // Notify the target that they were kicked
    const targetSocket = io.sockets.sockets.get(targetPlayer.socketId);
    if (targetSocket) {
      targetSocket.emit('kicked_from_room');
      targetSocket.leave(room.id);
      
      // Clean up metadata
      delete (targetSocket as any).roomId;
      delete (targetSocket as any).playerId;
    }

    const removedPlayer = room.removePlayer(data.playerId);

    if (removedPlayer) {
      const systemMsg = room.addSystemMessage(
        `${removedPlayer.name} was kicked from the room`
      );
      io.to(room.id).emit('chat_message', systemMsg);
      io.to(room.id).emit('player_left', {
        playerId: removedPlayer.id,
        newHostId: room.hostId, // host didn't change
      });
    }

    if (room.game && room.game.phase === 'drawing' && targetPlayer.isDrawing) {
      room.game.endTurn();
    }
  });
}