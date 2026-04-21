import { Router } from 'express';
import { RoomManager } from '../game/RoomManager.js';

const router: Router = Router();

router.get('/room/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const room = RoomManager.getRoomByCode(code);

  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  res.json({
    id: room.id,
    code: room.code,
    playerCount: room.players.size,
    maxPlayers: room.settings.maxPlayers,
    status: room.game ? room.game.phase : 'waiting',
    isPrivate: room.settings.isPrivate,
  });
});

router.get('/rooms/public', (_req, res) => {
  const publicRooms = RoomManager.getPublicRooms().map((room) => ({
    id: room.id,
    code: room.code,
    playerCount: room.players.size,
    maxPlayers: room.settings.maxPlayers,
    hostName: Array.from(room.players.values()).find((p) => p.isHost)?.name || 'Unknown',
  }));

  res.json({ rooms: publicRooms });
});

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    rooms: RoomManager.getRoomCount(),
    timestamp: new Date().toISOString(),
  });
});

export default router;